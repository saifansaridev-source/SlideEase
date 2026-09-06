import clientPromise from '@/lib/mongodb';
import { PRODUCTS } from '@/data/products';
import { NextResponse } from 'next/server';
import { isConnectionError } from '@/lib/dbFallback';

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    // Check if products collection has items
    const count = await db.collection('products').countDocuments();
    if (count === 0) {
      // Seed collection with static products list
      await db.collection('products').insertMany(PRODUCTS);
    }
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const sort = searchParams.get('sort');
    const search = searchParams.get('q');
    const color = searchParams.get('color');
    const material = searchParams.get('material');
    
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (color && color !== 'all') {
      filter.color = { $regex: `^${color.trim()}$`, $options: 'i' };
    }
    if (material && material !== 'all') {
      const cleanMat = material.replace(/-/g, '.*');
      filter.material = { $regex: cleanMat, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortOption = {};
    if (sort === 'price-low') {
      sortOption.price = 1;
    } else if (sort === 'price-high') {
      sortOption.price = -1;
    } else if (sort === 'rating') {
      sortOption.rating = -1;
    } else {
      sortOption.rating = -1; // default sort by rating / popularity
    }
    
    const products = await db.collection('products').find(filter).sort(sortOption).toArray();
    
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using static catalog fallback.", error.message);
      
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const type = searchParams.get('type');
      const sort = searchParams.get('sort');
      const search = searchParams.get('q');
      const color = searchParams.get('color');
      const material = searchParams.get('material');
      
      // Local filter logic
      let filtered = [...PRODUCTS];
      if (category && category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
      }
      if (type && type !== 'all') {
        filtered = filtered.filter(p => p.type === type);
      }
      if (color && color !== 'all') {
        filtered = filtered.filter(p => (p.color || '').toLowerCase() === color.toLowerCase().trim());
      }
      if (material && material !== 'all') {
        const clean = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const targetMat = clean(material);
        filtered = filtered.filter(p => {
          const pMat = clean(p.material);
          return pMat.includes(targetMat) || targetMat.includes(pMat);
        });
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.desc.toLowerCase().includes(query)
        );
      }
      
      // Local sort logic
      if (sort === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        filtered.sort((a, b) => b.rating - a.rating);
      }
      
      return NextResponse.json({ success: true, data: filtered, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
