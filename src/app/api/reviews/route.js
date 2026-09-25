import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { isConnectionError } from '@/lib/dbFallback';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Helper to recalculate aggregate product rating
async function recalculateProductRating(db, productId) {
  try {
    const stats = await db.collection('reviews').aggregate([
      { $match: { productId, status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]).toArray();

    if (stats.length > 0) {
      const avg = Number(stats[0].avgRating.toFixed(1));
      const count = stats[0].count;
      await db.collection('products').updateOne(
        { $or: [{ id: productId }, ...(ObjectId.isValid(productId) ? [{ _id: new ObjectId(productId) }] : [])] },
        { $set: { rating: avg, reviewCount: count } }
      );
    }
  } catch (err) {
    console.warn('Rating recalculation non-fatal error:', err.message);
  }
}

// GET: Fetch approved reviews for a given product ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const db = await getDb();

    let query = { status: 'approved' };
    if (productId) {
      query.productId = productId;
    }

    const reviews = await db
      .collection('reviews')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({ success: true, data: [], isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Submit a new verified product review
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, author, title, body: reviewText, rating } = body;

    if (!productId || !author || !title || !reviewText) {
      return NextResponse.json(
        { success: false, error: 'Product ID, author, headline, and review message are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Check review moderation setting from general settings
    const generalDoc = await db.collection('settings').findOne({ key: 'general' });
    const moderationEnabled = !!generalDoc?.reviewModerationEnabled;

    // Check if authenticated user is a verified purchaser
    let verifiedPurchase = false;
    let reviewerEmail = null;
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('slidex_session');
      if (sessionCookie) {
        const session = verifySession(sessionCookie.value);
        if (session && session.email) {
          reviewerEmail = session.email.toLowerCase().trim();
          const purchaseOrder = await db.collection('orders').findOne({
            'customer.email': reviewerEmail,
            'items.id': productId,
          });
          if (purchaseOrder) {
            verifiedPurchase = true;
          }
        }
      }
    } catch (e) {}

    const initialStatus = moderationEnabled ? 'pending' : 'approved';

    const newReview = {
      productId,
      author: author.trim(),
      email: reviewerEmail,
      title: title.trim(),
      body: reviewText.trim(),
      rating: Math.min(5, Math.max(1, parseInt(rating) || 5)),
      verifiedPurchase,
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: new Date(),
      status: initialStatus,
    };

    const result = await db.collection('reviews').insertOne(newReview);
    newReview._id = result.insertedId;

    if (initialStatus === 'approved') {
      await recalculateProductRating(db, productId);
    }

    return NextResponse.json({ 
      success: true, 
      message: moderationEnabled 
        ? 'Review submitted! It will appear after moderation approval.' 
        : 'Review published successfully!', 
      data: newReview 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
