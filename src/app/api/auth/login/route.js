import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const user = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }
    
    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }
    
    // Set HTTP-Only Session Cookie
    const cookieStore = await cookies();
    cookieStore.set('slidex_session', JSON.stringify({ email: user.email, name: user.name, role: user.role || 'customer' }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully!',
      user: { name: user.name, email: user.email, points: user.points || 0, role: user.role || 'customer' }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
