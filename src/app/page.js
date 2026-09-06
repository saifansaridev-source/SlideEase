'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/HeroCarousel';
import NewArrivalsSlider from '@/components/NewArrivalsSlider';
import ProductCard from '@/components/ProductCard';
import Turntable360 from '@/components/Turntable360';
import StyleQuizModal from '@/components/StyleQuizModal';
import { PRODUCTS } from '@/data/products';

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Extract products from database dataset
  const newArrivals = PRODUCTS.slice(0, 6);
  const bestSellers = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 4);

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
      text: '"Absolutely love the brand philosophy! Combining Indian craftsmanship with modern soles is genius. The Indore Paisley sandals are super soft, no shoe bites at all. Strongly recommend Slidex!"',
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

      {/* SECTION 2: QUICK CATEGORY GRID */}
      <section className="category-quick-section section-padding" id="category-grid-section">
        <div className="container">
          <h2 className="section-title">Shop By Style</h2>
          <p className="section-subtitle">Find your perfect pair from our curated catalog categories</p>
          
          <div className="category-quick-grid">
            {/* Card 1: Men's Slides */}
            <Link href="/shop?category=mens&type=slides" className="category-quick-card" id="category-mens">
              <div className="category-circle-wrapper">
                <img src="/assets/slides.png" alt="Men's Slides" className="category-circle-img" />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Men's Slides</span>
              <span className="category-count-text">12 Styles</span>
            </Link>

            {/* Card 2: Women's Sandals */}
            <Link href="/shop?category=womens&type=sandals" className="category-quick-card" id="category-womens">
              <div className="category-circle-wrapper">
                <img src="/assets/sandals.png" alt="Women's Sandals" className="category-circle-img" />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Women's Sandals</span>
              <span className="category-count-text">18 Styles</span>
            </Link>

            {/* Card 3: Premium Loafers */}
            <Link href="/shop?type=loafers" className="category-quick-card" id="category-loafers">
              <div className="category-circle-wrapper">
                <img src="/assets/loafers.png" alt="Premium Loafers" className="category-circle-img" />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Premium Loafers</span>
              <span className="category-count-text">9 Styles</span>
            </Link>

            {/* Card 4: Artisan Mojris */}
            <Link href="/shop?category=womens&type=sandals" className="category-quick-card" id="category-mojris">
              <div className="category-circle-wrapper">
                <img src="/assets/mojris.png" alt="Traditional Mojris & Juttis" className="category-circle-img" />
                <div className="category-circle-overlay"><span>Shop Now →</span></div>
              </div>
              <span className="category-title-text">Artisan Mojris</span>
              <span className="category-count-text">15 Styles</span>
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
            <p className="section-subtitle">We bridge ancestral Indian artisan heritage with contemporary ergonomic footwear design. No mass factories, no animal harm.</p>
          </div>

          <div className="craft-journey-grid">
            {/* Step 1 */}
            <div className="craft-step-card">
              <span className="craft-step-num">01</span>
              <span className="craft-step-icon">🌱</span>
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
              <span className="craft-step-icon">🪡</span>
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
              <span className="craft-step-icon">👣</span>
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

      {/* SECTION 6: ARTISAN QUOTE BEAT */}
      <section className="artisan-quote-beat" id="artisan-beat-section">
        <div className="container">
          <div className="artisan-beat-grid">
            <div className="artisan-portrait-wrapper">
              <img src="https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=800&auto=format&fit=crop&q=80" alt="Master Artisan Ramjibhai at work" />
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

      {/* SECTION 8: BRAND STORY */}
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

            <div className="brand-story-image">
              <img 
                src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80" 
                alt="Artisanal shoemaking process" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: 1.25 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: FOUNDERS MESSAGE */}
      <section className="section-padding" id="index-founders" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Meet the Visionaries Behind SlideEase</h2>
          <blockquote style={{ fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--text-dark)', lineHeight: 1.8, margin: '0 auto 2rem auto', maxWidth: '700px', fontFamily: 'Georgia, serif' }}>
            "We created SlideEase because we were tired of watching everyday friction slow down ambitious individuals, and watching physical strain steal independence. By combining leading-edge shoe engineering with a deep understanding of our rich, fast-paced Indian lifestyle, we didn't just build a footwear brand—we engineered a solution for every generation of your family. Thank you for walking this path toward effortless living with us."
          </blockquote>
          <p style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
            — The SlideEase Founders
          </p>
        </div>
      </section>

      {/* SECTION 10: MATERIALS SPOTLIGHT */}
      <section className="materials-section section-padding" id="materials-spotlight-section">
        <div className="container">
          <h2 className="section-title">Designed with Ethics & Ergonomics</h2>
          <p className="section-subtitle">Take a closer look at the advanced materials engineered into every pair of SlideEase footwear.</p>
          
          <div className="materials-grid">
            <div className="material-card">
              <div className="material-icon-wrapper">🌱</div>
              <h3 className="material-h3">Vegan Leather</h3>
              <p className="material-desc">100% animal-free synthetic leather that mimics the durability and suppleness of real leather, while staying water-resistant and breathable.</p>
            </div>
            <div className="material-card">
              <div className="material-icon-wrapper">☁️</div>
              <h3 className="material-h3">Cushioned Memory Foam</h3>
              <p className="material-desc">Our outsoles feature double-layered memory foam insoles that contour to your feet to reduce arch pressure and absorb walking shock.</p>
            </div>
            <div className="material-card">
              <div className="material-icon-wrapper">🎨</div>
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
              <div className="trust-badge-icon">🛡️</div>
              <h4 className="trust-badge-title">PETA Approved</h4>
              <p className="trust-badge-desc">100% Vegan Materials Only</p>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon">🔨</div>
              <h4 className="trust-badge-title">Indian Heritage</h4>
              <p className="trust-badge-desc">Handcrafted by Local Artisans</p>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon">🚚</div>
              <h4 className="trust-badge-title">Free Shipping</h4>
              <p className="trust-badge-desc">On all orders above ₹999</p>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon">🔄</div>
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
              <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80" alt="Instagram Post 1" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 1.2k</span></div>
            </div>
            <div className="instagram-item">
              <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&auto=format&fit=crop&q=80" alt="Instagram Post 2" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 980</span></div>
            </div>
            <div className="instagram-item">
              <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80" alt="Instagram Post 3" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 1.5k</span></div>
            </div>
            <div className="instagram-item">
              <img src="https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&auto=format&fit=crop&q=80" alt="Instagram Post 4" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 870</span></div>
            </div>
            <div className="instagram-item">
              <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80" alt="Instagram Post 5" />
              <div className="instagram-overlay"><span className="instagram-likes">❤️ 2.1k</span></div>
            </div>
            <div className="instagram-item">
              <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&auto=format&fit=crop&q=80" alt="Instagram Post 6" />
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
