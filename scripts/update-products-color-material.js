const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Products data from original script.js
const PRODUCTS = [
  { id: 'prod-01', color: 'teal', material: 'Ikat Canvas' },
  { id: 'prod-02', color: 'red', material: 'Vegan Leather' },
  { id: 'prod-03', color: 'tan', material: 'Vegan Leather' },
  { id: 'prod-04', color: 'blue', material: 'Ikat Canvas' },
  { id: 'prod-05', color: 'purple', material: 'Velvet' },
  { id: 'prod-06', color: 'tan', material: 'Vegan Leather' },
  { id: 'prod-07', color: 'pink', material: 'Khadi Cotton' },
  { id: 'prod-08', color: 'tan', material: 'Jute' },
  { id: 'prod-09', color: 'green', material: 'Ikat Canvas' },
  { id: 'prod-10', color: 'black', material: 'Khadi Cotton' },
  { id: 'prod-11', color: 'gold', material: 'Vegan Leather' },
  { id: 'prod-12', color: 'black', material: 'Vegan Leather' }
];

let uri = 'mongodb+srv://slidexfootwear_db_user:YVpzK819CuBYGblF@slidexfootware.ojuztad.mongodb.net/';
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'MONGODB_URI') uri = val;
    }
  });
}

async function run() {
  const client = new MongoClient(uri, { tlsAllowInvalidCertificates: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    // Update both 'startupbiz' and 'Slidexfootware' to be 100% comprehensive
    const targetDbs = ['startupbiz', 'Slidexfootware'];
    
    for (const dbName of targetDbs) {
      const db = client.db(dbName);
      console.log(`\n--- Updating DB: ${dbName} ---`);
      
      for (const p of PRODUCTS) {
        const res = await db.collection('products').updateOne(
          { id: p.id },
          { $set: { color: p.color, material: p.material } }
        );
        console.log(`[${p.id}] color: '${p.color}', material: '${p.material}' -> matched: ${res.matchedCount}, modified: ${res.modifiedCount}`);
      }
    }
    
    console.log('\nAll products updated successfully with color and material fields!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.close();
  }
}

run();
