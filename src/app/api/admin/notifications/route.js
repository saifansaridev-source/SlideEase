import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

async function requireAdmin() {
  const cookieStore = await cookies();
  const sc = cookieStore.get('slidex_session');
  if (!sc) return null;
  const s = verifySession(sc.value);
  return s?.role === 'admin' ? s : null;
}

export async function GET(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const channel = searchParams.get('channel');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const db = await getDb();
    let query = {};

    if (orderNumber) {
      query.orderNumber = orderNumber;
    }
    if (channel && channel !== 'all') {
      query.channel = channel;
    }

    const notifications = await db.collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      notifications: notifications.map(n => ({ ...n, _id: n._id.toString() })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
