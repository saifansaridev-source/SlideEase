import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_COUPONS, isConnectionError } from '@/lib/dbFallback';

const DEFAULT_COUPONS = [
  { code: 'SLIDEEASE10', discount: 0.10, minOrder: 0, active: true },
  { code: 'STARTUPINDIA', discount: 0.10, minOrder: 0, active: true },
];

// GET: Retrieve all coupons, seeding defaults if empty
export async function GET() {
  try {
    const db = await getDb();
    
    const count = await db.collection('coupons').countDocuments();
    if (count === 0) {
      await db.collection('coupons').insertMany(DEFAULT_COUPONS);
    }
    
    const coupons = await db.collection('coupons').find({}).toArray();
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock coupons fallback data.", error.message);
      return NextResponse.json({ success: true, data: MOCK_COUPONS, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new coupon
export async function POST(request) {
  try {
    const { code, discount, minOrder, active } = await request.json();
    
    if (!code || discount === undefined) {
      return NextResponse.json({ success: false, error: 'Coupon Code and Discount are required' }, { status: 400 });
    }
    
    const db = await getDb();
    const upperCode = code.trim().toUpperCase();
    
    // Check if coupon already exists
    const existing = await db.collection('coupons').findOne({ code: upperCode });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A coupon with this code already exists' }, { status: 400 });
    }
    
    const newCoupon = {
      code: upperCode,
      discount: parseFloat(discount),
      minOrder: parseFloat(minOrder || 0),
      active: active === undefined ? true : !!active,
      usedCount: 0,
      createdAt: new Date(),
    };
    
    await db.collection('coupons').insertOne(newCoupon);
    return NextResponse.json({ success: true, data: newCoupon });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Toggle active status
export async function PUT(request) {
  try {
    const { code, active } = await request.json();
    
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    const result = await db.collection('coupons').updateOne(
      { code: code.toUpperCase() },
      { $set: { active: !!active, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Coupon status updated successfully' });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a coupon
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code parameter is required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    const result = await db.collection('coupons').deleteOne({ code: code.toUpperCase() });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
