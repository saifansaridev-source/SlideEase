import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, authenticated: false, wishlist: [] });
    }

    const sessionData = verifySession(sessionCookie.value);
    if (!sessionData || !sessionData.email) {
      return NextResponse.json({ success: false, authenticated: false, wishlist: [] });
    }

    const client = await clientPromise;
    const db = client.db('startupbiz');
    const user = await db.collection('users').findOne({ email: sessionData.email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ success: false, authenticated: false, wishlist: [] });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      wishlist: user.wishlist || [],
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, authenticated: false, message: 'Stored locally in guest mode' });
    }

    const sessionData = verifySession(sessionCookie.value);
    if (!sessionData || !sessionData.email) {
      return NextResponse.json({ success: false, authenticated: false });
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db('startupbiz');

    if (body.wishlist && Array.isArray(body.wishlist)) {
      // Sync full wishlist array
      await db.collection('users').updateOne(
        { email: sessionData.email.toLowerCase() },
        { $set: { wishlist: body.wishlist, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true, wishlist: body.wishlist });
    }

    if (body.productId) {
      // Toggle single item
      const user = await db.collection('users').findOne({ email: sessionData.email.toLowerCase() });
      let currentWishlist = user?.wishlist || [];
      const idx = currentWishlist.indexOf(body.productId);

      if (idx > -1) {
        currentWishlist.splice(idx, 1);
      } else {
        currentWishlist.push(body.productId);
      }

      await db.collection('users').updateOne(
        { email: sessionData.email.toLowerCase() },
        { $set: { wishlist: currentWishlist, updatedAt: new Date() } }
      );

      return NextResponse.json({ success: true, wishlist: currentWishlist });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
