// scratch/test-phase10.mjs
// Automated integration test for Phases 4-9

const BASE = 'http://localhost:3000';

async function runTests() {
  console.log('--- STARTING PHASE 10 INTEGRATION TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Test 1: Public Coupons API
  try {
    const res = await fetch(`${BASE}/api/coupons`);
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'GET /api/coupons returns 200 and success: true');
    assert(Array.isArray(data.coupons) && data.coupons.length > 0, `GET /api/coupons returned ${data.coupons?.length} active coupons`);
    const first = data.coupons?.[0];
    assert(first && first.code && typeof first.minOrder === 'number', `Coupon object structure valid: code=${first?.code}, minOrder=${first?.minOrder}`);
  } catch (e) {
    assert(false, `GET /api/coupons failed with error: ${e.message}`);
  }

  // Test 2: CMS Sections Public API
  try {
    const res = await fetch(`${BASE}/api/settings/cms-sections`);
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'GET /api/settings/cms-sections returns 200');
    assert(Boolean(data.images?.weavingGuildsImage), `weavingGuildsImage present in cms-sections: ${Boolean(data.images?.weavingGuildsImage)}`);
    assert(Boolean(data.images?.walkLightImage), `walkLightImage present in cms-sections: ${Boolean(data.images?.walkLightImage)}`);
  } catch (e) {
    assert(false, `GET /api/settings/cms-sections failed: ${e.message}`);
  }

  // Test 3: Admin Login & CMS Sections API
  try {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@slideease.in', password: 'SlideEase@Admin2026!' }),
    });
    const loginData = await loginRes.json();
    const cookieHeader = loginRes.headers.get('set-cookie');
    assert(loginRes.status === 200 && loginData.success === true, 'Admin login succeeded');

    const res = await fetch(`${BASE}/api/admin/cms/sections`, {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    const data = await res.json();
    assert(res.status === 200 && data.success === true, 'GET /api/admin/cms/sections with auth returns 200');
    assert(Boolean(data.images?.weavingGuildsImage), `Admin API returns weavingGuildsImage`);
    assert(Boolean(data.images?.walkLightImage), `Admin API returns walkLightImage`);
  } catch (e) {
    assert(false, `Admin CMS test failed: ${e.message}`);
  }

  // Test 4: Home Page Trust Badges
  try {
    const res = await fetch(`${BASE}/`);
    const html = await res.text();
    assert(res.status === 200, 'GET / returns 200');
    assert(html.includes('id="brand-trust-badges-section"'), 'Home page contains trust badges section');
    
    const trustSectionMatch = html.match(/id="brand-trust-badges-section"[\s\S]*?<\/section>/);
    const trustSection = trustSectionMatch ? trustSectionMatch[0] : '';
    assert(trustSection.includes('stroke="var(--accent-color)"'), 'Trust badges use stroke="var(--accent-color)"');
    assert(!trustSection.includes('stroke="var(--accent-dark)"'), 'Old dark stroke="var(--accent-dark)" removed from trust badges section');
  } catch (e) {
    assert(false, `GET / home page failed: ${e.message}`);
  }

  // Test 5: Shop Page
  try {
    const res = await fetch(`${BASE}/shop`);
    const html = await res.text();
    assert(res.status === 200, 'GET /shop returns 200');
    assert(html.includes('id="shop-heritage-section"'), 'Shop page includes artisanal heritage section');
  } catch (e) {
    assert(false, `GET /shop failed: ${e.message}`);
  }

  // Test 6: About Page Walk Light Image
  try {
    const res = await fetch(`${BASE}/about`);
    const html = await res.text();
    assert(res.status === 200, 'GET /about returns 200');
    assert(html.includes('id="about-mission"'), 'About page includes mission section');
  } catch (e) {
    assert(false, `GET /about failed: ${e.message}`);
  }

  // Test 7: Coupon Validation Endpoint
  try {
    const couponListRes = await fetch(`${BASE}/api/coupons`);
    const couponData = await couponListRes.json();
    const testCode = couponData.coupons?.[0]?.code || 'FIRST10';
    
    const valRes = await fetch(`${BASE}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: testCode, cartTotal: 2500 }),
    });
    const valData = await valRes.json();
    assert(valRes.status === 200 && valData.success === true, `Validate coupon ${testCode} returns 200 with success: true (discount=${valData.discount})`);
  } catch (e) {
    assert(false, `Coupon validation failed: ${e.message}`);
  }

  console.log(`\n--- RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runTests();
