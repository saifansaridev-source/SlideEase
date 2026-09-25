import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/mongodb';

export const metadata = {
  title: 'About Us | SlideEase — Handcrafted Vegan Indian Footwear',
  description: "Learn about SlideEase's mission to blend traditional Indian craftsmanship with cruelty-free vegan materials. Our story, values, and artisan partnerships.",
};

async function getAboutData() {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: 'cms_sections' });
    return {
      heroImage: doc?.aboutHeroImage || '/og_image.png'
    };
  } catch (e) {
    return { heroImage: '/og_image.png' };
  }
}

export default async function AboutPage() {
  const { heroImage } = await getAboutData();

  return (
    <>
      {/* BREADCRUMB */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">About Us</li>
          </ol>
        </div>
      </nav>

      {/* HERO */}
      <section className="page-hero" style={{ backgroundImage: `url('${heroImage}')` }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Our Journey</span>
          <h1 className="page-hero-title">Crafting Comfort, Celebrating Heritage</h1>
          <p className="page-hero-desc">The story of how a passion for ethical fashion and Indian craftsmanship became SlideEase.</p>
        </div>
      </section>

      {/* MISSION */}
      <section className="section-padding" id="about-mission">
        <div className="container">
          <div className="brand-story-grid">
            <div className="brand-story-text">
              <span className="brand-story-sub">Our Mission</span>
              <h2 className="brand-story-h2">Walk Light, Walk Right</h2>
              <p className="brand-story-p">At SlideEase, we believe style should never come at the cost of conscience. Founded in Mumbai, India, our mission is to create premium-quality, cruelty-free footwear that celebrates India's rich weaving heritage while using zero animal products.</p>
              <p className="brand-story-p">Every pair of SlideEase shoes is handcrafted by master craftspeople from Gujarat, Rajasthan, and Madhya Pradesh — artisanal weavers who have preserved traditional techniques for generations. We combine their generational craft with modern comfort engineering to deliver footwear that is both ethically made and ergonomically designed.</p>
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
                    <p className="story-feature-desc">Certified cruelty-free, zero animal derivatives.</p>
                  </div>
                </div>
                <div className="story-feature-item">
                  <div className="story-feature-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="story-feature-title">Made in India</h4>
                    <p className="story-feature-desc">Proudly handcrafted across ancestral artisan clusters.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="brand-story-image">
              <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80" alt="Artisan crafting footwear" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: 1.25, borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDERS MESSAGE */}
      <section className="section-padding" id="about-founders" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <span className="craft-eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>✦ Generational Vision</span>
          <h2 className="section-title" style={{ fontSize: '1.9rem', marginBottom: '1.5rem' }}>Meet the Visionaries Behind SlideEase</h2>
          <blockquote style={{ fontSize: '1.18rem', fontStyle: 'italic', color: 'var(--text-dark)', lineHeight: 1.85, margin: '0 auto 2rem auto', maxWidth: '720px', fontFamily: 'Georgia, serif' }}>
            "We created SlideEase because we were tired of watching everyday friction slow down ambitious individuals, and watching physical strain steal personal independence. By combining leading-edge shoe engineering with a deep understanding of our rich, fast-paced Indian lifestyle, we didn't just build a footwear brand—we engineered an effortless walking solution for every generation of your family. Thank you for walking this path toward effortless conscious living with us."
          </blockquote>
          <p style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
            — The SlideEase Founding Team
          </p>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="materials-section section-padding" id="about-values">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 2.5rem auto' }}>
            <span className="craft-eyebrow">✦ Unwavering Commitment</span>
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The guiding principles behind every stitch, contoured footbed, and artisan partnership.</p>
          </div>
          
          <div className="materials-grid">
            <div className="material-card" style={{ background: '#ffffff', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <div className="material-icon-wrapper" style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                </svg>
              </div>
              <h3 className="material-h3">Sustainability First</h3>
              <p className="material-desc">We use vegetable dyes, plant-based cork footbeds, and biodegradable packaging to minimize our environmental footprint and honor natural ecosystems.</p>
            </div>

            <div className="material-card" style={{ background: '#ffffff', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <div className="material-icon-wrapper" style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/>
                  <path d="M18 15v4a2 2 0 0 1-2 2H6"/>
                  <circle cx="18" cy="6" r="3"/>
                </svg>
              </div>
              <h3 className="material-h3">Fair Trade Artisans</h3>
              <p className="material-desc">We pay dignified living wages and ensure safe, year-round guild employment to master weavers across Kutch, Jaipur, and Indore.</p>
            </div>

            <div className="material-card" style={{ background: '#ffffff', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              <div className="material-icon-wrapper" style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h3 className="material-h3">Uncompromising Quality</h3>
              <p className="material-desc">Every pair undergoes rigorous dual-density sole stress testing, seamless border inspection, and orthotic alignment before dispatch.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }} id="about-timeline">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="craft-eyebrow">✦ Milestones</span>
            <h2 className="section-title">Our Heritage Journey</h2>
            <p className="section-subtitle">Key chapters in our journey to modernize Indian artisan footwear.</p>
          </div>
          
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2024 — Origin</span>
                <h4>The Spark of Heritage</h4>
                <p>Identified the critical void in authentic, cruelty-free Indian footwear that could rival European ergonomics while elevating our local weaving clusters.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2024 — Collective</span>
                <h4>Inaugural Artisan Guild</h4>
                <p>Direct partnership with weaver collectives in Bhujodi (Kutch) and Pochampally to launch our first 12 signature slides and loafers.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2025 — Certification</span>
                <h4>PETA-Approved Vegan Stamp</h4>
                <p>Received official international PETA certification affirming zero animal testing and 100% cruelty-free formulation.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2026 — Present</span>
                <h4>The SlideEase Circle</h4>
                <p>Unveiling the SlideEase Circle loyalty collective, pan-India expedited logistics, and bespoke bridal footwear consultations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOLLOW OUR STORY (PREMIUM FASHION SHOWCASE) */}
      <section className="section-padding" style={{ backgroundColor: '#faf8f5' }} id="about-social">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <span className="craft-eyebrow">✦ The Living Narrative</span>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>Follow Our Story</h2>
            <p className="section-subtitle">
              Step inside our ateliers, witness the looms in motion, and discover daily styling inspiration from our vibrant cultural community.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1080px', margin: '0 auto' }}>
            
            {/* Instagram Card */}
            <a 
              href="https://instagram.com/slideease" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                textDecoration: 'none',
                background: '#ffffff',
                border: '1px solid rgba(201, 169, 97, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '2.5rem 1.8rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(26, 35, 50, 0.04)',
                transition: 'all 0.35s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="social-story-card"
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #fdf497 0%, #d6249f 50%, #285AEB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', color: '#fff', boxShadow: '0 4px 14px rgba(214, 36, 159, 0.25)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--primary-color)', margin: '0 0 0.4rem 0' }}>Instagram</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>@SlideEase</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Behind-the-scenes weaving ateliers, artisan portraits, and runway styling.
              </p>
            </a>

            {/* Facebook Card */}
            <a 
              href="https://facebook.com/slideease" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                textDecoration: 'none',
                background: '#ffffff',
                border: '1px solid rgba(201, 169, 97, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '2.5rem 1.8rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(26, 35, 50, 0.04)',
                transition: 'all 0.35s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="social-story-card"
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', color: '#fff', boxShadow: '0 4px 14px rgba(24, 119, 242, 0.25)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--primary-color)', margin: '0 0 0.4rem 0' }}>Facebook</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>SlideEase Community</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Community discussions, seasonal launch announcements, and event invites.
              </p>
            </a>

            {/* Twitter / X Card */}
            <a 
              href="https://twitter.com/slideease" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{
                textDecoration: 'none',
                background: '#ffffff',
                border: '1px solid rgba(201, 169, 97, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '2.5rem 1.8rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(26, 35, 50, 0.04)',
                transition: 'all 0.35s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="social-story-card"
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0f1419', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', color: '#fff', boxShadow: '0 4px 14px rgba(15, 20, 25, 0.25)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--primary-color)', margin: '0 0 0.4rem 0' }}>X (Twitter)</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>@SlideEase</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Real-time updates, conscious design commentary, and customer inquiries.
              </p>
            </a>

          </div>
        </div>
      </section>
    </>
  );
}
