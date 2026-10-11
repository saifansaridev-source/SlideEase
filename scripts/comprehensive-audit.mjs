/**
 * SLIDEEASE — EXTENDED LIVE API AUDIT SUITE (Phase 2)
 * Tests all key customer-facing and admin APIs against the live server.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[trimmed.substring(0, idx).trim()] = val;
    }
  }
});

const BASE_URL = 'http://localhost:3000';
const SESSION_SECRET = env.SESSION_SECRET || 'slideease_artisan_secret_key_2026_dev_fallback';

function makeSignedToken(payload) {
  const iat = Date.now();
  const exp = iat + 7 * 24 * 60 * 60 * 1000;
  const data = JSON.stringify({ ...payload, iat, exp });
  const dataB64 = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${signature}`;
}

const adminToken = makeSignedToken({ email: 'admin@slideease.com', role: 'admin', name: 'Admin' });
const customerToken = makeSignedToken({ email: 'testcustomer@slideease.com', role: 'customer', name: 'Customer' });

const results = [];
let pass = 0, fail = 0, warn = 0;

async function test(name, category, fn) {
  try {
    const res = await fn();
    const status = res.status || 'PASS';
    results.push({ name, category, status, details: res.details });
    if (status === 'PASS') {
      pass++;
      console.log(`  ✅ [${category}] ${name}: ${res.details}`);
    } else if (status === 'WARN' || status === 'TESTED' || status === 'RISK') {
      warn++;
      console.log(`  ⚠️  [${category}] ${name}: ${res.details}`);
    } else {
      fail++;
      console.log(`  ❌ [${category}] ${name}: ${res.details}`);
    }
  } catch (err) {
    fail++;
    results.push({ name, category, status: 'FAIL', details: err.message });
    console.log(`  ❌ [${category}] ${name}: ${err.message}`);
  }
}

async function runAudit() {
  console.log('='.repeat(70));
  console.log('SLIDEEASE EXTENDED LIVE API AUDIT SUITE — PHASE 2');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  // ================================================================
  // SECTION 1: SECURITY — ADMIN ROUTE GUARDS
  // ================================================================
  console.log('\n📍 SECTION 1: ADMIN ROUTE AUTH GUARDS');
  
  const adminRoutes = [
    '/api/admin/stats', '/api/admin/orders', '/api/admin/products',
    '/api/admin/users', '/api/admin/coupons', '/api/admin/reviews',
    '/api/admin/returns', '/api/admin/shipping-tax', '/api/admin/upload'
  ];
  
  for (const route of adminRoutes) {
    await test(`Guest access blocked: ${route}`, 'Security', async () => {
      const res = await fetch(`${BASE_URL}${route}`, { method: 'GET' });
      return {
        status: res.status === 401 ? 'PASS' : 'FAIL',
        details: `HTTP ${res.status} (Expected 401)`
      };
    });
  }

  // ================================================================
  // SECTION 2: PRODUCT CATALOG
  // ================================================================
  console.log('\n📍 SECTION 2: PRODUCT CATALOG APIs');
  
  let firstProductId = null;
  
  await test('GET /api/products returns products list', 'Products', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    const json = await res.json();
    // API returns json.data (not json.products)
    const prods = json.data || json.products || [];
    if (json.success && prods.length > 0) firstProductId = prods[0]?.id || prods[0]?._id;
    return {
      status: json.success && Array.isArray(prods) && prods.length > 0 ? 'PASS' : 'FAIL',
      details: `success=${json.success}, count=${prods.length}, firstId=${firstProductId}`
    };
  });

  await test('Products have valid price, stock, and sizeStock', 'Products', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    const json = await res.json();
    const prods = json.data || json.products || [];
    let issues = [];
    for (const p of prods) {
      if (!p.price || p.price <= 0) issues.push(`${p.name}: missing price`);
      if (!p.sizeStock && !p.stockQty) issues.push(`${p.name}: no stock info`);
      if (p.sizeStock) {
        const allZero = Object.values(p.sizeStock).every(v => v <= 0);
        if (allZero) issues.push(`${p.name}: all sizes at 0 stock`);
      }
    }
    return {
      status: issues.length === 0 ? 'PASS' : 'FAIL',
      details: issues.length === 0 ? `All ${prods.length} products have valid price + stock` : issues.slice(0, 3).join(' | ')
    };
  });

  // ================================================================
  // SECTION 3: COUPON VALIDATION
  // ================================================================
  console.log('\n📍 SECTION 3: COUPON VALIDATION');
  
  await test('Valid coupon SLIDEEASE10 returns 10% discount', 'Coupons', async () => {
    const res = await fetch(`${BASE_URL}/api/coupons/validate?code=SLIDEEASE10&subtotal=1500`);
    const json = await res.json();
    return {
      status: json.success && json.discount > 0 ? 'PASS' : 'FAIL',
      details: `success=${json.success}, discount=${json.discount}, type=${json.type}`
    };
  });
  
  await test('Invalid coupon returns 404', 'Coupons', async () => {
    const res = await fetch(`${BASE_URL}/api/coupons/validate?code=FAKECOUPON999`);
    const json = await res.json();
    return {
      status: res.status === 404 || res.status === 400 ? 'PASS' : 'FAIL',
      details: `HTTP ${res.status}, error="${json.error}"`
    };
  });

  // ================================================================
  // SECTION 4: CART APIs
  // ================================================================
  console.log('\n📍 SECTION 4: CART APIs');
  
  await test('GET /api/cart without auth returns empty cart (not crash)', 'Cart', async () => {
    const res = await fetch(`${BASE_URL}/api/cart`);
    return {
      status: res.status === 200 || res.status === 401 ? 'PASS' : 'FAIL',
      details: `HTTP ${res.status}`
    };
  });

  // ================================================================
  // SECTION 5: SHIPPING SETTINGS
  // ================================================================
  console.log('\n📍 SECTION 5: SHIPPING SETTINGS');
  
  await test('GET /api/shipping-settings returns complete config', 'Shipping', async () => {
    const res = await fetch(`${BASE_URL}/api/shipping-settings`);
    const json = await res.json();
    const hasAll = json.success && json.data && 
      json.data.freeShippingThreshold !== undefined &&
      json.data.codCharge !== undefined &&
      json.data.taxRate !== undefined;
    return {
      status: hasAll ? 'PASS' : 'FAIL',
      details: `success=${json.success}, threshold=₹${json.data?.freeShippingThreshold}, codCharge=₹${json.data?.codCharge}, taxRate=${json.data?.taxRate}%`
    };
  });

  // ================================================================
  // SECTION 6: COD ORDER FLOW (end-to-end without real payment)
  // ================================================================
  console.log('\n📍 SECTION 6: COD ORDER FLOW');
  
  let testOrderId = null;
  await test('POST /api/checkout/verify with COD creates order', 'Orders', async () => {
    if (!firstProductId) return { status: 'WARN', details: 'No product ID available — skipping' };
    const res = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: true,
        orderData: {
          firstName: 'Audit',
          lastName: 'Tester',
          email: 'audit_tester_cod@slideease.com',
          phone: '+91 9000000001',
          address: '123 Test Street, Bandra',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400050',
          shippingMethod: 'standard',
          items: [{ productId: firstProductId, id: firstProductId, size: '8', quantity: 1 }]
        }
      })
    });
    const json = await res.json();
    if (json.success) testOrderId = json.orderId;
    return {
      status: json.success ? 'PASS' : 'FAIL',
      details: `success=${json.success}, orderId=${json.orderId || 'N/A'}, orderNumber=${json.orderNumber || 'N/A'}, error=${json.error || 'none'}`
    };
  });

  await test('Order created via COD is retrievable by ID', 'Orders', async () => {
    if (!testOrderId) return { status: 'WARN', details: 'No test order ID — COD flow failed upstream' };
    const res = await fetch(`${BASE_URL}/api/orders/${testOrderId}`);
    const json = await res.json();
    return {
      status: json.success && json.order ? 'PASS' : 'FAIL',
      details: `success=${json.success}, status=${json.order?.status}, paymentMethod=${json.order?.payment?.method}`
    };
  });

  // ================================================================
  // SECTION 7: ADMIN AUTHENTICATED ENDPOINTS
  // ================================================================
  console.log('\n📍 SECTION 7: ADMIN AUTHENTICATED ENDPOINT ACCESS');
  
  await test('Admin can access /api/admin/stats with valid token', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: `slidex_session=${adminToken}` }
    });
    const json = await res.json();
    return {
      status: json.success ? 'PASS' : 'FAIL',
      details: `success=${json.success}, totalOrders=${json.data?.totalOrders}, totalRevenue=₹${json.data?.totalRevenue}`
    };
  });

  await test('Admin can list all orders', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: { Cookie: `slidex_session=${adminToken}` }
    });
    const json = await res.json();
    return {
      status: json.success ? 'PASS' : 'FAIL',
      details: `success=${json.success}, count=${json.data?.length || 0}`
    };
  });

  await test('Admin can list all products', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      headers: { Cookie: `slidex_session=${adminToken}` }
    });
    const json = await res.json();
    return {
      status: json.success ? 'PASS' : 'FAIL',
      details: `success=${json.success}, count=${json.data?.length || 0}`
    };
  });

  await test('Admin can list all coupons', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/coupons`, {
      headers: { Cookie: `slidex_session=${adminToken}` }
    });
    const json = await res.json();
    return {
      status: json.success ? 'PASS' : 'FAIL',
      details: `success=${json.success}, count=${json.data?.length || 0}`
    };
  });
  
  await test('Admin can access shipping-tax settings', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/shipping-tax`, {
      headers: { Cookie: `slidex_session=${adminToken}` }
    });
    const json = await res.json();
    return {
      status: json.success && json.data?.freeShippingThreshold !== undefined ? 'PASS' : 'FAIL',
      details: `success=${json.success}, codCharge=₹${json.data?.codCharge}, taxRate=${json.data?.taxRate}%`
    };
  });

  await test('Admin can list all users (passwords excluded)', 'Admin', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: `slidex_session=${adminToken}` }
    });
    const json = await res.json();
    const hasPasswords = json.data?.some(u => u.passwordHash);
    return {
      status: json.success && !hasPasswords ? 'PASS' : (hasPasswords ? 'VULNERABILITY' : 'FAIL'),
      details: `success=${json.success}, count=${json.data?.length || 0}, passwordsLeaked=${hasPasswords ? 'YES!' : 'NO'}`
    };
  });

  // ================================================================
  // SECTION 8: ORDER STATUS UPDATE (Admin)
  // ================================================================
  console.log('\n📍 SECTION 8: ADMIN ORDER STATUS UPDATE');
  
  await test('Admin can update order status to shipped', 'Admin', async () => {
    if (!testOrderId) return { status: 'WARN', details: 'No test order available' };
    const res = await fetch(`${BASE_URL}/api/admin/orders`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Cookie: `slidex_session=${adminToken}` 
      },
      body: JSON.stringify({
        orderId: testOrderId,
        status: 'shipped',
        courierName: 'DTDC',
        trackingNumber: 'DTDC123456789'
      })
    });
    const json = await res.json();
    return {
      status: json.success ? 'PASS' : 'FAIL',
      details: `success=${json.success}, message=${json.message || json.error}`
    };
  });

  // ================================================================
  // SECTION 9: PAYMENT SECURITY TESTS
  // ================================================================
  console.log('\n📍 SECTION 9: PAYMENT SECURITY VERIFICATION');

  await test('Tampered Razorpay signature rejected (400)', 'Payment', async () => {
    const res = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'order_FAKEOID123',
        razorpay_payment_id: 'pay_FAKEPAY123',
        razorpay_signature: 'invalid_tampered_signature_xyz',
        orderData: {
          email: 'fraud@evil.com',
          items: [{ productId: 'prod-01', size: '8', quantity: 1 }]
        },
        isCod: false
      })
    });
    const json = await res.json();
    return {
      status: res.status === 400 && !json.success ? 'PASS' : 'VULNERABILITY',
      details: `HTTP ${res.status}, error="${json.error}"`
    };
  });

  await test('Direct order creation cannot self-mark as Paid', 'Payment', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { email: 'fraudtest@evil.com', firstName: 'Fraud', lastName: 'Test' },
        items: [{ id: 'prod-01', name: 'Loafer', price: 1499, qty: 1, size: '8' }],
        payment: { status: 'Paid', method: 'Razorpay Online' }
      })
    });
    const json = await res.json();
    const isMarkedPaid = json.order && json.order.payment?.status === 'Paid';
    return {
      status: isMarkedPaid ? 'VULNERABILITY' : 'PASS',
      details: `Order payment status in response: "${json.order?.payment?.status || 'N/A'}" (should be "Pending")`
    };
  });

  // ================================================================
  // SECTION 10: BLOG & PUBLIC APIs
  // ================================================================
  console.log('\n📍 SECTION 10: PUBLIC CONTENT APIs');

  await test('GET /api/blogs returns blog posts', 'Content', async () => {
    const res = await fetch(`${BASE_URL}/api/blogs`);
    const json = await res.json();
    return {
      status: res.status === 200 ? 'PASS' : 'WARN',
      details: `HTTP ${res.status}, success=${json.success}, count=${json.blogs?.length || json.data?.length || 0}`
    };
  });

  await test('GET /api/hero-banner returns banner config', 'Content', async () => {
    const res = await fetch(`${BASE_URL}/api/hero-banner`);
    const json = await res.json();
    return {
      status: res.status === 200 ? 'PASS' : 'WARN',
      details: `HTTP ${res.status}, success=${json.success}`
    };
  });

  await test('GET /api/settings returns public store settings', 'Content', async () => {
    const res = await fetch(`${BASE_URL}/api/settings`);
    const json = await res.json();
    return {
      status: res.status === 200 ? 'PASS' : 'WARN',
      details: `HTTP ${res.status}, success=${json.success}`
    };
  });

  // ================================================================
  // SECTION 11: CLEANUP — DELETE TEST ORDER
  // ================================================================
  if (testOrderId) {
    console.log('\n📍 SECTION 11: CLEANUP TEST DATA');
    await test('Delete COD test order from DB', 'Cleanup', async () => {
      const { MongoClient } = await import('mongodb');
      const { ObjectId } = await import('mongodb');
      const client = new MongoClient(env.MONGODB_URI);
      await client.connect();
      const db = client.db(env.MONGODB_DB || 'startupbiz');
      const del = await db.collection('orders').deleteOne({ _id: new ObjectId(testOrderId) });
      // Restore stock if it was deducted
      await db.collection('products').updateMany(
        { 'sizeStock.8': { $exists: true } },
        { $inc: {} } // noop unless we track exact deductions
      );
      await client.close();
      return {
        status: del.deletedCount > 0 ? 'PASS' : 'WARN',
        details: `Deleted ${del.deletedCount} test order(s). Stock deduction from COD test will be visible in inventory.`
      };
    });
  }

  // ================================================================
  // SUMMARY REPORT
  // ================================================================
  console.log('\n' + '='.repeat(70));
  console.log('AUDIT COMPLETE — SUMMARY REPORT');
  console.log('='.repeat(70));
  console.log(`✅ PASS:     ${pass}`);
  console.log(`⚠️  WARN:     ${warn}`);
  console.log(`❌ FAIL:     ${fail}`);
  console.log(`📊 TOTAL:    ${results.length}`);
  console.log('='.repeat(70));
  
  const failures = results.filter(r => r.status === 'FAIL' || r.status === 'VULNERABILITY' || r.status === 'CRITICAL_VULNERABILITY');
  if (failures.length > 0) {
    console.log('\n🚨 FAILURES & VULNERABILITIES:');
    failures.forEach(f => console.log(`  [${f.status}] [${f.category}] ${f.name}: ${f.details}`));
  } else {
    console.log('\n🎉 ALL TESTS PASSED! No critical failures or vulnerabilities detected.');
  }
  
  const warnings = results.filter(r => r.status === 'WARN' || r.status === 'RISK');
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(w => console.log(`  [${w.status}] [${w.category}] ${w.name}: ${w.details}`));
  }
}

runAudit().catch(err => {
  console.error('\n[AUDIT RUNNER FATAL ERROR]', err.message);
  process.exit(1);
});
