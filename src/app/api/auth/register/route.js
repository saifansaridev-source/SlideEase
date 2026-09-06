import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { hashPassword, signSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Registration requirements not met. Password must be at least 6 characters.' 
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    // Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ success: false, error: 'User already exists with this email address.' }, { status: 400 });
    }
    
    const hashedPassword = await hashPassword(password);
    
    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: 'customer',
      points: 100, // Welcome reward bonus points
      cart: [],
      wishlist: [],
      createdAt: new Date(),
    };
    
    const result = await db.collection('users').insertOne(userData);
    
    // Auto-login: set signed HTTP-Only session cookie
    const sessionToken = signSession({ 
      userId: result.insertedId.toString(),
      email: userData.email, 
      name: userData.name, 
      role: userData.role 
    });

    const cookieStore = await cookies();
    cookieStore.set('slidex_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Account registered successfully!',
      user: { name: userData.name, email: userData.email, points: userData.points, role: userData.role } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
