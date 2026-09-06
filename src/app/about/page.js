import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | SlideEase — Handcrafted Vegan Indian Footwear',
  description: "Learn about SlideEase's mission to blend traditional Indian craftsmanship with cruelty-free vegan materials. Our story, values, and artisan partnerships.",
};

export default function AboutPage() {
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
      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')" }}>
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
              <p className="brand-story-p">At SlideEase, we believe style should never come at the cost of conscience. Founded in 2024 in Mumbai, India, our mission is to create premium-quality, cruelty-free footwear that celebrates India's rich weaving heritage while using zero animal products.</p>
              <p className="brand-story-p">Every pair of SlideEase shoes is handcrafted by local artisans from Gujarat, Rajasthan, and Madhya Pradesh — master weavers who have preserved traditional techniques for generations. We combine their craft with modern comfort engineering to deliver footwear that is both ethically made and ergonomically designed.</p>
              <div className="brand-story-features">
                <div className="story-feature-item">
                  <span className="story-feature-icon">🌿</span>
                  <div>
                    <h4 className="story-feature-title">100% Vegan</h4>
                    <p className="story-feature-desc">PETA-approved, zero animal products.</p>
                  </div>
                </div>
                <div className="story-feature-item">
                  <span className="story-feature-icon">🇮🇳</span>
                  <div>
                    <h4 className="story-feature-title">Made in India</h4>
                    <p className="story-feature-desc">Proudly handcrafted by local artisans.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="brand-story-image">
              <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=600&auto=format&fit=crop&q=80" alt="Artisan crafting footwear" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: 1.25 }} />
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDERS MESSAGE */}
      <section className="section-padding" id="about-founders" style={{ backgroundColor: 'var(--bg-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '800px', textAlign: 'center' }}>
          <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Meet the Visionaries Behind SlideEase</h2>
          <blockquote style={{ fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--text-dark)', lineHeight: 1.8, margin: '0 auto 2rem auto', maxWidth: '700px', fontFamily: 'Georgia, serif' }}>
            "We created SlideEase because we were tired of watching everyday friction slow down ambitious individuals, and watching physical strain steal the independence. As achievers ourselves, we knew that time and mobility are our most valuable assets. By combining leading-edge shoe engineering with a deep understanding of our rich, fast-paced Indian lifestyle, we didn't just build a footwear brand—we engineered a solution for every generation of your family. Thank you for walking this path toward effortless living with us."
          </blockquote>
          <p style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
            — The SlideEase Founders
          </p>
        </div>
      </section>

      {/* STATS COUNTER */}
      <section className="trust-badges-section" id="about-stats">
        <div className="container">
          <div className="trust-badges-grid">
            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ fontSize: '2.8rem' }}>📦</div>
              <h4 className="trust-badge-title" style={{ fontSize: '2rem' }}>25,000+</h4>
              <p className="trust-badge-desc">Pairs Sold Nationwide</p>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ fontSize: '2.8rem' }}>🧵</div>
              <h4 className="trust-badge-title" style={{ fontSize: '2rem' }}>120+</h4>
              <p className="trust-badge-desc">Artisan Partners</p>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ fontSize: '2.8rem' }}>⭐</div>
              <h4 className="trust-badge-title" style={{ fontSize: '2rem' }}>4.8/5</h4>
              <p className="trust-badge-desc">Average Customer Rating</p>
            </div>
            <div className="trust-badge-item">
              <div className="trust-badge-icon" style={{ fontSize: '2.8rem' }}>🌍</div>
              <h4 className="trust-badge-title" style={{ fontSize: '2rem' }}>500+</h4>
              <p className="trust-badge-desc">Cities Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="materials-section section-padding" id="about-values">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <p className="section-subtitle">The principles that guide every stitch, every sole, and every decision.</p>
          <div className="materials-grid">
            <div className="material-card">
              <div className="material-icon-wrapper">♻️</div>
              <h3 className="material-h3">Sustainability First</h3>
              <p className="material-desc">We use eco-friendly dyes, biodegradable packaging, and source materials from sustainable suppliers to minimize our environmental footprint.</p>
            </div>
            <div className="material-card">
              <div className="material-icon-wrapper">🤝</div>
              <h3 className="material-h3">Fair Trade Artisans</h3>
              <p className="material-desc">We pay fair wages and provide continuous employment to over 120 weavers, ensuring their traditional skills are preserved and celebrated.</p>
            </div>
            <div className="material-card">
              <div className="material-icon-wrapper">💎</div>
              <h3 className="material-h3">Uncompromising Quality</h3>
              <p className="material-desc">Every pair undergoes 7 quality checkpoints. From stitching precision to sole durability, we never cut corners on craftsmanship.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }} id="about-timeline">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title">Our Journey</h2>
          <p className="section-subtitle">Key milestones in the SlideEase story.</p>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2024 — Q1</span>
                <h4>The Idea is Born</h4>
                <p>Founders identify the gap in India's vegan footwear market and partner with Gujarat weaving clusters.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2024 — Q3</span>
                <h4>First Collection Launch</h4>
                <p>12 handcrafted designs launch online. Within 60 days, 2,000+ pairs sold across 18 states.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2025 — Q1</span>
                <h4>PETA-Approved Vegan Certified</h4>
                <p>SlideEase receives official PETA Vegan Certification, becoming one of India's first certified vegan footwear brands.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2025 — Q4</span>
                <h4>25,000+ Pairs Milestone</h4>
                <p>Expanding to 120+ artisan partners and serving 500+ cities. Launched memory-foam sole technology.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-date">2026 — Present</span>
                <h4>Building the Future</h4>
                <p>Launching premium loafer line, international shipping, and the SlideEase Circle with 10,000+ members.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="materials-section section-padding" id="about-team">
        <div className="container">
          <h2 className="section-title">Meet the Team</h2>
          <p className="section-subtitle">The passionate people behind every pair of SlideEase footwear.</p>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">AT</div>
              <h4 className="team-name">Arva Tinwala</h4>
              <p className="team-role">Co-Founder & CEO</p>
              <p className="team-bio">Drives brand strategy and artisan partnerships. Passionate about combining heritage craft with modern design.</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">BT</div>
              <h4 className="team-name">Burhanuddin Tinwala</h4>
              <p className="team-role">Co-Founder & COO</p>
              <p className="team-bio">Oversees supply chain, quality control, and nationwide distribution. Ensures every pair meets exacting standards.</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">SI</div>
              <h4 className="team-name">Startup India Biz</h4>
              <p className="team-role">Technology Partner</p>
              <p className="team-bio">Designs and maintains the digital platform, e-commerce technology, and online customer experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL INTEGRATION */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }} id="about-social">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Follow Our Story</h2>
          <p className="section-subtitle">Join us on social media for style inspiration, behind-the-scenes craftsmanship, and exclusive drops.</p>
          <div className="social-links-large">
            <a href="https://instagram.com/slideease" target="_blank" rel="noopener noreferrer" className="social-large-btn">
              <span style={{ fontSize: '2rem' }}>📸</span>
              <span>Instagram</span>
              <span className="social-handle">@slideease</span>
            </a>
            <a href="https://facebook.com/slideease" target="_blank" rel="noopener noreferrer" className="social-large-btn">
              <span style={{ fontSize: '2rem' }}>👤</span>
              <span>Facebook</span>
              <span className="social-handle">SlideEase</span>
            </a>
            <a href="https://twitter.com/slideease" target="_blank" rel="noopener noreferrer" className="social-large-btn">
              <span style={{ fontSize: '2rem' }}>🐦</span>
              <span>Twitter</span>
              <span className="social-handle">@slideease</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
