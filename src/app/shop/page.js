'use client';

import React, { useTransition, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/data/products';

function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read URL search params
  const category = searchParams.get('category') || 'all';
  const type = searchParams.get('type') || 'all';
  const sort = searchParams.get('sort') || 'default';
  const q = searchParams.get('q') || '';

  // Helper to update query parameters in URL
  const updateQuery = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Smooth navigation transition
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Perform filtration locally from imported dataset
  let filteredProducts = PRODUCTS.filter((product) => {
    // 1. Category Filter
    if (category !== 'all' && product.category !== category) {
      return false;
    }
    // 2. Type Filter
    if (type !== 'all' && product.type !== type) {
      return false;
    }
    // 3. Search text query
    if (q) {
      const queryLower = q.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(queryLower);
      const descMatch = product.desc.toLowerCase().includes(queryLower);
      if (!nameMatch && !descMatch) {
        return false;
      }
    }
    return true;
  });

  // Perform sorting
  if (sort === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const categoryTitles = {
    all: 'Artisanal Footwear Catalog',
    mens: "Men's Footwear Collection",
    womens: "Women's Footwear Collection"
  };

  return (
    <>
      {/* ========================================== */}
      {/* SECTION 3: SHOP HERO BANNER                */}
      {/* ========================================== */}
      <section className="page-hero" id="shop-hero-section" style={{ backgroundImage: "url('/og_image.png')" }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Limited Weaves</span>
          <h1 className="page-hero-title">{categoryTitles[category]}</h1>
          <p className="page-hero-desc">Browse our premium catalog of men's and women's slides, sandals, and loafers handcrafted using animal-free vegan leather and woven heritage weaves.</p>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 4: SUB-CATEGORY TAB FILTER         */}
      {/* ========================================== */}
      <section className="container" style={{ padding: '3rem 1.5rem 1rem 1.5rem' }} id="shop-tab-filters-section">
        <div className="shop-categories-tab">
          <button 
            className={`category-tab-btn ${category === 'all' ? 'active' : ''}`}
            onClick={() => updateQuery('category', 'all')}
          >
            All Products
          </button>
          <button 
            className={`category-tab-btn ${category === 'mens' ? 'active' : ''}`}
            onClick={() => updateQuery('category', 'mens')}
          >
            Men's Footwear
          </button>
          <button 
            className={`category-tab-btn ${category === 'womens' ? 'active' : ''}`}
            onClick={() => updateQuery('category', 'womens')}
          >
            Women's Footwear
          </button>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 5: FILTER & SORT CONTROLS          */}
      {/* ========================================== */}
      <section className="container" style={{ padding: '0 1.5rem 2rem 1.5rem' }} id="shop-controls-section">
        <div className="shop-filter-bar">
          
          {/* Gender Filter */}
          <div className="filter-group">
            <span className="filter-label">Gender:</span>
            <select 
              value={category} 
              className="filter-select"
              onChange={(e) => updateQuery('category', e.target.value)}
              aria-label="Filter by gender"
            >
              <option value="all">All Genders</option>
              <option value="mens">Men Only</option>
              <option value="womens">Women Only</option>
            </select>
          </div>

          {/* Footwear Type Filter */}
          <div className="filter-group">
            <span className="filter-label">Style Type:</span>
            <select 
              value={type} 
              className="filter-select"
              onChange={(e) => updateQuery('type', e.target.value)}
              aria-label="Filter by footwear type"
            >
              <option value="all">All Styles</option>
              <option value="slides">Slides & Slippers</option>
              <option value="sandals">Sandals</option>
              <option value="loafers">Loafers</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="filter-group" style={{ marginLeft: 'auto' }}>
            <span className="filter-label">Sort By:</span>
            <select 
              value={sort} 
              className="filter-select"
              onChange={(e) => updateQuery('sort', e.target.value)}
              aria-label="Sort products list"
            >
              <option value="default">Default (Popularity)</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Average Rating</option>
            </select>
          </div>

        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 6: PRODUCT GRID CATALOG            */}
      {/* ========================================== */}
      <section className="container" style={{ padding: '0 1.5rem 5rem 1.5rem', minHeight: '40vh' }}>
        {isPending ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>Filtering products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>No products match your filters.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try clearing search queries or checking other styles!</p>
          </div>
        ) : (
          <div className="product-grid shop-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '8rem 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.2rem' }}>Loading shop catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
