import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }
    
    const cleanEmail = email.toLowerCase().trim();
    const db = await getDb();
    
    // Check if email already subscribed in authoritative newsletter collection
    const existing = await db.collection('newsletter').findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ success: true, message: 'You are already subscribed to our newsletter!' });
    }
    
    await db.collection('newsletter').insertOne({
      email: cleanEmail,
      active: true,
      subscribedAt: new Date()
    });
    
    return NextResponse.json({ success: true, message: '🎉 Subscribed successfully! Your 10% coupon code: SLIDEEASE10' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

