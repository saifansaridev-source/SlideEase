'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import NewArrivalsSlider from '@/components/NewArrivalsSlider';
import ProductCard from '@/components/ProductCard';
import Turntable360 from '@/components/Turntable360';
import StyleQuizModal from '@/components/StyleQuizModal';
import { PRODUCTS } from '@/data/products';
import { DEFAULT_SECTION_IMAGES } from '@/lib/cms-defaults';

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState(PRODUCTS);
  const [cmsImages, setCmsImages] = useState(DEFAULT_SECTION_IMAGES);

  useEffect(() => {
    // 1. Fetch live database products
    fetch('/api/products')
      .then((r) => r.json())
      .then((res) => {
        const prods = res.data || res.products;
        if (res.success && Array.isArray(prods) && prods.length > 0) {
          setCatalogProducts(prods);
        }
      })
      .catch(() => {});

    // 2. Fetch admin-managed section images
    fetch('/api/settings/cms-sections')
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.images) {
          setCmsImages((prev) => ({ ...prev, ...res.images }));
        }
      })
      .catch(() => {});
  }, []);

  // Dynamically derive sections from database products
  const newArrivals = catalogProducts.slice(0, 6);
  const bestSellers = [...catalogProducts]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  const testimonials = [
    {
      stars: '★ ★ ★ ★ ★',
      text: '"I bought the Peacock Ikat Loafers, and they have become my absolute favorite daily wear! The memory foam cushioning is so comfortable, and I get compliments at my office every day. Plus, knowing it is cruelty-free makes it even better!"',
      author: 'Prerna Sharma',
      role: 'Verified Buyer, Mumbai'
    },
    {
      stars: '★ ★ ★ ★ ★',
      text: '"The Royal Mandala Slides for men are incredibly sturdy and elegant. They pair perfectly with both my kurtas and linen trousers. Ordering was simple, and the checkout was very quick. Exceptional craftsmanship!"',
      author: 'Rohan Mehta',
      role: 'Verified Buyer, Bangalore'
    },
    {
      stars: '★ ★ ★ ★ ★',
      text: '"Absolutely love the brand philosophy! Combining Indian craftsmanship with modern soles is genius. The Indore Paisley sandals are super soft, no shoe bites at all. Strongly recommend SlideEase!"',
      author: 'Anjali Nair',
      role: 'Verified Buyer, Kochi'
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <>
      {/* SECTION 1: HERO BANNER CAROUSEL */}
      <HeroCarousel />

      {/* SECTION 2: QUICK CATEGORY GRID (SHOP BY STYLE) */}
      <section className="category-quick-section section-padding" id="category-grid-section">
        <div className="container">
          <h2 className="section-title">Shop By Style</h2>
          <p className="section-subtitle">Find your perfect pair from our curated catalog categories</p>
          
          <div className="category-quick-grid">
            {/* Card 1: Men's Slides */}
            <Link href="/shop?category=mens&type=slides" className="category-quick-card" id="category-mens">
              <div className="category-circle-wrapper">
                <img 
                  src={cmsImages.styleImage1 || '/assets/slides.png'} 
                  alt="Men's Slides" 
                  className="category-circle-img" 
                />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Men's Slides</span>
              <span className="category-count-text">12 Handcrafted Styles</span>
            </Link>

            {/* Card 2: Women's Sandals */}
            <Link href="/shop?category=womens&type=sandals" className="category-quick-card" id="category-womens">
              <div className="category-circle-wrapper">
                <img 
                  src={cmsImages.styleImage2 || '/assets/sandals.png'} 
                  alt="Women's Sandals" 
                  className="category-circle-img" 
                />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Women's Sandals</span>
              <span className="category-count-text">18 Handcrafted Styles</span>
            </Link>

            {/* Card 3: Premium Loafers */}
            <Link href="/shop?type=loafers" className="category-quick-card" id="category-loafers">
              <div className="category-circle-wrapper">
                <img 
                  src={cmsImages.styleImage3 || '/assets/loafers.png'} 
                  alt="Premium Loafers" 
                  className="category-circle-img" 
                />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Premium Loafers</span>
              <span className="category-count-text">9 Handcrafted Styles</span>
            </Link>

            {/* Card 4: Artisan Mojris */}
            <Link href="/shop?category=womens&type=sandals" className="category-quick-card" id="category-mojris">
              <div className="category-circle-wrapper">
                <img 
                  src={cmsImages.styleImage4 || '/assets/mojris.png'} 
                  alt="Traditional Mojris & Juttis" 
                  className="category-circle-img" 
                />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Artisan Mojris</span>
              <span className="category-count-text">15 Handcrafted Styles</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: CRAFT JOURNEY (STORYTELLING) */}
      <section className="craft-journey-section" id="craft-journey">
        <div className="container">
          <div className="craft-journey-header">
            <span className="craft-eyebrow">✦ The Arc of Living Craft</span>
            <h2 className="section-title">From Natural Earth to Modern Movement</h2>
            <p className="section-subtitle">We bridge ancestral Indian artisan heritage with contemporary ergonomic footwear design. No mass factories, zero animal harm.</p>
          </div>

          <div className="craft-journey-grid">
            {/* Step 1 */}
            <div className="craft-step-card">
              <span className="craft-step-num">01</span>
              <div className="craft-step-icon-wrap" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <h3 className="craft-step-title">Earth & Material</h3>
              <p className="craft-step-text">Plant-based cork leather harvested ethically without felling oak trees, hand-spun organic cotton canvas, and natural vegetable dyes that mature gracefully over time.</p>
              <div className="craft-material-tags">
                <span className="craft-tag">Harvested Cork</span>
                <span className="craft-tag">100% PETA Vegan</span>
                <span className="craft-tag">Natural Dyes</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="craft-step-card">
              <span className="craft-step-num">02</span>
              <div className="craft-step-icon-wrap" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
                  <path d="M18 15v4a2 2 0 0 1-2 2H6"/>
                  <circle cx="18" cy="6" r="3"/>
                </svg>
              </div>
              <h3 className="craft-step-title">Artisan Hands</h3>
              <p className="craft-step-text">Master craftspeople in Gujarat, Rajasthan, and Madhya Pradesh stitch each upper by hand. From intricate Kutch mirror embroidery to ancestral Ikat warp weaving, every pair carries living culture.</p>
              <div className="craft-material-tags">
                <span className="craft-tag">Kutch Mirrorwork</span>
                <span className="craft-tag">Ikat Weaving</span>
                <span className="craft-tag">Fair-Trade Guild</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="craft-step-card">
              <span className="craft-step-num">03</span>
              <div className="craft-step-icon-wrap" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                  <path d="M12 12v9"/>
                  <path d="m8 17 4 4 4-4"/>
                </svg>
              </div>
              <h3 className="craft-step-title">Modern Ergonomics</h3>
              <p className="craft-step-text">Re-engineered for all-day urban steps. Dual-density memory foam footbeds contour to your unique arch, backed by shock-dampening textured rubber outsoles.</p>
              <div className="craft-material-tags">
                <span className="craft-tag">Dual Memory Foam</span>
                <span className="craft-tag">Arch Support</span>
                <span className="craft-tag">Zero Shoe-Bites</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: NEW ARRIVALS HORIZONTAL SLIDER */}
      <section className="section-padding" id="new-arrivals-section" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
          <p className="section-subtitle">Discover the latest additions to our premium handcrafted luxury collection.</p>
          
          <NewArrivalsSlider products={newArrivals} />
        </div>
      </section>

      {/* SECTION 5: CURATED BEST SELLERS GRID */}
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

      {/* SECTION 6: ARTISAN QUOTE BEAT (RAMJIBHAI VANKAR) */}
      <section className="artisan-quote-beat" id="artisan-beat-section">
        <div className="container">
          <div className="artisan-beat-grid">
            <div className="artisan-portrait-wrapper">
              <img 
                src={cmsImages.ramjiLeftImage || "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800&auto=format&fit=crop&q=80"} 
                alt="Master Artisan Ramjibhai at work" 
              />
              <div className="artisan-portrait-badge">
                <div className="artisan-name">Ramjibhai Vankar</div>
                <div className="artisan-craft">Master Weaver & Shoemaker • Bhujodi, Kutch</div>
              </div>
            </div>
            <div className="artisan-quote-content">
              <div className="artisan-quote-mark">“</div>
              <blockquote className="artisan-quote-text">
                When you stitch heritage motifs into footwear, you aren't just joining two pieces of fabric. You are keeping three generations of our village's songs and rhythm awake under your feet.
              </blockquote>
              <p className="artisan-quote-footnote">
                Every SlideEase pair directly supports generational artisan families with fair living wages, safe workshop environments, and deep pride in keeping India's craft legacy moving forward into the modern world.
              </p>
              <div style={{ marginTop: '24px' }}>
                <Link href="/about" className="btn-hairline-gold">
                  Discover Our Artisan Collective →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: INTERACTIVE 360° PRODUCT STUDIO */}
      <Turntable360 />

      {/* SECTION 8: BRAND STORY (MODERN INDIAN CLASSIC) */}
      <section className="brand-story-section section-padding" id="brand-heritage-section">
        <div className="container">
          <div className="brand-story-grid">
            <div className="brand-story-text">
              <span className="brand-story-sub">Modern Indian Classic</span>
              <h2 className="brand-story-h2">Shoes that Walk with Culture</h2>
              <p className="brand-story-p">
                SlideEase was born out of a desire to create comfortable, everyday footwear that honors traditional Indian crafts without compromising on modern functionality or animal ethics. Our shoes are handcrafted proudly by local Indian artisans, bringing you the richness of Ikat, Velvet, and Paisley weaves combined with 100% PETA-approved cruelty-free vegan leather.
              </p>
              <p className="brand-story-p">
                Every pair goes through stringent quality checks, utilizing double-padded memory foam in the base, guaranteeing you look sleek and walk light, all day long.
              </p>
              
              <div className="brand-story-features">
                <div className="story-feature-item">
                  <div className="story-feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="story-feature-title">100% PETA Vegan</h4>
                    <p className="story-feature-desc">Zero animal products. Sleek cruelty-free materials.</p>
                  </div>
                </div>
                <div className="story-feature-item">
                  <div className="story-feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="story-feature-title">Artisan Made</h4>
                    <p className="story-feature-desc">Handcrafted locally, celebrating Indian weave heritage.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="brand-story-image">
              <img 
                src={cmsImages.modernClassicImage || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80"} 
                alt="Artisanal shoemaking process" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: 1.25, borderRadius: 'var(--radius-md)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: HOW TO STYLE SLIDEEASE (PREMIUM FASHION LOOKBOOK) */}
      <section className="materials-section section-padding" id="how-to-style-section" style={{ backgroundColor: 'var(--bg-white)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
            <span className="craft-eyebrow">✦ Sartorial Synergy</span>
            <h2 className="section-title">How To Style SlideEase</h2>
            <p className="section-subtitle">Curated styling inspiration bridging ethnic grandeur with modern metropolitan tailoring.</p>
          </div>
          
          <div className="materials-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            {/* Card 1: Ethno-Formal Look */}
            <div className="material-card" style={{ background: '#fbf9f5', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <div className="material-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(26, 35, 50, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 8 8h8l-4-6Z"/>
                  <path d="M8 8v14h8V8"/>
                  <path d="M4 10h16"/>
                </svg>
              </div>
              <h3 className="material-h3" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>Ethno-Formal Elegance</h3>
              <p className="material-desc" style={{ lineHeight: 1.6, fontSize: '0.88rem' }}>
                Pair our Maharaja Velvet Loafers or Royal Mandala slides with raw silk Nehru jackets, crisp bandhgalas, or handloom kurtas for celebrations and black-tie evenings.
              </p>
            </div>

            {/* Card 2: Smart-Casual Appeal */}
            <div className="material-card" style={{ background: '#fbf9f5', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <div className="material-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(26, 35, 50, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 className="material-h3" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>Smart-Casual Appeal</h3>
              <p className="material-desc" style={{ lineHeight: 1.6, fontSize: '0.88rem' }}>
                Slip on the Peacock Ikat Loafers or Classic Tan Vegan slides with tapered linen chinos, polo shirts, or selvedge denim for relaxed boardrooms and weekend retreats.
              </p>
            </div>

            {/* Card 3: Bohemian Daywear */}
            <div className="material-card" style={{ background: '#fbf9f5', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <div className="material-icon-wrapper" style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(26, 35, 50, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 className="material-h3" style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>Contemporary Bohemian</h3>
              <p className="material-desc" style={{ lineHeight: 1.6, fontSize: '0.88rem' }}>
                Match Jaipur Floral Mojris or Kashmiri Aari Slides with breathable maxi dresses, organic cotton kaftans, or indigo-dyed kurtis for an effortless artistic silhouette.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 10: MATERIALS SPOTLIGHT */}
      <section className="materials-section section-padding" id="materials-spotlight-section">
        <div className="container">
          <h2 className="section-title">Designed with Ethics & Ergonomics</h2>
          <p className="section-subtitle">Take a closer look at the advanced materials engineered into every pair of SlideEase footwear.</p>
          
          <div className="materials-grid">
            <div className="material-card">
              <div className="material-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <h3 className="material-h3">Vegan Leather</h3>
              <p className="material-desc">100% animal-free synthetic leather that mimics the durability and suppleness of real leather, while staying water-resistant and breathable.</p>
            </div>

            <div className="material-card">
              <div className="material-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                </svg>
              </div>
              <h3 className="material-h3">Cushioned Memory Foam</h3>
              <p className="material-desc">Our footbeds feature double-layered memory foam insoles that contour to your feet to reduce arch pressure and absorb walking shock.</p>
            </div>

            <div className="material-card">
              <div className="material-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
                  <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                  <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
                  <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                </svg>
              </div>
              <h3 className="material-h3">Artisanal Woven Canvas</h3>
              <p className="material-desc">Handcrafted canvas accents colored with natural vegetable dyes, celebrating patterns like Ikat, Mandala block prints, and embroidery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11: STYLE QUIZ TEASER */}
      <section className="quiz-teaser-section" id="style-quiz-teaser">
        <div className="container">
          <div className="quiz-teaser-content">
            <div className="quiz-teaser-text">
              <span className="craft-eyebrow">✦ Find Your Footing</span>
              <h3>Not Sure Which Silhouette Fits Your Life?</h3>
              <p>Answer 3 quick questions about your occasion, preferred silhouette, and comfort needs. Our styling concierge will match you with your ideal handcrafted pair.</p>
            </div>
            <div>
              <button className="btn btn-accent" onClick={() => setIsQuizOpen(true)} style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Take the 60-Second Style Quiz →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: SLIDEEASE CIRCLE LOYALTY */}
      <section className="slidex-circle-section" id="slideease-circle">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
            <span className="craft-eyebrow">✦ The Circle of Craft</span>
            <h2 className="section-title">Join the SlideEase Circle</h2>
            <p className="section-subtitle">A loyalty collective celebrating return patronage, artisan appreciation, and conscious living. Earn points on every handcrafted step.</p>
          </div>

          <div className="circle-tiers-grid">
            {/* Tier 1 */}
            <div className="tier-card">
              <span className="tier-badge">Entry Tier</span>
              <h3 className="tier-name">Artisan Apprentice</h3>
              <p className="tier-points">0 – 499 Circle Points</p>
              <ul className="tier-perks-list">
                <li>5 Circle Points for every ₹100 spent</li>
                <li>Early preview of seasonal collections</li>
                <li>Complimentary Pan-India express delivery</li>
                <li>Digital shoe care & artisan guide</li>
              </ul>
              <Link href="/login" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                Join Free Today
              </Link>
            </div>

            {/* Tier 2 (Featured) */}
            <div className="tier-card featured">
              <span className="tier-badge" style={{ background: 'var(--accent-color)', color: '#1a2332' }}>Most Popular</span>
              <h3 className="tier-name">Craft Connoisseur</h3>
              <p className="tier-points">500 – 1,499 Circle Points</p>
              <ul className="tier-perks-list">
                <li>8 Circle Points for every ₹100 spent</li>
                <li>24-Hour early access to limited artisan drops</li>
                <li>Annual birthday gift & double points day</li>
                <li>Free monogrammed linen dust bag with every order</li>
              </ul>
              <Link href="/shop" className="btn btn-accent" style={{ width: '100%', textAlign: 'center' }}>
                Explore & Earn Points
              </Link>
            </div>

            {/* Tier 3 */}
            <div className="tier-card">
              <span className="tier-badge">Private Guild</span>
              <h3 className="tier-name">Master Guild VIP</h3>
              <p className="tier-points">1,500+ Circle Points</p>
              <ul className="tier-perks-list">
                <li>12 Circle Points for every ₹100 spent</li>
                <li>Custom bespoke sizing consultations</li>
                <li>Lifetime complimentary sole repair service</li>
                <li>Invitation to annual artisan guild workshops</li>
              </ul>
              <Link href="/contact" className="btn btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                Guild Inquiries
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13: CUSTOMER TESTIMONIALS */}
      <section className="testimonials-section section-padding" id="customer-reviews-section">
        <div className="container">
          <h2 className="section-title">Loved by Thousands</h2>
          <p className="section-subtitle">Here is what our happy customers say about their walking comfort in SlideEase.</p>
          
          <div className="testimonial-slider">
            {testimonials.map((t, idx) => (
              <div key={idx} className={`testimonial-card ${activeTestimonial === idx ? 'active' : ''}`} style={{ display: activeTestimonial === idx ? 'block' : 'none' }}>
                <div className="testimonial-stars" style={{ color: 'var(--accent-color)', fontSize: '1.2rem', marginBottom: '12px' }}>{t.stars}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author" style={{ fontWeight: 700, marginTop: '14px', color: 'var(--primary-color)' }}>{t.author}</div>
                <div className="testimonial-author-role" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.role}</div>
              </div>
            ))}
            
            <div className="testimonial-nav-dots" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {testimonials.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`testimonial-dot ${activeTestimonial === idx ? 'active' : ''}`}
                  onClick={() => setActiveTestimonial(idx)}
                  style={{
                    width: activeTestimonial === idx ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: activeTestimonial === idx ? 'var(--accent-color)' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 14: TRUST BADGES */}
      <section className="trust-badges-section" id="brand-trust-badges-section">
        <div className="container">
          <div className="trust-badges-grid">
            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <h4 className="trust-badge-title">PETA Approved</h4>
              <p className="trust-badge-desc">100% Vegan Materials Only</p>
            </div>

            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
                  <path d="M18 15v4a2 2 0 0 1-2 2H6"/>
                  <circle cx="18" cy="6" r="3"/>
                </svg>
              </div>
              <h4 className="trust-badge-title">Indian Heritage</h4>
              <p className="trust-badge-desc">Handcrafted by Local Artisans</p>
            </div>

            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h4 className="trust-badge-title">Free Shipping</h4>
              <p className="trust-badge-desc">On all orders above ₹999</p>
            </div>

            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
              </div>
              <h4 className="trust-badge-title">Easy Exchange</h4>
              <p className="trust-badge-desc">7-day hassle-free exchanges</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 15: INSTAGRAM COMMUNITY GALLERY */}
      <section className="section-padding" id="instagram-gallery-section" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-white)' }}>
        <div className="container">
          <h2 className="section-title">Follow Us on Instagram</h2>
          <p className="section-subtitle">
            See how our fashion community styles their SlideEase Footwear. Follow <a href="https://instagram.com/slideease" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-dark)', fontWeight: 600 }}>@SlideEase</a>
          </p>
          
          <div className="instagram-grid">
            <div className="instagram-item">
              <img src={cmsImages.instagramImage1 || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80"} alt="Instagram Post 1" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 1.2k</span></div>
            </div>
            <div className="instagram-item">
              <img src={cmsImages.instagramImage2 || "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80"} alt="Instagram Post 2" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 980</span></div>
            </div>
            <div className="instagram-item">
              <img src={cmsImages.instagramImage3 || "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80"} alt="Instagram Post 3" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 1.5k</span></div>
            </div>
            <div className="instagram-item">
              <img src={cmsImages.instagramImage4 || "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&auto=format&fit=crop&q=80"} alt="Instagram Post 4" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 870</span></div>
            </div>
            <div className="instagram-item">
              <img src={cmsImages.instagramImage5 || "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80"} alt="Instagram Post 5" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 2.1k</span></div>
            </div>
            <div className="instagram-item">
              <img src={cmsImages.instagramImage6 || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop&q=80"} alt="Instagram Post 6" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 1.1k</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Style Quiz Modal */}
      <StyleQuizModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </>
  );
}
