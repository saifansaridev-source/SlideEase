const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

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
      if (key === 'MONGODB_DB') dbName = val;
    }
  });
}

// Credentials from CLI arguments or environment variables
const adminEmail = (process.argv[2] || process.env.INITIAL_ADMIN_EMAIL || 'admin@slideease.in').toLowerCase().trim();
const adminPassword = process.argv[3] || process.env.INITIAL_ADMIN_PASSWORD || 'SlideEase@Admin2026!';

async function createAdmin() {
  console.log(`Connecting to database "${dbName}" to setup owner Admin account...`);
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = {
      name: 'SlideEase Owner Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      permissions: ['all'],
      updatedAt: new Date(),
    };
    
    // Upsert the admin account (update if exists, insert if new)
    await db.collection('users').updateOne(
      { email: adminEmail },
      { 
        $set: adminUser,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );
    
    console.log('\n======================================================');
    console.log('✅ Administrator account configured successfully with bcrypt hashing.');
    console.log(`- Email: ${adminEmail}`);
    console.log('- Role: admin');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Failed to configure administrator account:', error.message);
  } finally {
    await client.close();
  }
}

createAdmin();
