import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_CATEGORIES, isConnectionError } from '@/lib/dbFallback';

const DEFAULT_CATEGORIES = [
  { name: "Men's Collection", slug: 'mens', desc: 'Premium slides, loafers and slip-ons for men.' },
  { name: "Women's Collection", slug: 'womens', desc: 'Handcrafted juttis, flats, sandals and mules.' },
];

// GET: Retrieve all categories, seeding defaults if empty
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const count = await db.collection('categories').countDocuments();
    if (count === 0) {
      await db.collection('categories').insertMany(DEFAULT_CATEGORIES);
    }
    
    const categories = await db.collection('categories').find({}).toArray();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock categories fallback data.", error.message);
      return NextResponse.json({ success: true, data: MOCK_CATEGORIES, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add a new category
export async function POST(request) {
  try {
    const { name, slug, desc, parent } = await request.json();
    
    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Category Name and Slug are required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const formattedSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]+/g, '');
    
    // Check if slug already exists
    const existing = await db.collection('categories').findOne({ slug: formattedSlug });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A category with this slug already exists' }, { status: 400 });
    }
    
    const newCategory = {
      name,
      slug: formattedSlug,
      desc: desc || '',
      parent: parent || null
    };
    
    await db.collection('categories').insertOne(newCategory);
    return NextResponse.json({ success: true, data: newCategory });
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

// DELETE: Remove a category
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Category slug parameter is required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const result = await db.collection('categories').deleteOne({ slug: slug });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    
    // Update child categories to clear their parent (or set parent to null)
    await db.collection('categories').updateMany({ parent: slug }, { $set: { parent: null } });
    
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
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
