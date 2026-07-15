import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    // Check if email already subscribed
    const existing = await db.collection('subscriptions').findOne({ email });
    if (existing) {
      return NextResponse.json({ success: true, message: 'You are already subscribed to our newsletter!' });
    }
    
    await db.collection('subscriptions').insertOne({
      email,
      subscribedAt: new Date()
    });
    
    return NextResponse.json({ success: true, message: '🎉 Subscribed successfully! Your 10% coupon code: SLIDEEASE10' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

