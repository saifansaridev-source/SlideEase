const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

// Default Admin Credentials
const ADMIN_EMAIL = 'admin@slideease.com';
const ADMIN_PASSWORD = 'adminpassword123';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Load MongoDB connection URI from .env.local
let uri = 'mongodb://localhost:27017/startupbiz';
let dbName = 'startupbiz';

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

async function createAdmin() {
  console.log(`Connecting to MongoDB to setup Admin account...`);
  const client = new MongoClient(uri, {
    tlsAllowInvalidCertificates: true // matching dev environment bypass logic
  });
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const adminUser = {
      name: 'Administrator',
      email: ADMIN_EMAIL,
      passwordHash: hashPassword(ADMIN_PASSWORD),
      role: 'admin',
      createdAt: new Date(),
      points: 500
    };
    
    // Upsert the admin account (update if exists, insert if new)
    const result = await db.collection('users').updateOne(
      { email: ADMIN_EMAIL },
      { $set: adminUser },
      { upsert: true }
    );
    
    console.log('\n======================================================');
    console.log('✅ Administrator account configured successfully!');
    console.log(`- Email: ${ADMIN_EMAIL}`);
    console.log(`- Password: ${ADMIN_PASSWORD}`);
    console.log('- Role: admin');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Failed to configure administrator account:', error.message);
  } finally {
    await client.close();
  }
}

createAdmin();
