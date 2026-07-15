import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Helper to hash passwords securely using built-in SHA256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Registration requirements not met. Password must be at least 6 characters.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    // Check if user already exists
    const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, error: 'User already exists with this email address.' }, { status: 400 });
    }
    
    const userData = {
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      createdAt: new Date(),
      points: 100 // Bonus points on registration
    };
    
    await db.collection('users').insertOne(userData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Account registered successfully!',
      user: { name: userData.name, email: userData.email, points: userData.points } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
