import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import { getCmsPage } from '@/lib/cms';

export async function generateMetadata() {
  const cmsPage = await getCmsPage('about');
  return {
    title: cmsPage?.metaTitle || 'About Us | SlideEase — Hands-Free Footwear Engineered for India',
    description: cmsPage?.metaDesc || 'The story of SlideEase: Hands-free slip-on shoes engineered for everyday Indian life. Wide-toe comfort, water resistance, and effortless mobility.',
  };
}

async function getAboutData() {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: 'cms_sections' });
    return {
      heroImage: doc?.aboutHeroImage || '/og_image.png',
      lifestyleImage: doc?.walkLightImage || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80',
    };
  } catch (e) {
    return {
      heroImage: '/og_image.png',
      lifestyleImage: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&auto=format&fit=crop&q=80',
    };
  }
}

export default async function AboutPage() {
  const { heroImage, lifestyleImage } = await getAboutData();
  const cmsPage = await getCmsPage('about');

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
          <span className="page-hero-tagline">✦ Engineered for Ease, Designed for India</span>
          <h1 className="page-hero-title">Crafted for Everyday Motion, Engineered for Peak Comfort</h1>
          <p className="page-hero-desc">
            The story of how we reimagined daily footwear for the modern Indian lifestyle — effortless, hands-free, and uncompromising on comfort.
          </p>
        </div>
      </section>

      {/* OUR STORY: WHY WE BUILT SLIDEEASE */}
      <section className="section-padding" id="about-story">
        <div className="container">
          <div className="brand-story-grid">
            <div className="brand-story-text">
              <span className="brand-story-sub">Our Genesis</span>
              <h2 className="brand-story-h2">Our Story: Why We Built Slideease</h2>
              <p className="brand-story-p">
                We live life in the fast lane — rushing out the door for morning commutes, juggling groceries, stepping in and out of homes and temples, running after kids, or working late into the evening. Yet the footwear we wear every day often forces us to slow down, bend over, struggle with backs, or compromise on all-day comfort. Slideease was born out of a simple observation: putting on shoes should be as effortless as walking in them.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
                <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-light)', borderLeft: '3px solid var(--accent-dark)' }}>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', color: 'var(--primary-color)' }}>Zero Bending</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Step in and step out with natural posture.</p>
                </div>
                <div style={{ padding: '1.2rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-light)', borderLeft: '3px solid var(--accent-dark)' }}>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', color: 'var(--primary-color)' }}>All-Day Stability</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ergonomic arch contours built for long strides.</p>
                </div>
              </div>
            </div>
            <div className="brand-story-image">
              <img
                src={lifestyleImage}
                alt="Hands-free comfort and movement"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: '1.15', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* THE EVERYDAY INDIAN HUSTLE */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="craft-eyebrow">✦ Built for Daily Rituals</span>
            <h2 className="section-title">The Everyday Indian Hustle</h2>
          </div>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.9, color: 'var(--text-dark)', margin: 0 }}>
              From vibrant morning markets to modern metro stations, Indian daily life demands footwear that adapts to dynamic rituals: frequent shoe removal at homes, prayer spaces, and social visits; navigating unpredictable streets and monsoon sprinkles; and enduring long hours on your feet. Traditional shoes require bending, tying, and fussing. Slip-ons often lack arch support and stability. Slideease bridges the gap with engineered footwear made for Indian routines.
            </p>
          </div>
        </div>
      </section>

      {/* INSPIRED BY FAMILY */}
      <section className="section-padding">
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="craft-eyebrow">✦ Universal Accessibility</span>
            <h2 className="section-title">Inspired by Family</h2>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(201, 169, 97, 0.08) 0%, rgba(26, 35, 50, 0.03) 100%)', borderRadius: 'var(--radius-md)', padding: '2.5rem', border: '1px solid rgba(201, 169, 97, 0.35)' }}>
            <p style={{ fontSize: '1.08rem', lineHeight: 1.88, color: 'var(--text-dark)', margin: '0 0 1.5rem 0' }}>
              The spark came from watching a grandfather with mobility and lower back challenges struggle every morning just to wear a pair of walking shoes. He wanted his independence back. We realized this isn't just an elderly concern — pregnant mothers, busy professionals balancing multiple bags, fitness enthusiasts stepping out for a jog, and anyone recovering from knee or hip stiffness all share the same frustration.
            </p>
            <p style={{ fontSize: '1.08rem', lineHeight: 1.88, color: 'var(--text-dark)', fontWeight: 600, margin: 0 }}>
              That empathy shaped our mission: footwear designed for universal accessibility.
            </p>
          </div>
        </div>
      </section>

      {/* ENTER SLIDEEASE: ENGINEERING COMFORT AT ITS PEAK (DARK LUXURY SECTION) */}
      <section className="section-padding" style={{ backgroundColor: '#1a2332', color: '#ffffff' }} id="engineering-features">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ color: 'var(--accent-color, #c9a961)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
              ✦ Ergonomic Innovation
            </span>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '1rem' }}>
              Enter Slideease: Engineering Comfort at Its Peak
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
              Every pair integrates four key mechanical and structural innovations built to withstand real life.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.8rem' }}>
            
            {/* CARD 1: Double-Layer Water Resistance */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem', color: '#c9a961' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '0.75rem' }}>
                Double-Layer Water Resistance
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.68, margin: 0 }}>
                Selected Slideease models feature an advanced hydrophobic dual-layer shield that repels everyday splashes, spills, and unexpected monsoon drizzles while keeping your feet dry and cool. <span style={{ color: '#c9a961', fontWeight: 600 }}>(Note: Available on select products)</span>
              </p>
            </div>

            {/* CARD 2: Wide-Toe Design */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem', color: '#c9a961' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                  <line x1="16" y1="8" x2="2" y2="22"/>
                  <line x1="17.5" y1="15" x2="9" y2="15"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '0.75rem' }}>
                Wide-Toe Design
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.68, margin: 0 }}>
                Engineered with a naturally proportioned anatomical toe-box that allows your toes to splay comfortably without pinching, reducing pressure points, calluses, and fatigue during long hours of standing.
              </p>
            </div>

            {/* CARD 3: Peak Efficiency & Stability */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem', color: '#c9a961' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '0.75rem' }}>
                Peak Efficiency & Stability
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.68, margin: 0 }}>
                Proprietary hands-free step-in heel counter engineered with dynamic rebound memory that flexes as you slide your foot in, then locks securely into place without collapsing — zero bending, zero hands required.
              </p>
            </div>

            {/* CARD 4: Soft & Breathable Fabrics */}
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201, 169, 97, 0.3)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', backdropFilter: 'blur(10px)', transition: 'transform 0.3s ease' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.4rem', color: '#c9a961' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                  <path d="M12 12 2.1 12a10.1 10.1 0 0 0 1.8 4.1L12 12z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#ffffff', marginBottom: '0.75rem' }}>
                Soft & Breathable Fabrics
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.68, margin: 0 }}>
                Ultra-plush moisture-wicking textile linings and high-resilience memory foam footbeds that cradle every contour of your foot with pillow-like softness and active airflow.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* MOVE EFFORTLESSLY */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '820px' }}>
          <span className="craft-eyebrow">✦ Uncompromised Motion</span>
          <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '1.25rem' }}>Move Effortlessly</h2>
          <p style={{ fontSize: '1.12rem', lineHeight: 1.9, color: 'var(--text-dark)', marginBottom: '2.2rem' }}>
            No bending. No laces to untangle. No heels crushed from rushing. Just pure, uncompromised ease from the moment you step in to the moment you unwind. Slideease is engineered for the movers, the doers, the multitaskers, and everyone who values their time and their comfort.
          </p>
          <Link
            href="/shop"
            className="btn btn-primary"
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Experience Hands-Free Comfort →
          </Link>
        </div>
      </section>

      {/* OUR MISSION */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)' }} id="about-mission">
        <div className="container" style={{ maxWidth: '860px', textAlign: 'center' }}>
          <span className="craft-eyebrow">✦ Guiding Purpose</span>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Our Mission</h2>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '2.5rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 18px rgba(0,0,0,0.03)' }}>
            <p style={{ fontSize: '1.12rem', lineHeight: 1.9, color: 'var(--text-dark)', margin: 0, fontWeight: 500 }}>
              At Slideease, our mission is to eliminate everyday physical friction through intelligent footwear engineering. We believe convenience is not a luxury — it is a daily essential. By combining responsive hands-free technology, orthopedically mindful geometry, and contemporary Indian aesthetics, we empower individuals of all ages and walks of life to move through their world with effortless dignity, freedom, and peak comfort.
            </p>
          </div>
        </div>
      </section>

      {/* OUR CORE VALUES (DIRECTLY BELOW MISSION) */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)', borderBottom: '1px solid var(--border-color)' }} id="about-values">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3rem auto' }}>
            <span className="craft-eyebrow">✦ Foundation Principles</span>
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">The four pillars that define how we engineer, craft, and serve.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.8rem' }}>
            
            {/* 1. Innovation */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(201, 169, 97, 0.35)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto', color: 'var(--accent-dark)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Innovation</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                Pioneering mechanical and material engineering that solves real-world daily mobility pain points.
              </p>
            </div>

            {/* 2. Inclusivity */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(201, 169, 97, 0.35)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto', color: 'var(--accent-dark)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Inclusivity</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                Designing footwear accessible to everyone — from seniors and expectant mothers to athletes and young professionals.
              </p>
            </div>

            {/* 3. Efficiency */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(201, 169, 97, 0.35)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto', color: 'var(--accent-dark)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Efficiency</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                Respecting your daily tempo with products that save time, eliminate struggle, and streamline everyday routines.
              </p>
            </div>

            {/* 4. Integrity */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(201, 169, 97, 0.35)', borderRadius: 'var(--radius-md)', padding: '2.2rem 1.8rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(201, 169, 97, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto', color: 'var(--accent-dark)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Integrity</h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                Transparent craftsmanship, rigorous quality testing, and honest customer relationships built on authentic value.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* MEET THE VISIONARIES BEHIND SLIDEEASE (FOUNDERS SECTION) */}
      <section className="section-padding" id="about-founders" style={{ backgroundColor: 'var(--bg-light)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <span className="craft-eyebrow" style={{ display: 'block', marginBottom: '0.5rem' }}>✦ Founder Voice</span>
          <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1.75rem' }}>Meet the Visionaries Behind Slideease</h2>
          <blockquote style={{ fontSize: '1.18rem', fontStyle: 'italic', color: 'var(--text-dark)', lineHeight: 1.9, margin: '0 auto 2rem auto', maxWidth: '720px', fontFamily: 'Georgia, serif' }}>
            &ldquo;We started Slideease not just to make another pair of shoes, but to give people back a moment of effortless ease in their busy days. When comfort meets smart design, daily routines transform.&rdquo;
          </blockquote>
          <p style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
            — The Slideease Founding Team
          </p>
        </div>
      </section>

      {/* FOLLOW OUR STORY (COMMUNITY & SOCIAL) */}
      <section className="section-padding" style={{ backgroundColor: '#faf8f5' }} id="about-social">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <span className="craft-eyebrow">✦ The Journey Continues</span>
            <h2 className="section-title" style={{ fontSize: '2rem' }}>Follow Our Story</h2>
            <p className="section-subtitle">
              Join our growing community and stay updated with the latest in hands-free footwear design, ergonomics, and effortless living.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', maxWidth: '960px', margin: '0 auto' }}>
            
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
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', color: '#fff', boxShadow: '0 4px 14px rgba(220, 39, 67, 0.3)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--primary-color)', margin: '0 0 0.4rem 0' }}>Instagram</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>@slideease</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Behind-the-scenes engineering, motion showcases, and customer experiences.
              </p>
            </a>

            {/* Email Support Card */}
            <Link 
              href="/contact" 
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
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', color: '#c9a961', boxShadow: '0 4px 14px rgba(26, 35, 50, 0.3)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--primary-color)', margin: '0 0 0.4rem 0' }}>Customer Care</h3>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-dark)', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>support@slideease.in</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                Questions about sizing, fit, or hands-free tech? Our team is here to assist.
              </p>
            </Link>

          </div>
        </div>
      </section>
    </>
  );
}
