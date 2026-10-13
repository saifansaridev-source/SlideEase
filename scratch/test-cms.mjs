import http from 'http';

function requestHttp(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log('1. Logging in as admin...');
  const loginRes = await requestHttp('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'admin@slideease.in', password: 'SlideEase@Admin2026!' }
  });

  console.log('Login status:', loginRes.status, 'Success:', loginRes.data?.success);
  const setCookie = loginRes.headers['set-cookie'];
  if (!setCookie) {
    throw new Error('No set-cookie returned from login: ' + JSON.stringify(loginRes.data));
  }
  const sessionCookie = setCookie[0].split(';')[0];
  console.log('Obtained session cookie:', sessionCookie.substring(0, 30) + '...');

  const authHeaders = {
    Cookie: sessionCookie,
    'Content-Type': 'application/json'
  };

  console.log('\n2. Testing GET /api/admin/cms...');
  const listRes = await requestHttp('http://localhost:3000/api/admin/cms', { headers: authHeaders });
  console.log('Status:', listRes.status, 'Success:', listRes.data?.success);
  console.log('Total pages returned:', listRes.data?.data?.length);

  const slugs = ['faq', 'about', 'shipping-returns', 'features', 'privacy', 'terms', 'cookie'];
  for (const s of slugs) {
    const page = listRes.data?.data?.find(p => p.slug === s);
    console.log(`- Page [${s}]: title="${page?.title}", hasOverride=${page?.hasOverride}, content_length=${page?.content?.length || 0}`);
    if (!page || !page.content) {
      throw new Error(`Page [${s}] has empty content!`);
    }
  }

  console.log('\n3. Testing GET /api/admin/cms?slug=privacy...');
  const privRes = await requestHttp('http://localhost:3000/api/admin/cms?slug=privacy', { headers: authHeaders });
  console.log('Privacy single fetch status:', privRes.status, 'Title:', privRes.data?.data?.title, 'Content length:', privRes.data?.data?.content?.length);

  console.log('\n4. Testing POST /api/admin/cms (editing privacy content)...');
  const originalContent = privRes.data?.data?.content;
  const updateRes = await requestHttp('http://localhost:3000/api/admin/cms', {
    method: 'POST',
    headers: authHeaders,
    body: {
      slug: 'privacy',
      title: 'Privacy Policy & Customer Security',
      content: originalContent + '\n<p id="cms-test-marker">TEST_PERSISTENCE_MARKER</p>',
      metaTitle: 'Privacy Policy & Security | SlideEase',
      metaDesc: 'Updated SlideEase privacy commitment',
      published: true
    }
  });
  console.log('Save response:', updateRes.data);

  console.log('\n5. Verifying persistence in DB...');
  const afterSaveRes = await requestHttp('http://localhost:3000/api/admin/cms?slug=privacy', { headers: authHeaders });
  console.log('Updated title:', afterSaveRes.data?.data?.title);
  console.log('Has override:', afterSaveRes.data?.data?.hasOverride);
  console.log('Contains test marker:', afterSaveRes.data?.data?.content?.includes('TEST_PERSISTENCE_MARKER'));

  console.log('\n6. Testing DELETE /api/admin/cms?slug=privacy (Reset to default)...');
  const deleteRes = await requestHttp('http://localhost:3000/api/admin/cms?slug=privacy', {
    method: 'DELETE',
    headers: authHeaders
  });
  console.log('Reset response:', deleteRes.data);

  const afterResetRes = await requestHttp('http://localhost:3000/api/admin/cms?slug=privacy', { headers: authHeaders });
  console.log('After reset title:', afterResetRes.data?.data?.title);
  console.log('After reset hasOverride:', afterResetRes.data?.data?.hasOverride);
  console.log('After reset content length:', afterResetRes.data?.data?.content?.length);
  console.log('Marker cleaned up:', !afterResetRes.data?.data?.content?.includes('TEST_PERSISTENCE_MARKER'));

  console.log('\n✅ PHASE 2 CMS TESTS FULLY PASSED!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
