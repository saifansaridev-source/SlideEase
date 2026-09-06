import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { isConnectionError } from '@/lib/dbFallback';

// GET: Fetch reviews for a given product ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    const client = await clientPromise;
    const db = client.db('startupbiz');

    let query = {};
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

    const client = await clientPromise;
    const db = client.db('startupbiz');

    const newReview = {
      productId,
      author: author.trim(),
      title: title.trim(),
      body: reviewText.trim(),
      rating: parseInt(rating) || 5,
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: new Date(),
      status: 'approved'
    };

    const result = await db.collection('reviews').insertOne(newReview);
    newReview._id = result.insertedId;

    return NextResponse.json({ success: true, message: 'Review submitted successfully!', data: newReview });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
