/**
 * SlideEase Production Recovery Script
 * 
 * Fixes:
 * 1. Restores depleted sizeStock for all products (audit test debris)  
 * 2. Cleans up test/fake order debris
 * 3. Ensures shipping/tax settings document has all required fields
 * 4. Resets coupon usedCount to 0
 */
import { MongoClient } from 'mongodb';
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

async function run() {
  const client = new MongoClient(env.MONGODB_URI);
  await client.connect();
  console.log('Connected to MongoDB Atlas');
  const db = client.db(env.MONGODB_DB || 'startupbiz');

  // ==========================================================
  // FIX 1: Restore sizeStock for all products
  // Each product should have healthy stock levels for all sizes
  // ==========================================================
  console.log('\n[FIX 1] Restoring sizeStock for all products...');
  const allProducts = await db.collection('products').find({}).toArray();
  
  for (const p of allProducts) {
    const updates = {};
    
    if (p.sizeStock && typeof p.sizeStock === 'object') {
      // Restore any size that has 0 or negative stock to 15
      const newSizeStock = { ...p.sizeStock };
      let changed = false;
      for (const [sz, qty] of Object.entries(newSizeStock)) {
        if (qty <= 0) {
          newSizeStock[sz] = 15;
          changed = true;
        }
      }
      if (changed) {
        updates.sizeStock = newSizeStock;
        // Recalculate total stockQty
        updates.stockQty = Object.values(newSizeStock).reduce((s, v) => s + (parseInt(v) || 0), 0);
        updates.stock = 'in-stock';
      }
    } else if ((p.stockQty || 0) <= 0) {
      updates.stockQty = 50;
      updates.stock = 'in-stock';
    }
    
    if (Object.keys(updates).length > 0) {
      await db.collection('products').updateOne(
        { _id: p._id },
        { $set: { ...updates, updatedAt: new Date() } }
      );
      console.log('  Restored:', p.name);
    }
  }
  console.log('  Stock restoration complete.');

  // ==========================================================
  // FIX 2: Delete audit/test order debris
  // ==========================================================
  console.log('\n[FIX 2] Removing test/audit order debris...');
  const deleteResult = await db.collection('orders').deleteMany({
    $or: [
      { 'customer.email': 'fake_buyer@test.com' },
      { 'customer.email': 'fraud@example.com' },
      { 'customer.email': 'cancel_test@example.com' },
      { orderNumber: { $regex: '^AUDIT-' } }
    ]
  });
  console.log('  Deleted test orders:', deleteResult.deletedCount);

  // ==========================================================
  // FIX 3: Ensure shipping/tax settings are complete
  // ==========================================================
  console.log('\n[FIX 3] Ensuring shipping/tax settings are complete...');
  const completeShippingSettings = {
    key: 'shipping_tax',
    freeShippingEnabled: true,
    freeShippingThreshold: 999,
    shippingFlatRate: 79,
    expressEnabled: true,
    expressDeliveryCharge: 149,
    codEnabled: true,
    codCharge: 49,
    taxRate: 18,
    cgstRate: 9,
    sgstRate: 9,
    taxIncludedInPrice: true,
    updatedAt: new Date()
  };
  
  await db.collection('settings').updateOne(
    { key: 'shipping_tax' },
    { $set: completeShippingSettings },
    { upsert: true }
  );
  console.log('  Shipping/tax settings updated with complete configuration.');

  // ==========================================================
  // FIX 4: Reset coupon usedCount (cleanup from test runs)
  // ==========================================================
  console.log('\n[FIX 4] Resetting coupon usedCount from test runs...');
  const couponResult = await db.collection('coupons').updateMany(
    { usedCount: { $gt: 0 } },
    { $set: { usedCount: 0 } }
  );
  console.log('  Coupons reset:', couponResult.modifiedCount);

  // ==========================================================
  // VERIFICATION: Check final state
  // ==========================================================
  console.log('\n=== VERIFICATION ===');
  const depletedCheck = await db.collection('products').find({}).toArray();
  let remaining = 0;
  for (const p of depletedCheck) {
    if (p.sizeStock) {
      for (const qty of Object.values(p.sizeStock)) {
        if (qty <= 0) remaining++;
      }
    }
  }
  console.log('Remaining depleted size entries:', remaining, remaining === 0 ? '✅ CLEAN' : '❌ STILL ISSUES');
  
  const totalOrders = await db.collection('orders').countDocuments({});
  console.log('Total orders remaining:', totalOrders);
  
  const settings = await db.collection('settings').findOne({ key: 'shipping_tax' });
  console.log('Shipping settings complete:', settings ? 
    `freeThreshold=₹${settings.freeShippingThreshold}, codCharge=₹${settings.codCharge}, taxRate=${settings.taxRate}%` : 
    'MISSING!');

  await client.close();
  console.log('\n✅ Production recovery complete!');
}

run().catch(err => {
  console.error('Recovery script failed:', err.message);
  process.exit(1);
});
