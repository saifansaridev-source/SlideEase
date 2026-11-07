import React from 'react';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { PRODUCTS } from '@/data/products';
import ProductDetailsWrapper from '@/components/ProductDetailsWrapper';

export const dynamicParams = true;

const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

function cleanProduct(p) {
  if (!p) return null;
  const cleanVariants = Array.isArray(p.variants)
    ? p.variants.map((v) => ({
        ...v,
        _id: v._id ? v._id.toString() : (v.id || ''),
        id: v.id || slugify(v.name || v.color),
        name: v.name || `${p.name} - ${v.color || 'Variant'}`,
        color: v.color || 'Original',
        colorHex: v.colorHex || v.hex || p.patternColor || '#b45309',
        price: typeof v.price === 'number' ? v.price : p.price,
        originalPrice: typeof v.originalPrice === 'number' ? v.originalPrice : (p.originalPrice || p.price),
        image: v.image || p.image,
        gallery: Array.isArray(v.gallery) && v.gallery.length > 0 ? v.gallery : (p.gallery || [p.image]),
        sizes: Array.isArray(v.sizes) && v.sizes.length > 0 ? v.sizes : (p.sizes || [5, 6, 7, 8]),
        sizeStock: v.sizeStock || p.sizeStock || {},
        stock: v.stock || p.stock || 'in-stock',
        sku: v.sku || (p.sku ? `${p.sku}-${(v.color || 'VAR').toUpperCase().slice(0, 3)}` : `SLX-${p.id}-${(v.color || 'VAR').toUpperCase()}`),
        desc: v.desc || p.desc,
      }))
    : undefined;

  return {
    ...p,
    _id: p._id ? p._id.toString() : (p.id || ''),
    id: p.id || (p._id ? p._id.toString() : slugify(p.name)),
    name: p.name || 'Footwear Product',
    price: typeof p.price === 'number' ? p.price : 1299,
    originalPrice: typeof p.originalPrice === 'number' ? p.originalPrice : (p.price ? p.price + 900 : 2199),
    category: p.category || 'womens',
    image: p.image || '/assets/loafers.png',
    sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [5, 6, 7, 8, 9, 10],
    variants: cleanVariants,
    createdAt: p.createdAt ? (p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt)) : undefined,
    updatedAt: p.updatedAt ? (p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt)) : undefined,
  };
}

async function getProductData(idOrSlug) {
  const cleanId = decodeURIComponent(idOrSlug || '').trim();
  if (!cleanId) return null;

  try {
    const db = await getDb();
    const rawProducts = await db.collection('products').find({}).toArray();
    const dbProducts = rawProducts.map(cleanProduct);

    // Match by ID, database slug, or generated name slug
    let product = dbProducts.find(
      (p) => p.id === cleanId || p.slug === cleanId || slugify(p.name) === cleanId
    );

    if (product) {
      const related = dbProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

      // JSON stringify & parse ensures 100% clean serializable props for Client Components
      return JSON.parse(JSON.stringify({ 
        product, 
        relatedProducts: related, 
        allProducts: dbProducts 
      }));
    }
  } catch (error) {
    console.warn('MongoDB lookup bypassed, falling back to static products:', error.message);
  }

  // Fallback: Check local static PRODUCTS array
  const staticProducts = PRODUCTS.map(cleanProduct);
  const product = staticProducts.find(
    (p) => p.id === cleanId || p.slug === cleanId || slugify(p.name) === cleanId
  );

  if (product) {
    const related = staticProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    return JSON.parse(JSON.stringify({ 
      product, 
      relatedProducts: related, 
      allProducts: staticProducts 
    }));
  }

  return null;
}

// 1. Dynamic SEO Metadata Generator (using metadataBase from RootLayout, no headers() bailouts)
export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data || !data.product) {
    return {
      title: 'Product Not Found | SlideEase Footwear',
      description: 'The requested footwear item could not be found.'
    };
  }

  const { product } = data;
  const imageUrl = product.image || '/assets/loafers.png';
  const cleanDescription = (product.desc || product.shortDesc || 'Premium handcrafted vegan slides and footwear.')
    .replace(/<[^>]*>/g, '')
    .substring(0, 160);

  return {
    title: `${product.name} | SlideEase Footwear`,
    description: cleanDescription,
    openGraph: {
      title: `${product.name} | SlideEase Footwear`,
      description: cleanDescription,
      url: `/product/${id}`,
      siteName: 'SlideEase Footwear',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | SlideEase Footwear`,
      description: cleanDescription,
      images: [imageUrl]
    }
  };
}

// 2. Pre-generate static paths for existing catalog products
export async function generateStaticParams() {
  const params = [];
  PRODUCTS.forEach((p) => {
    if (p.id) params.push({ id: p.id });
    const slug = slugify(p.name);
    if (slug && slug !== p.id) params.push({ id: slug });
  });
  return params;
}

// 3. Main Server Page Component
export default async function ProductPage({ params }) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data || !data.product) {
    notFound();
  }

  return (
    <ProductDetailsWrapper 
      product={data.product} 
      relatedProducts={data.relatedProducts || []} 
      allProducts={data.allProducts || []}
    />
  );
}
