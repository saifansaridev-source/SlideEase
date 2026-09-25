import React from 'react';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { getDb } from '@/lib/mongodb';
import { PRODUCTS } from '@/data/products';
import ProductDetailsWrapper from '@/components/ProductDetailsWrapper';

const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

async function getProductData(idOrSlug) {
  try {
    const db = await getDb();
    const rawProducts = await db.collection('products').find({}).toArray();
    const dbProducts = rawProducts.map(p => ({
      ...p,
      _id: p._id ? p._id.toString() : p.id
    }));

    // Match by ID, database slug, or generated name slug
    let product = dbProducts.find(
      (p) => p.id === idOrSlug || p.slug === idOrSlug || slugify(p.name) === idOrSlug
    );

    if (product) {
      const related = dbProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

      return { product, relatedProducts: related, allProducts: dbProducts };
    }
  } catch (error) {
    console.error('Failed to query product from MongoDB:', error.message);
  }

  // Fallback: Check local static PRODUCTS array
  const product = PRODUCTS.find(
    (p) => p.id === idOrSlug || slugify(p.name) === idOrSlug
  );

  if (product) {
    const related = PRODUCTS
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    return { product, relatedProducts: related, allProducts: PRODUCTS };
  }

  return null;
}

// 1. Dynamic SEO Metadata Generator for WhatsApp/Social Shares
export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data) {
    return {
      title: 'Product Not Found | SlideEase Footwear',
      description: 'The requested footwear item could not be found.'
    };
  }

  const { product } = data;

  // Resolve headers to fetch active host domain to build absolute URLs for social sharing cards
  const headerList = await headers();
  const host = headerList.get('host') || 'localhost:3000';
  const proto = headerList.get('x-forwarded-proto') || 'http';
  const siteUrl = `${proto}://${host}`;

  // Make image URL absolute (e.g. converting '/assets/loafers.png' -> 'https://domain.com/assets/loafers.png')
  const absoluteImageUrl = product.image.startsWith('http')
    ? product.image
    : `${siteUrl}${product.image}`;

  // Remove HTML tags from descriptions for plain text previews
  const cleanDescription = (product.desc || product.shortDesc || 'Premium handcrafted vegan slides and footwear.')
    .replace(/<[^>]*>/g, '')
    .substring(0, 160);

  return {
    title: `${product.name} | SlideEase Footwear`,
    description: cleanDescription,
    openGraph: {
      title: `${product.name} | SlideEase Footwear`,
      description: cleanDescription,
      url: `${siteUrl}/product/${id}`,
      siteName: 'SlideEase Footwear',
      type: 'website',
      images: [
        {
          url: absoluteImageUrl,
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
      images: [absoluteImageUrl]
    }
  };
}

// 2. Allow on-demand page generation for database products
export async function generateStaticParams() {
  return [];
}

// 3. Main Server Page Component
export default async function ProductPage({ params }) {
  const { id } = await params;
  const data = await getProductData(id);

  if (!data) {
    notFound();
  }

  return (
    <ProductDetailsWrapper 
      product={data.product} 
      relatedProducts={data.relatedProducts} 
      allProducts={data.allProducts || []}
    />
  );
}
