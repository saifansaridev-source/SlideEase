import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

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
    const { productId, email } = await request.json();
    if (!productId) return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 });
    if (!email || !email.includes('@')) return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 });

    const session = await getSession();
    const db = await getDb();

    let product = null;
    if (ObjectId.isValid(productId)) product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    if (!product) product = await db.collection('products').findOne({ id: productId });
    if (!product) return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });

    const existing = await db.collection('price_alerts').findOne({ productId, email: email.toLowerCase().trim() });
    if (existing) return NextResponse.json({ success: true, alreadySubscribed: true, message: 'You are already subscribed for price drop alerts on this item.' });

    await db.collection('price_alerts').insertOne({
      productId,
      email: email.toLowerCase().trim(),
      userId: session?.id || null,
      currentPriceSnapshot: product.price,
      createdAt: new Date(),
      notified: false,
      active: true,
    });

    return NextResponse.json({ success: true, message: 'You will be notified if the price drops on this item.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { productId, email } = await request.json();
    if (!productId || !email) return NextResponse.json({ success: false, error: 'productId and email required' }, { status: 400 });
    const db = await getDb();
    await db.collection('price_alerts').deleteOne({ productId, email: email.toLowerCase().trim() });
    return NextResponse.json({ success: true, message: 'Price alert removed.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
