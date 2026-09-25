import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// GET: Fetch all newsletter subscribers (+optional search)
export async function GET(request) {
  try {
    const db = await getDb();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    let query = {};
    if (q) {
      query = { email: { $regex: q, $options: 'i' } };
    }

    const subscribers = await db.collection('newsletter')
      .find(query)
      .sort({ subscribedAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: subscribers, total: subscribers.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a subscriber by id
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required.' }, { status: 400 });
    }

    const { ObjectId } = await import('mongodb');
    const db = await getDb();

    await db.collection('newsletter').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: 'Subscriber removed.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
