import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import ContactFormClient from '@/components/ContactFormClient';

export const metadata = {
  title: 'Contact Us | SlideEase — Handcrafted Vegan Indian Footwear',
  description: 'Connect with SlideEase for customer care, bespoke footwear sizing advice, returns, or order tracking. WhatsApp concierge, email support, and Mumbai headquarters.',
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
          <span className="page-hero-tagline">Get In Touch</span>
          <h1 className="page-hero-title">Let's Walk Together</h1>
          <p className="page-hero-desc">Have questions about shoe sizing, custom orders, or returns? Contact the SlideEase artisan support concierge.</p>
        </div>
      </section>

      {/* INTERACTIVE CLIENT CARDS, FORM, MAP & FAQ */}
      <ContactFormClient />
    </>
  );
}
