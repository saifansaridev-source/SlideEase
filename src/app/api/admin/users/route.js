import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { MOCK_USERS, isConnectionError } from '@/lib/dbFallback';

// GET: Retrieve all user accounts
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const users = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
      
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock users fallback data.", error.message);
      return NextResponse.json({ success: true, data: MOCK_USERS, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Modify customer user role (admin vs customer)
export async function PUT(request) {
  try {
    const { id, role } = await request.json();
    
    if (!id || !role) {
      return NextResponse.json({ success: false, error: 'User ID and Role parameters are required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: { role: role.toLowerCase() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: `User role set to: ${role}` });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB Atlas Network IP Whitelist. Go to MongoDB Atlas -> Security -> Network Access and add 0.0.0.0/0 to allow connections."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Terminate customer user account
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID parameter is missing' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB Atlas Network IP Whitelist. Go to MongoDB Atlas -> Security -> Network Access and add 0.0.0.0/0 to allow connections."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
