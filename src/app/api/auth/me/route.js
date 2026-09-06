import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }
    
    const sessionData = verifySession(sessionCookie.value);
    if (!sessionData || !sessionData.email) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session.' }, { status: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const user = await db.collection('users').findOne({ email: sessionData.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user._id.toString(),
        name: user.name, 
        email: user.email, 
        phone: user.phone || '',
        address: user.address || '',
        points: user.points || 0,
        role: user.role || 'customer'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
