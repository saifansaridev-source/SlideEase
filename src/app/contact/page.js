import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import ContactFormClient from '@/components/ContactFormClient';

export const metadata = {
  title: 'Contact Us | SlideEase — Hands-Free Footwear Customer Care',
  description: 'Get in touch with Slideease. Customer support for hands-free footwear sizing, order inquiries, returns, and assistance.',
};

async function getContactData() {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: 'cms_sections' });
    return {
      heroImage: doc?.contactHeroImage || '/og_image.png',
    };
  } catch (e) {
    return { heroImage: '/og_image.png' };
  }
}

export default async function ContactPage() {
  const { heroImage } = await getContactData();

  return (
    <>
      {/* BREADCRUMB */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">Contact Us</li>
          </ol>
        </div>
      </nav>

      {/* HERO */}
      <section className="page-hero" id="contact-hero-section" style={{ backgroundImage: `url('${heroImage}')` }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">✦ We're Here to Help</span>
          <h1 className="page-hero-title">Get in Touch with Slideease</h1>
          <p className="page-hero-desc">Have a question about our hands-free technology? Need help picking the right size? Our dedicated customer care team is here to ensure you experience peak comfort and seamless service.</p>
        </div>
      </section>

      {/* INTERACTIVE CLIENT CARDS, FORM, MAP & FAQ */}
      <ContactFormClient />
    </>
  );
}
