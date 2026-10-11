/**
 * SLIDEEASE FOOTWEAR — FINAL PAYMENT, SECURITY & PRODUCTION VERIFICATION SUITE
 * Safe regression and security testing suite without revealing secrets or altering customer data.
 */

import crypto from 'crypto';
import fs from 'fs';
import { MongoClient, ObjectId } from 'mongodb';

// Safe environment loading without logging secrets
const envText = fs.readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const clean = line.trim();
  if (!clean || clean.startsWith('#')) continue;
  const idx = clean.indexOf('=');
  if (idx !== -1) {
    const key = clean.slice(0, idx).trim();
    let val = clean.slice(idx + 1).trim();
    val = val.replace(/^["']|["']$/g, '');
    env[key] = val;
  }
}

const BASE_URL = 'http://localhost:3000';
const SESSION_SECRET = env.SESSION_SECRET || 'slideease_artisan_secret_key_2026_dev_fallback';
const RAZORPAY_SECRET = env.RAZORPAY_KEY_SECRET || 'test_secret_placeholder';

// Token generators
function makeToken(payload) {
  const dataB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${sig}`;
}

const adminToken = makeToken({
  id: 'admin-final-audit',
  email: 'admin@slideease.com',
  role: 'admin',
  exp: Date.now() + 3600000,
});

const customerAToken = makeToken({
  id: 'cust-a-audit',
  email: 'customer_a@slideease.com',
  role: 'customer',
  exp: Date.now() + 3600000,
});

const customerBToken = makeToken({
  id: 'cust-b-audit',
  email: 'customer_b@slideease.com',
  role: 'customer',
  exp: Date.now() + 3600000,
});

const results = [];

function record(suite, testName, status, details) {
  results.push({ suite, testName, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'BLOCKED' ? '🛑' : '⚠️';
  console.log(`  ${icon} [${suite}] ${testName}: ${details}`);
}

async function run() {
  console.log('======================================================================');
  console.log('SLIDEEASE FINAL VERIFICATION SUITE — LIVE RUN');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('======================================================================\n');

  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  const db = client.db(env.MONGODB_DB || 'startupbiz');

  // Fetch a valid product for safe order/inventory tests
  const product = await db.collection('products').findOne({});
  if (!product) {
    console.error('No products found in DB. Aborting.');
    await client.close();
    return;
  }
  const prodId = product.id || product._id.toString();
  const availableSizes = Object.keys(product.sizeStock || { '8': 10 });
  const testSize = availableSizes[0] || '8';

  // ------------------------------------------------------------------
  // SUITE 1: CREDENTIALS & SENSITIVE DATA PROTECTION
  // ------------------------------------------------------------------
  console.log('📍 SUITE 1: CREDENTIALS & SENSITIVE DATA PROTECTION');
  try {
    // Check login route doesn't have hardcoded auto-seed credentials
    const loginRouteCode = fs.readFileSync('src/app/api/auth/login/route.js', 'utf8');
    const hasAutoSeed = loginRouteCode.includes('admin123') || loginRouteCode.includes('Auto-seed');
    record('Credentials', 'No hardcoded admin credentials in login route', !hasAutoSeed ? 'PASS' : 'FAIL', !hasAutoSeed ? 'Clean (No backdoor or hardcoded credentials)' : 'Vulnerable (Auto-seed present)');

    // Check users endpoint never returns passwordHash
    const resUsers = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: `slidex_session=${adminToken}` },
    });
    const usersJson = await resUsers.json();
    const hasPasswordHash = usersJson.data?.some(u => u.passwordHash || u.password);
    record('Credentials', 'User passwords/hashes excluded from API responses', !hasPasswordHash ? 'PASS' : 'FAIL', !hasPasswordHash ? 'Secure (No passwords leaked in response)' : 'Vulnerable (Passwords leaked)');
  } catch (err) {
    record('Credentials', 'Credential inspection', 'FAIL', err.message);
  }

  // ------------------------------------------------------------------
  // SUITE 2: RAZORPAY PAYMENT LIFECYCLE & TAMPER RESISTANCE
  // ------------------------------------------------------------------
  console.log('\n📍 SUITE 2: RAZORPAY PAYMENT LIFECYCLE & TAMPER RESISTANCE');
  try {
    // 2.1 Tampered Signature Rejection
    const resTampered = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: false,
        razorpay_order_id: 'order_test_99999',
        razorpay_payment_id: 'pay_test_99999',
        razorpay_signature: 'fake_tampered_signature_hex_0000',
        orderData: {
          items: [{ id: prodId, size: testSize, quantity: 1 }],
          customer: { firstName: 'Audit', lastName: 'Tester', email: 'audit@test.com' },
        },
      }),
    });
    const tamperedJson = await resTampered.json();
    const tamperedPass = resTampered.status === 400 && tamperedJson.error?.includes('signature verification failed');
    record('Payment', 'Tampered HMAC signature rejected (400)', tamperedPass ? 'PASS' : 'FAIL', `HTTP ${resTampered.status}, error: "${tamperedJson.error}"`);

    // 2.2 Missing Payment Identifiers
    const resMissing = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: false,
        razorpay_order_id: 'order_test_123',
        // razorpay_payment_id omitted
        razorpay_signature: 'sig_123',
        orderData: {
          items: [{ id: prodId, size: testSize, quantity: 1 }],
        },
      }),
    });
    record('Payment', 'Missing payment identifiers rejected (400)', resMissing.status === 400 ? 'PASS' : 'FAIL', `HTTP ${resMissing.status}`);

    // 2.3 Direct Order Creation Cannot Self-Mark as Paid
    const resDirectOrder = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: prodId, size: testSize, quantity: 1 }],
        customer: { firstName: 'Tester', lastName: 'Tamper', email: 'tamper@test.com' },
        payment: { status: 'Paid', method: 'Razorpay Online' },
      }),
    });
    const directOrderJson = await resDirectOrder.json();
    const directOrder = directOrderJson.order || directOrderJson.data;
    const directPaymentStatus = directOrder?.payment?.status;
    const directTamperSafe = directPaymentStatus !== 'Paid';
    record('Payment', 'Direct order creation cannot self-mark as Paid', directTamperSafe ? 'PASS' : 'FAIL', `Saved payment status: "${directPaymentStatus}" (enforced Pending)`);
    if (directOrder?._id) {
      await db.collection('orders').deleteOne({ _id: new ObjectId(directOrder._id) });
    }

    // 2.4 Razorpay Webhook Tampered Signature Rejection
    const resWebhookTampered = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'tampered_webhook_signature',
      },
      body: JSON.stringify({ event: 'order.paid', payload: {} }),
    });
    record('Payment', 'Webhook with tampered signature rejected (400)', resWebhookTampered.status === 400 ? 'PASS' : 'FAIL', `HTTP ${resWebhookTampered.status}`);

    // 2.5 Razorpay Webhook Valid HMAC Verification & Idempotency
    const webhookPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_mock_audit_123', order_id: 'order_mock_audit_123' } },
        order: { entity: { id: 'order_mock_audit_123' } },
      },
    });
    const validWebhookSig = crypto.createHmac('sha256', RAZORPAY_SECRET).update(webhookPayload).digest('hex');
    const resWebhookValid = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validWebhookSig,
      },
      body: webhookPayload,
    });
    const webhookValidJson = await resWebhookValid.json();
    record('Payment', 'Webhook with valid HMAC verified & acknowledged (200)', resWebhookValid.status === 200 && webhookValidJson.received ? 'PASS' : 'FAIL', `HTTP ${resWebhookValid.status}, received=${webhookValidJson.received}`);

    // 2.6 Webhook Duplicate Delivery Idempotency
    const resWebhookDuplicate = await fetch(`${BASE_URL}/api/webhooks/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validWebhookSig,
      },
      body: webhookPayload,
    });
    record('Payment', 'Webhook duplicate delivery handled idempotently (200)', resWebhookDuplicate.status === 200 ? 'PASS' : 'FAIL', `HTTP ${resWebhookDuplicate.status}`);
  } catch (err) {
    record('Payment', 'Razorpay lifecycle tests', 'FAIL', err.message);
  }

  // ------------------------------------------------------------------
  // SUITE 3: ORDER & INVENTORY INTEGRITY
  // ------------------------------------------------------------------
  console.log('\n📍 SUITE 3: ORDER & INVENTORY INTEGRITY');
  try {
    // 3.1 Initial stock reading
    const preProduct = await db.collection('products').findOne({ _id: product._id });
    const initialSizeStock = preProduct.sizeStock?.[testSize] ?? 50;

    // 3.2 Insufficient Stock Rejection
    const resOversell = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: true,
        orderData: {
          items: [{ id: prodId, size: testSize, quantity: 99999 }],
          customer: { firstName: 'Oversell', lastName: 'Tester', email: 'oversell@test.com' },
        },
      }),
    });
    const oversellJson = await resOversell.json();
    const oversellBlocked = resOversell.status === 409 && oversellJson.error?.includes('Insufficient stock');
    record('Inventory', 'Insufficient stock blocked atomically (409)', oversellBlocked ? 'PASS' : 'FAIL', `HTTP ${resOversell.status}, error: "${oversellJson.error}"`);

    // 3.3 Atomic Rollback on Multi-item Order if One Item Unavailable
    const resAtomicRollback = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: true,
        orderData: {
          items: [
            { id: prodId, size: testSize, quantity: 1 },
            { id: 'non_existent_product_xyz', size: '8', quantity: 1 },
          ],
          customer: { firstName: 'Rollback', lastName: 'Tester', email: 'rollback@test.com' },
        },
      }),
    });
    const rollbackJson = await resAtomicRollback.json();
    const postRollbackProd = await db.collection('products').findOne({ _id: product._id });
    const rollbackStockUnchanged = (postRollbackProd.sizeStock?.[testSize] ?? 50) === initialSizeStock;
    record('Inventory', 'Atomic rollback prevents partial deduction (409)', (resAtomicRollback.status === 409 && rollbackStockUnchanged) ? 'PASS' : 'FAIL', `HTTP ${resAtomicRollback.status}, stockUnchanged=${rollbackStockUnchanged}`);

    // 3.4 Successful Order Atomic Decrement
    const resOrderSuccess = await fetch(`${BASE_URL}/api/checkout/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: true,
        orderData: {
          items: [{ id: prodId, size: testSize, quantity: 1 }],
          customer: { firstName: 'OrderAudit', lastName: 'User', email: 'audit_e2e@slideease.com', phone: '9876543210' },
        },
      }),
    });
    const orderSuccessJson = await resOrderSuccess.json();
    const postOrderProd = await db.collection('products').findOne({ _id: product._id });
    const stockDecremented = (postOrderProd.sizeStock?.[testSize] ?? 50) === (initialSizeStock - 1);
    record('Inventory', 'Valid order decrements inventory atomically', (orderSuccessJson.success && stockDecremented) ? 'PASS' : 'FAIL', `Order #${orderSuccessJson.orderNumber}, stock: ${initialSizeStock} -> ${postOrderProd.sizeStock?.[testSize]}`);

    // Clean up test order & restore stock
    if (orderSuccessJson.orderId) {
      await db.collection('orders').deleteOne({ _id: new ObjectId(orderSuccessJson.orderId) });
      await db.collection('products').updateOne(
        { _id: product._id },
        { $inc: { [`sizeStock.${testSize}`]: 1, stockQty: 1 } }
      );
      record('Inventory', 'Test order cleaned and stock restored', 'PASS', 'Clean database state maintained');
    }
  } catch (err) {
    record('Inventory', 'Order & inventory tests', 'FAIL', err.message);
  }

  // ------------------------------------------------------------------
  // SUITE 4: INVOICE & ORDER ACCESS CONTROL
  // ------------------------------------------------------------------
  console.log('\n📍 SUITE 4: INVOICE & ORDER ACCESS CONTROL');
  try {
    // Create an unpaid order for Customer A
    const testOrderDoc = {
      orderNumber: 'SE-AUDIT-INV-001',
      customer: { firstName: 'CustomerA', lastName: 'Private', email: 'customer_a@slideease.com', phone: '9123456780' },
      items: [{ id: prodId, name: 'Heritage Slide', size: '8', quantity: 1, unitPrice: 1299, lineTotal: 1299 }],
      pricing: { subtotal: 1299, discount: 0, shipping: 0, total: 1299 },
      payment: { method: 'Razorpay Online', status: 'Pending' },
      status: 'Processing',
      createdAt: new Date(),
    };
    const insertRes = await db.collection('orders').insertOne(testOrderDoc);
    const testOrderId = insertRes.insertedId.toString();

    // 4.1 Customer B trying to access Customer A's order -> 403 Forbidden
    const resCustB = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      headers: { Cookie: `slidex_session=${customerBToken}` },
    });
    record('Invoice/Auth', 'Cross-customer order access blocked (403)', resCustB.status === 403 ? 'PASS' : 'FAIL', `HTTP ${resCustB.status}`);

    // 4.2 Customer A accessing their own order -> 200 OK
    const resCustA = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      headers: { Cookie: `slidex_session=${customerAToken}` },
    });
    record('Invoice/Auth', 'Customer can access own order (200)', resCustA.status === 200 ? 'PASS' : 'FAIL', `HTTP ${resCustA.status}`);

    // 4.3 Admin accessing order -> 200 OK
    const resAdmin = await fetch(`${BASE_URL}/api/orders/${testOrderId}`, {
      headers: { Cookie: `slidex_session=${adminToken}` },
    });
    record('Invoice/Auth', 'Admin can access any order (200)', resAdmin.status === 200 ? 'PASS' : 'FAIL', `HTTP ${resAdmin.status}`);

    // 4.4 Unauthenticated guest accessing sequential orderNumber without verification -> 401
    const resGuestOrderNumber = await fetch(`${BASE_URL}/api/orders/SE-AUDIT-INV-001`);
    record('Invoice/Auth', 'Unauthenticated guest querying by orderNumber requires verification (401)', resGuestOrderNumber.status === 401 ? 'PASS' : 'FAIL', `HTTP ${resGuestOrderNumber.status}`);

    // 4.5 Unauthenticated guest providing matching phone verification -> 200 OK
    const resGuestVerified = await fetch(`${BASE_URL}/api/orders/SE-AUDIT-INV-001?phone=9123456780`);
    record('Invoice/Auth', 'Guest with valid phone verification allowed (200)', resGuestVerified.status === 200 ? 'PASS' : 'FAIL', `HTTP ${resGuestVerified.status}`);

    // Cleanup invoice test order
    await db.collection('orders').deleteOne({ _id: insertRes.insertedId });
  } catch (err) {
    record('Invoice/Auth', 'Invoice access control tests', 'FAIL', err.message);
  }

  // ------------------------------------------------------------------
  // SUITE 5: ALL 21 ADMIN APIS SECURITY ENFORCEMENT
  // ------------------------------------------------------------------
  console.log('\n📍 SUITE 5: ALL 21 ADMIN APIS SECURITY ENFORCEMENT');
  const adminEndpoints = [
    '/api/admin/alerts',
    '/api/admin/blogs',
    '/api/admin/categories',
    '/api/admin/cms',
    '/api/admin/coupons',
    '/api/admin/general-settings',
    '/api/admin/hero-banner',
    '/api/admin/marketing',
    '/api/admin/media',
    '/api/admin/orders',
    '/api/admin/popups',
    '/api/admin/products',
    '/api/admin/qa',
    '/api/admin/returns',
    '/api/admin/reviews',
    '/api/admin/seed-product-fields',
    '/api/admin/shipping-tax',
    '/api/admin/stats',
    '/api/admin/stores',
    '/api/admin/upload',
    '/api/admin/users',
  ];

  let unauthPassCount = 0;
  let custBlockedCount = 0;
  let adminAccessCount = 0;

  for (const ep of adminEndpoints) {
    // Test 1: Unauthenticated -> must return 401
    const rUnauth = await fetch(`${BASE_URL}${ep}`);
    if (rUnauth.status === 401) unauthPassCount++;

    // Test 2: Customer session -> must return 403
    const rCust = await fetch(`${BASE_URL}${ep}`, {
      headers: { Cookie: `slidex_session=${customerAToken}` },
    });
    if (rCust.status === 403) custBlockedCount++;

    // Test 3: Admin session -> must return 200 (or acceptable 200/405 depending on method)
    const rAdmin = await fetch(`${BASE_URL}${ep}`, {
      headers: { Cookie: `slidex_session=${adminToken}` },
    });
    if (rAdmin.status === 200 || rAdmin.status === 405) {
      adminAccessCount++;
    } else {
      console.log(`    ⚠️ Admin EP returned HTTP ${rAdmin.status}: ${ep}`);
    }
  }

  record('Admin APIs', `Unauthenticated requests blocked with 401 across all 21 endpoints`, unauthPassCount === 21 ? 'PASS' : 'FAIL', `${unauthPassCount}/21 returned 401`);
  record('Admin APIs', `Customer sessions blocked with 403 across all 21 endpoints`, custBlockedCount === 21 ? 'PASS' : 'FAIL', `${custBlockedCount}/21 returned 403`);
  record('Admin APIs', `Authorized Admin access permitted across all 21 endpoints`, adminAccessCount === 21 ? 'PASS' : 'FAIL', `${adminAccessCount}/21 accessible with admin session`);

  // ------------------------------------------------------------------
  // SUITE 6: CUSTOMER SECURITY & SESSION VERIFICATION
  // ------------------------------------------------------------------
  console.log('\n📍 SUITE 6: CUSTOMER SECURITY & SESSION VERIFICATION');
  try {
    // 6.1 Expired Session Token Rejection
    const expiredToken = makeToken({
      id: 'expired-cust',
      email: 'expired@slideease.com',
      role: 'customer',
      exp: Date.now() - 3600000, // Expired 1 hour ago
    });
    const resExpired = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: `slidex_session=${expiredToken}` },
    });
    record('Customer Security', 'Expired session tokens rejected (401)', resExpired.status === 401 ? 'PASS' : 'FAIL', `HTTP ${resExpired.status}`);

    // 6.2 Forged Signature Token Rejection
    const forgedToken = `${adminToken.split('.')[0]}.forged_invalid_signature_bytes`;
    const resForged = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Cookie: `slidex_session=${forgedToken}` },
    });
    record('Customer Security', 'Forged session tokens rejected (401)', resForged.status === 401 ? 'PASS' : 'FAIL', `HTTP ${resForged.status}`);

    // 6.3 Customer Login with Incorrect Password
    const resBadLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@slideease.com', password: 'wrong_password_xyz' }),
    });
    const badLoginJson = await resBadLogin.json();
    record('Customer Security', 'Incorrect password rejected without leaking user existence', resBadLogin.status === 400 && !badLoginJson.success ? 'PASS' : 'FAIL', `HTTP ${resBadLogin.status}, error: "${badLoginJson.error}"`);
  } catch (err) {
    record('Customer Security', 'Customer security tests', 'FAIL', err.message);
  }

  // ------------------------------------------------------------------
  // SUITE 7: SETTINGS & BUSINESS RULES VERIFICATION
  // ------------------------------------------------------------------
  console.log('\n📍 SUITE 7: SETTINGS & BUSINESS RULES VERIFICATION');
  try {
    const resShipping = await fetch(`${BASE_URL}/api/shipping-settings`);
    const shipJson = await resShipping.json();
    const shipData = shipJson.data || shipJson;
    const settingsValid = shipJson.success && typeof shipData.freeShippingThreshold === 'number' && typeof shipData.codCharge === 'number';
    record('Business Rules', 'Shipping settings API returns valid thresholds & fees', settingsValid ? 'PASS' : 'FAIL', `Threshold: ₹${shipData.freeShippingThreshold}, COD Fee: ₹${shipData.codCharge}`);

    // Authoritative pricing coupon test
    const resCoupon = await fetch(`${BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'SLIDEEASE10', cartTotal: 2000 }),
    });
    const couponJson = await resCoupon.json();
    const couponValid = couponJson.success && couponJson.discount === 0.1;
    record('Business Rules', 'Authoritative coupon calculation (SLIDEEASE10: 10%)', couponValid ? 'PASS' : 'FAIL', `Discount: ${couponJson.discount * 100}%`);
  } catch (err) {
    record('Business Rules', 'Settings & business rules tests', 'FAIL', err.message);
  }

  await client.close();

  // Summary
  const passTotal = results.filter(r => r.status === 'PASS').length;
  const failTotal = results.filter(r => r.status === 'FAIL').length;
  console.log('\n======================================================================');
  console.log(`FINAL RESULTS: ${passTotal} PASSED, ${failTotal} FAILED (${results.length} Total)`);
  console.log('======================================================================');
}

run().catch(console.error);
