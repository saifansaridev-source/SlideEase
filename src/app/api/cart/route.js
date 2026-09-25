import { getDb } from '@/lib/mongodb';
import { verifySession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, authenticated: false, cart: [] });
    }

    const sessionData = verifySession(sessionCookie.value);
    if (!sessionData || !sessionData.email) {
      return NextResponse.json({ success: false, authenticated: false, cart: [] });
    }

    const db = await getDb();
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

    const sessionData = verifySession(sessionCookie.value);
    if (!sessionData || !sessionData.email) {
      return NextResponse.json({ success: false, authenticated: false, message: 'Invalid session' });
    }

    const { cart } = await request.json();
    const db = await getDb();

    await db.collection('users').updateOne(
      { email: sessionData.email },
      { $set: { cart: cart || [], updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, authenticated: true, message: 'Cart synced to MongoDB' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
