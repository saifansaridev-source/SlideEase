import { getDb } from '@/lib/mongodb';
import { PRODUCTS } from '@/data/products';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const db = await getDb();
    
    const results = [];
    for (const prod of PRODUCTS) {
      const res = await db.collection('products').updateOne(
        { id: prod.id },
        {
          $set: {
            color: prod.color,
            material: prod.material
          }
        },
        { upsert: false }
      );
      results.push({
        id: prod.id,
        name: prod.name,
        color: prod.color,
        material: prod.material,
        matched: res.matchedCount,
        modified: res.modifiedCount
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product color and material fields synchronized with original catalog',
      updated: results
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
