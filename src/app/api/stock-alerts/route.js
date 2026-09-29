import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

async function getSession() {
  try {
    const cookieStore = await cookies();
    const sc = cookieStore.get('slidex_session');
    if (!sc) return null;
    return verifySession(sc.value) || null;
  } catch { return null; }
}

export async function POST(request) {
  try {
    const { productId, size, email } = await request.json();
    if (!productId) return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 });
    if (!email || !email.includes('@')) return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 });

    const session = await getSession();
    const db = await getDb();

    const existing = await db.collection('stock_alerts').findOne({
      productId, size: size || null, email: email.toLowerCase().trim()
    });
    if (existing) return NextResponse.json({ success: true, alreadySubscribed: true, message: 'You are already subscribed for this item.' });

    await db.collection('stock_alerts').insertOne({
      productId,
      size: size || null,
      email: email.toLowerCase().trim(),
      userId: session?.id || null,
      createdAt: new Date(),
      notified: false,
    });

    return NextResponse.json({ success: true, message: 'You will be notified when this item is back in stock.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { productId, size, email } = await request.json();
    if (!productId || !email) return NextResponse.json({ success: false, error: 'productId and email required' }, { status: 400 });
    const db = await getDb();
    await db.collection('stock_alerts').deleteOne({ productId, size: size || null, email: email.toLowerCase().trim() });
    return NextResponse.json({ success: true, message: 'Alert removed.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
