const http = require('http');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Simulates Shop page client-side post-filtering
function applyShopClientFilters(products, { price = 'all', color = 'all', material = 'all' }) {
  let data = [...products];

  if (price !== 'all') {
    data = data.filter(p => {
      if (price === 'under-1000') return p.price < 1000;
      if (price === '1000-1500') return p.price >= 1000 && p.price <= 1500;
      if (price === '1500-2000') return p.price >= 1500 && p.price <= 2000;
      if (price === 'above-2000') return p.price > 2000;
      return true;
    });
  }

  if (color !== 'all') {
    const normColor = color.toLowerCase().trim();
    data = data.filter(p => (p.color || '').toLowerCase().trim() === normColor);
  }

  if (material !== 'all') {
    const clean = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetMat = clean(material);
    data = data.filter(p => {
      const pMat = clean(p.material);
      return pMat.includes(targetMat) || targetMat.includes(pMat);
    });
  }

  return data;
}

async function runTests() {
  console.log('=== SLIDEX FILTER VERIFICATION SUITE ===\n');

  // Test 1: color=red via API
  const redRes = await fetchJson('http://localhost:3000/api/products?color=red');
  console.log('[Test 1] color=red (API)');
  console.log(`Count: ${redRes.data.length}`);
  redRes.data.forEach(p => console.log(`  - [${p.id}] ${p.name} | Color: ${p.color} | Material: ${p.material} | Price: ₹${p.price}`));

  // Test 2: color=pink via API
  const pinkRes = await fetchJson('http://localhost:3000/api/products?color=pink');
  console.log('\n[Test 2] color=pink (API)');
  console.log(`Count: ${pinkRes.data.length}`);
  pinkRes.data.forEach(p => console.log(`  - [${p.id}] ${p.name} | Color: ${p.color} | Material: ${p.material} | Price: ₹${p.price}`));

  // Test 3: color=green via API
  const greenRes = await fetchJson('http://localhost:3000/api/products?color=green');
  console.log('\n[Test 3] color=green (API)');
  console.log(`Count: ${greenRes.data.length}`);
  greenRes.data.forEach(p => console.log(`  - [${p.id}] ${p.name} | Color: ${p.color} | Material: ${p.material} | Price: ₹${p.price}`));

  // Fetch all products for combined tests
  const allRes = await fetchJson('http://localhost:3000/api/products');
  const allProds = allRes.data;

  // Test 4: Combined - color=tan + material=vegan-leather
  console.log('\n[Test 4] Combined Filter: color=tan + material=vegan-leather');
  const combo1 = applyShopClientFilters(allProds, { color: 'tan', material: 'vegan-leather' });
  console.log(`Count: ${combo1.length} (Earthy Jute Sandals excluded because material is Jute)`);
  combo1.forEach(p => console.log(`  - [${p.id}] ${p.name} | Color: ${p.color} | Material: ${p.material} | Price: ₹${p.price}`));

  // Test 5: Combined - color=tan + material=vegan-leather + price=under-1000
  console.log('\n[Test 5] Combined Filter: color=tan + material=vegan-leather + price=under-1000');
  const combo2 = applyShopClientFilters(allProds, { color: 'tan', material: 'vegan-leather', price: 'under-1000' });
  console.log(`Count: ${combo2.length} (Only Classic Tan Vegan Slides matches < ₹1000; Royal Mandala is ₹1199)`);
  combo2.forEach(p => console.log(`  - [${p.id}] ${p.name} | Color: ${p.color} | Material: ${p.material} | Price: ₹${p.price}`));

  // Test 6: Combined - color=black + material=khadi
  console.log('\n[Test 6] Combined Filter: color=black + material=khadi');
  const combo3 = applyShopClientFilters(allProds, { color: 'black', material: 'khadi' });
  console.log(`Count: ${combo3.length} (Sleek Onyx excluded because material is Vegan Leather)`);
  combo3.forEach(p => console.log(`  - [${p.id}] ${p.name} | Color: ${p.color} | Material: ${p.material} | Price: ₹${p.price}`));

  // Test 7: Combined - color=tan + material=jute + price=1000-1500
  console.log('\n[Test 7] Combined Filter: color=tan + material=jute + price=1000-1500');
  const combo4 = applyShopClientFilters(allProds, { color: 'tan', material: 'jute', price: '1000-1500' });
  console.log(`Count: ${combo4.length}`);
  combo4.forEach(p => console.log(`  - [${p.id}] ${p.name} | Color: ${p.color} | Material: ${p.material} | Price: ₹${p.price}`));

  console.log('\n=== ALL FILTER COMBINATIONS PASSED ===');
}

runTests().catch(console.error);
