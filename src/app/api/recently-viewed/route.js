import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

const MAX_RECENTLY_VIEWED = 10;
const COOLDOWN_MS = 5 * 60 * 1000;

async function getSession() {
  try {
    const cookieStore = await cookies();
    const sc = cookieStore.get('slidex_session');
    if (!sc) return null;
    return verifySession(sc.value) || null;
  } catch { return null; }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.email) return NextResponse.json({ success: true, products: [] });

    const db = await getDb();
    const user = await db.collection('users').findOne(
      { email: session.email.toLowerCase() },
      { projection: { recentlyViewed: 1 } }
    );

    const viewed = (user?.recentlyViewed || []).slice(0, MAX_RECENTLY_VIEWED);
    if (!viewed.length) return NextResponse.json({ success: true, products: [] });

    const productIds = viewed.map((v) => v.productId);
    const products = await db.collection('products').find({
      $or: [
        { id: { $in: productIds } },
        { _id: { $in: productIds.filter(ObjectId.isValid).map((id) => new ObjectId(id)) } },
      ],
    }).toArray();

    const productMap = new Map();
    for (const p of products) productMap.set(p.id || p._id.toString(), p);

    const ordered = viewed
      .map((v) => {
        const prod = productMap.get(v.productId);
        if (!prod) return null;
        return { ...prod, _id: prod._id.toString(), viewedAt: v.viewedAt };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, products: ordered });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { productId } = await request.json();
    if (!productId || typeof productId !== 'string')
      return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 });

    const session = await getSession();
    if (!session?.email) return NextResponse.json({ success: true, persisted: false });

    const db = await getDb();
    const now = new Date();
    const user = await db.collection('users').findOne(
      { email: session.email.toLowerCase() },
      { projection: { recentlyViewed: 1 } }
    );

    const existing = (user?.recentlyViewed || []).find((v) => v.productId === productId);
    if (existing && now - new Date(existing.viewedAt) < COOLDOWN_MS)
      return NextResponse.json({ success: true, persisted: false, reason: 'cooldown' });

    await db.collection('users').updateOne(
      { email: session.email.toLowerCase() },
      { $pull: { recentlyViewed: { productId } } }
    );
    await db.collection('users').updateOne(
      { email: session.email.toLowerCase() },
      { $push: { recentlyViewed: { $each: [{ productId, viewedAt: now }], $position: 0, $slice: MAX_RECENTLY_VIEWED } } }
    );

    return NextResponse.json({ success: true, persisted: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
