import { MongoClient } from 'mongodb';
import fs from 'fs';

const envPath = 'c:/Users/Samreen Ansari/OneDrive/Documents/Desktop/SLIDEX-FOOTWEARE/SLIDEX-FOOTWEARE/slidex-nextjs/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      env[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
    }
  }
});

const uri = env.MONGODB_URI;
const dbName = env.MONGODB_DB || 'startupbiz';

async function migrate() {
  console.log('--- MIGRATING PRODUCTS SCHEMA TO SIZE-WISE STOCK ---');
  const client = new MongoClient(uri, { tlsAllowInvalidCertificates: true });
  await client.connect();
  const db = client.db(dbName);

  const products = await db.collection('products').find({}).toArray();
  console.log(`Found ${products.length} products to check/migrate.`);

  let updatedCount = 0;

  for (const prod of products) {
    const defaultSizes = Array.isArray(prod.sizes) && prod.sizes.length > 0 
      ? prod.sizes.map(String)
      : ['6', '7', '8', '9', '10'];

    const totalStock = parseInt(prod.stockQty) || 45;
    const basePerSize = Math.max(2, Math.floor(totalStock / defaultSizes.length));

    // Construct sizeStock dictionary
    const sizeStock = {};
    defaultSizes.forEach((sz, idx) => {
      // For prod-01 (or first item), deliberately configure varied stock to test all states:
      // UK 6: 12 (in stock), UK 7: 3 (low stock < 5), UK 8: 0 (out of stock/disabled)
      if (prod.id === 'prod-01' || prod.id === 'artisan-loafer-01') {
        if (sz === '6' || sz === '5') sizeStock[sz] = 12;
        else if (sz === '7') sizeStock[sz] = 3; // Low stock
        else if (sz === '8') sizeStock[sz] = 0; // Out of stock
        else sizeStock[sz] = 8;
      } else {
        // Stagger stock so different sizes have different availability
        if (idx === 0) sizeStock[sz] = 10;
        else if (idx === 1) sizeStock[sz] = 4; // Low stock
        else if (idx === defaultSizes.length - 1) sizeStock[sz] = 0; // Out of stock
        else sizeStock[sz] = basePerSize;
      }
    });

    await db.collection('products').updateOne(
      { _id: prod._id },
      {
        $set: {
          sizes: defaultSizes,
          sizeStock: sizeStock,
          updatedAt: new Date().toISOString()
        }
      }
    );
    updatedCount++;
    console.log(`✓ Migrated "${prod.name}" (ID: ${prod.id || prod._id}) -> sizeStock:`, JSON.stringify(sizeStock));
  }

  console.log(`\nSuccessfully migrated ${updatedCount} products with size-wise stock in MongoDB.`);
  await client.close();
}

migrate().catch(console.error);
