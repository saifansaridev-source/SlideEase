import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

async function recalculateProductRating(db, productId) {
  try {
    const stats = await db.collection('reviews').aggregate([
      { $match: { productId, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]).toArray();

    const avg = stats.length > 0 ? Number(stats[0].avgRating.toFixed(1)) : 5.0;
    const count = stats.length > 0 ? stats[0].count : 0;
    await db.collection('products').updateOne(
      { $or: [{ id: productId }, ...(ObjectId.isValid(productId) ? [{ _id: new ObjectId(productId) }] : [])] },
      { $set: { rating: avg, reviewCount: count } }
    );
  } catch (err) {
    console.warn('Rating recalculation non-fatal error:', err.message);
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const reviews = await db.collection('reviews').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Review ID and status required' }, { status: 400 });
    }

    const db = await getDb();
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    await db.collection('reviews').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (review.productId) {
      await recalculateProductRating(db, review.productId);
    }

    return NextResponse.json({ success: true, message: `Review status updated to ${status}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 });
    }

    const db = await getDb();

    let filter;
    try {
      filter = { _id: new ObjectId(id) };
    } catch {
      filter = { id: id };
    }

    const review = await db.collection('reviews').findOne(filter);
    await db.collection('reviews').deleteOne(filter);

    if (review && review.productId) {
      await recalculateProductRating(db, review.productId);
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
