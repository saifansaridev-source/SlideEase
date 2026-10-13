import React from 'react';
import Link from 'next/link';
import { getCmsPage } from '@/lib/cms';

export async function generateMetadata() {
  const cmsPage = await getCmsPage('features');
  return {
    title: cmsPage?.metaTitle || 'Signature Product Features | SlideEase Footwear',
    description: cmsPage?.metaDesc || 'Explore the proprietary comfort technology and sustainable craftsmanship behind SlideEase footwear.',
  };
}

export default async function FeaturesPage() {
  const cmsPage = await getCmsPage('features');
  const heroTitle = cmsPage?.title || 'Signature Product Features';

  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">{heroTitle}</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '300px', height: '35vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Innovation &amp; Ergonomics</span>
          <h1 className="page-hero-title">{heroTitle}</h1>
          <p className="page-hero-desc">Engineered for effortless movement, sustainable durability, and all-day comfort.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container legal-content" style={{ maxWidth: '960px' }}>
          {cmsPage?.content ? (
            <div dangerouslySetInnerHTML={{ __html: cmsPage.content }} />
          ) : (
            <div>
              <h2>Engineered for Effortless Movement</h2>
              <p>SlideEase combines generational handloom artistry with modern ergonomic footwear engineering.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h3>✦ Hands-Free Slip-On</h3>
                  <p>Precision-molded heel cup and intuitive entry design allowing you to step in effortlessly without bending down or adjusting straps.</p>
                </div>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h3>✦ Dual-Density Memory Foam</h3>
                  <p>Custom-engineered footbed layer that absorbs ground impact and cushions each step with continuous pressure-relief.</p>
                </div>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h3>✦ Water-Resistant Vegan Leather</h3>
                  <p>Cruelty-free, breathable microfiber leather engineered for monsoon durability and easy damp-cloth cleaning.</p>
                </div>
                <div style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h3>✦ Arch-Support Contoured Footbed</h3>
                  <p>Orthopedic-grade arch contouring that maintains balanced body posture throughout long festive and workday wear.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
