import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyPassword, hashPassword, signSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }
    
    const db = await getDb();
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }
    
    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 400 });
    }

    // If user was using legacy SHA-256, upgrade to bcrypt on successful login
    if (!user.passwordHash.startsWith('$2')) {
      const newBcryptHash = await hashPassword(password);
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { passwordHash: newBcryptHash, upgradedAt: new Date() } }
      );
    }
    
    // Set HTTP-Only Signed Session Cookie
    const sessionToken = signSession({ 
      userId: user._id.toString(),
      email: user.email, 
      name: user.name, 
      role: user.role || 'customer' 
    });

    const cookieStore = await cookies();
    cookieStore.set('slidex_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully!',
      user: { 
        name: user.name, 
        email: user.email, 
        points: user.points || 0, 
        role: user.role || 'customer' 
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
