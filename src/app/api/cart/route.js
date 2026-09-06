import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, authenticated: false, cart: [] });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (e) {
      return NextResponse.json({ success: false, authenticated: false, cart: [] });
    }

    const client = await clientPromise;
    const db = client.db('startupbiz');
    const user = await db.collection('users').findOne({ email: sessionData.email });

    if (!user) {
      return NextResponse.json({ success: false, authenticated: false, cart: [] });
    }

    return NextResponse.json({ success: true, authenticated: true, cart: user.cart || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, authenticated: false, message: 'Guest mode, stored locally' });
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (e) {
      return NextResponse.json({ success: false, authenticated: false });
    }

    const { cart } = await request.json();
    const client = await clientPromise;
    const db = client.db('startupbiz');

    await db.collection('users').updateOne(
      { email: sessionData.email },
      { $set: { cart: cart || [], updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, authenticated: true, message: 'Cart synced to MongoDB' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
