import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { isConnectionError } from '@/lib/dbFallback';
import { ObjectId } from 'mongodb';

// Helper to construct query for product by id or _id
function getProductFilter(id) {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
    return { $or: [{ _id: new ObjectId(id) }, { id: id }] };
  }
  return { id: id };
}

// POST: Add new footwear item
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ success: false, error: 'Name, price, and category are required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    // Auto-generate ID if not provided
    const newId = body.id || 'prod-' + Math.floor(1000 + Math.random() * 9000);

    const sizeStock = body.sizeStock || { '6': 10, '7': 10, '8': 10, '9': 10, '10': 10 };
    const computedTotalStock = Object.values(sizeStock).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
    
    const productData = {
      id: newId,
      name: body.name.trim(),
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
      stock: computedTotalStock > 5 ? 'in-stock' : computedTotalStock > 0 ? 'low-stock' : 'out-of-stock',
      sizes: body.sizes || ['6', '7', '8', '9', '10'],
      sizeStock: sizeStock,
      sku: body.sku || `${newId}-MAIN`.toUpperCase(),
      manageStock: body.manageStock === undefined ? true : !!body.manageStock,
      stockQty: body.stockQty !== undefined ? parseInt(body.stockQty) : computedTotalStock,
      lowStockThreshold: parseInt(body.lowStockThreshold) || 5,
      allowBackorders: body.allowBackorders || 'no',
      soldIndividually: !!body.soldIndividually,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('products').insertOne(productData);
    
    return NextResponse.json({ success: true, message: 'Footwear added successfully!', data: productData });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
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
    
    const db = await getDb();
    const filter = getProductFilter(id);
    const result = await db.collection('products').deleteOne(filter);
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
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
    
    const db = await getDb();
    const filter = getProductFilter(id);

    // If sizeStock is updated, re-calculate total stock quantity
    if (updateData.sizeStock && typeof updateData.sizeStock === 'object') {
      const computedTotal = Object.values(updateData.sizeStock).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
      updateData.stockQty = computedTotal;
      updateData.stock = computedTotal > 5 ? 'in-stock' : computedTotal > 0 ? 'low-stock' : 'out-of-stock';
    }
    updateData.updatedAt = new Date().toISOString();
    
    const result = await db.collection('products').updateOne(
      filter,
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
        error: "Database Connection Failed. Please verify your MongoDB configuration."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
