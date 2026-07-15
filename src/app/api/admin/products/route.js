import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { isConnectionError } from '@/lib/dbFallback';

// POST: Add new footwear item
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ success: false, error: 'Name, price, and category are required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    // Auto-generate ID if not provided
    const newId = body.id || 'prod-' + Math.floor(1000 + Math.random() * 9000);
    
    const productData = {
      id: newId,
      name: body.name,
      category: body.category,
      type: body.type || 'slides',
      price: parseFloat(body.price),
      originalPrice: parseFloat(body.originalPrice || body.price),
      rating: parseFloat(body.rating || 5.0),
      reviews: parseInt(body.reviews || 0),
      pattern: body.pattern || 'classic',
      patternColor: body.patternColor || '#333333',
      bgColor: body.bgColor || '#f9f9f9',
      tag: body.tag || '',
      desc: body.desc || '',
      shortDesc: body.shortDesc || '',
      image: body.image || '/assets/slides.png',
      gallery: body.gallery || [],
      color: body.color || 'neutral',
      material: body.material || 'Vegan Leather',
      stock: body.stock || 'in-stock',
      sizes: body.sizes || [6, 7, 8, 9, 10],
      sku: body.sku || '',
      manageStock: body.manageStock === undefined ? true : !!body.manageStock,
      stockQty: parseInt(body.stockQty) || 0,
      lowStockThreshold: parseInt(body.lowStockThreshold) || 10,
      allowBackorders: body.allowBackorders || 'no',
      soldIndividually: !!body.soldIndividually
    };
    
    await db.collection('products').insertOne(productData);
    
    return NextResponse.json({ success: true, message: 'Footwear added successfully!', data: productData });
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

// DELETE: Delete a product
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID parameter is missing' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const result = await db.collection('products').deleteOne({ id: id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
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

// PUT: Update a product (stock status, pricing, info, etc.)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for updates' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const result = await db.collection('products').updateOne(
      { id: id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Product updated successfully!' });
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
