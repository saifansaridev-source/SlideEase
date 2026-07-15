import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }
    
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid session data.' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const user = await db.collection('users').findOne({ email: sessionData.email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: { name: user.name, email: user.email, points: user.points || 0 }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
