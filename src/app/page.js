import React from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import NewArrivalsSlider from '@/components/NewArrivalsSlider';
import ProductCard from '@/components/ProductCard';
import { PRODUCTS } from '@/data/products';

export default function Home() {
  // Extract products
  const newArrivals = PRODUCTS.slice(0, 6);
  const bestSellers = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <>
      {/* Hero Carousel Banner */}
      <HeroCarousel />

      {/* ========================================== */}
      {/* SECTION 4: QUICK CATEGORY GRID             */}
      {/* ========================================== */}
      <section className="category-quick-section section-padding" id="category-grid-section">
        <div className="container">
          <h2 className="section-title">Shop By Style</h2>
          <p className="section-subtitle">Find your perfect pair from our curated catalog categories</p>
          
          <div className="category-quick-grid">
            {/* Card 1 */}
            <Link href="/shop?category=mens" className="category-quick-card" id="category-mens">
              <div className="category-circle-wrapper">
                <svg viewBox="0 0 100 100" className="category-circle-img" fill="currentColor">
                  <path d="M15,65 C10,55 12,35 25,25 C35,17 70,12 85,25 C95,35 90,65 75,70 C60,75 25,75 15,65 Z" fill="#0b485d"/>
                  <path d="M20,45 C40,40 75,45 80,35" stroke="#c48a43" strokeWidth="4" fill="none"/>
                </svg>
              </div>
              <span className="category-title-text">Men's Slides</span>
            </Link>
            {/* Card 2 */}
            <Link href="/shop?category=womens" className="category-quick-card" id="category-womens">
              <div className="category-circle-wrapper">
                <svg viewBox="0 0 100 100" className="category-circle-img" fill="currentColor">
                  <path d="M15,65 C10,55 12,35 25,25 C35,17 70,12 85,25 C95,35 90,65 75,70 C60,75 25,75 15,65 Z" fill="#701a75"/>
                  <path d="M22,35 C32,25 68,25 78,35" stroke="#c48a43" strokeWidth="4" fill="none"/>
                </svg>
              </div>
              <span className="category-title-text">Women's Sandals</span>
            </Link>
            {/* Card 3 */}
            <Link href="/shop?sort=rating" className="category-quick-card" id="category-bestsellers">
              <div className="category-circle-wrapper" style={{ backgroundColor: 'var(--accent-light)' }}>
                <svg viewBox="0 0 100 100" className="category-circle-img" fill="currentColor">
                  <path d="M15,65 C10,55 12,35 25,25 C35,17 70,12 85,25 C95,35 90,65 75,70 C60,75 25,75 15,65 Z" fill="#c48a43"/>
                  <circle cx="50" cy="45" r="10" stroke="#fdfbf7" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <span className="category-title-text">Best Sellers</span>
            </Link>
            {/* Card 4 */}
            <Link href="/shop?type=loafers" className="category-quick-card" id="category-loafers">
              <div className="category-circle-wrapper">
                <svg viewBox="0 0 100 100" className="category-circle-img" fill="currentColor">
                  <path d="M15,65 C10,55 12,35 25,25 C35,17 70,12 85,25 C95,35 90,65 75,70 C60,75 25,75 15,65 Z" fill="#1e293b"/>
                  <rect x="35" y="38" width="30" height="8" rx="2" fill="#c48a43"/>
                </svg>
              </div>
              <span className="category-title-text">Premium Loafers</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 4.5: NEW ARRIVALS HORIZONTAL SLIDER */}
      {/* ========================================== */}
      <section className="section-padding" id="new-arrivals-section" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">Discover the latest additions to our premium handcrafted luxury collection.</p>
          
          <NewArrivalsSlider products={newArrivals} />
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 5: CURATED BEST SELLERS GRID       */}
      {/* ========================================== */}
      <section className="section-padding" id="bestsellers-products-section">
        <div className="container">
          <h2 className="section-title">Most Loved Footwear</h2>
          <p className="section-subtitle">Highly rated vegan footwear adored by our clients across the nation.</p>
          
          <div className="product-grid best-sellers-grid">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link href="/shop" className="btn btn-primary">
              View Full Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 6: BRAND STORY                     */}
      {/* ========================================== */}
      <section className="brand-story-section section-padding" id="brand-heritage-section">
        <div className="container">
          <div className="brand-story-grid">
            
            {/* Text details */}
            <div className="brand-story-text">
              <span className="brand-story-sub">Modern Indian Classic</span>
              <h2 className="brand-story-h2">Shoes that Walk with Culture</h2>
              <p className="brand-story-p">Slidex Footwear was born out of a desire to create comfortable, everyday footwear that honors traditional Indian crafts without compromising on modern functionality or animal ethics. Our shoes are handcrafted proudly by local Indian artisans, bringing you the richness of Ikat, Velvet, and Paisley weaves combined with 100% PETA-approved cruelty-free vegan leather.</p>
              <p className="brand-story-p">Every pair goes through stringent quality checks, utilizing double-padded memory foam in the base, guaranteeing you look sleek and walk light, all day long.</p>
              
              <div className="brand-story-features">
                <div className="story-feature-item">
                  <span className="story-feature-icon">🌿</span>
                  <div>
                    <h4 className="story-feature-title">100% PETA Vegan</h4>
                    <p className="story-feature-desc">Zero animal products. Sleek cruelty-free materials.</p>
                  </div>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-icon">🇮🇳</span>
                  <div>
                    <h4 className="story-feature-title">Artisan Made</h4>
                    <p className="story-feature-desc">Handcrafted locally, celebrating Indian weave heritage.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual element */}
            <div className="brand-story-image">
              <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80" alt="Artisanal shoemaking process" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: 1.25 }} />
            </div>

          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* SECTION 7: MATERIALS SPOTLIGHT             */}
      {/* ========================================== */}
      <section className="materials-section section-padding" id="materials-spotlight-section">
        <div className="container">
          <h2 className="section-title">Designed with Ethics & Ergonomics</h2>
          <p className="section-subtitle">Take a closer look at the advanced materials engineered into every pair of Slidex footwear.</p>
          
          <div className="materials-grid">
            {/* Material 1 */}
            <div className="material-card">
              <div className="material-icon-wrapper">🌱</div>
              <h3 className="material-h3">Vegan Leather</h3>
              <p className="material-desc">100% animal-free synthetic leather that mimics the durability and suppleness of real leather, while staying water-resistant and breathable.</p>
            </div>
            {/* Material 2 */}
            <div className="material-card">
              <div className="material-icon-wrapper">☁️</div>
              <h3 className="material-h3">Cushioned Memory Foam</h3>
              <p className="material-desc">Our outsoles feature double-layered memory foam insoles that contour to your feet to reduce arch pressure and absorb walking shock.</p>
            </div>
            {/* Material 3 */}
            <div className="material-card">
              <div className="material-icon-wrapper">🎨</div>
              <h3 className="material-h3">Artisanal Woven Canvas</h3>
              <p className="material-desc">Handcrafted canvas accents colored with natural vegetable dyes, celebrating patterns like Ikat, Mandala block prints, and embroidery.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
