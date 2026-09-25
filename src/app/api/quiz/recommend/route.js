import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { occasion, silhouette, comfort } = await request.json();

    const db = await getDb();
    const allProducts = await db.collection('products').find({}).toArray();

    if (!allProducts || allProducts.length === 0) {
      return NextResponse.json({ success: false, error: 'No products in catalog' }, { status: 404 });
    }

    // Weighted scoring algorithm
    const scoredProducts = allProducts.map((p) => {
      let score = 0;
      const descLower = (p.desc || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      const typeLower = (p.type || '').toLowerCase();
      const catLower = (p.category || '').toLowerCase();
      const materialLower = (p.material || '').toLowerCase();

      // Silhouette match (strongest weighting)
      if (silhouette) {
        const silLower = silhouette.toLowerCase();
        if (typeLower.includes(silLower) || catLower.includes(silLower) || nameLower.includes(silLower)) {
          score += 50;
        }
      }

      // Occasion match
      if (occasion) {
        const occLower = occasion.toLowerCase();
        if (occLower === 'festive' || occLower === 'wedding') {
          if (catLower.includes('jutti') || catLower.includes('mojri') || catLower.includes('loafer') || descLower.includes('festive') || descLower.includes('artisan')) {
            score += 35;
          }
        } else if (occLower === 'daily' || occLower === 'casual') {
          if (catLower.includes('slide') || catLower.includes('sandal') || descLower.includes('daily') || descLower.includes('casual')) {
            score += 35;
          }
        } else if (occLower === 'work' || occLower === 'office') {
          if (catLower.includes('loafer') || typeLower.includes('flat') || descLower.includes('formal') || descLower.includes('classic')) {
            score += 35;
          }
        }
      }

      // Comfort priority match
      if (comfort) {
        const comfLower = comfort.toLowerCase();
        if (comfLower.includes('cork') || comfLower.includes('cushion')) {
          if (descLower.includes('cork') || descLower.includes('cushion') || materialLower.includes('cork')) {
            score += 25;
          }
        }
        if (comfLower.includes('lightweight')) {
          if (descLower.includes('lightweight') || descLower.includes('feather') || descLower.includes('eva')) {
            score += 25;
          }
        }
      }

      // Popularity boost based on rating
      score += Math.round((p.rating || 4.5) * 5);

      return { product: p, score };
    });

    scoredProducts.sort((a, b) => b.score - a.score);

    const topMatches = scoredProducts.slice(0, 3).map(({ product, score }) => ({
      _id: product._id.toString(),
      id: product.id || product._id.toString(),
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.mrp,
      image: product.image || (Array.isArray(product.images) ? product.images[0] : '/og_image.png'),
      category: product.category,
      sizes: product.sizes || ['6', '7', '8', '9', '10'],
      color: product.color,
      rating: product.rating,
      score,
      badge: 'Artisan Match',
    }));

    return NextResponse.json({
      success: true,
      matches: topMatches,
      recommended: topMatches[0] || null,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
