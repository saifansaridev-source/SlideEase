'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0); // Default open the first one

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // In a real application, submit to API
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', orderId: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? -1 : index);
  };

  const faqItems = [
    {
      q: "How does the hands-free technology actually work?",
      a: "SlideEase shoes are built with an engineered, flexible heel counter and leading-edge internal architecture. When you step down, the heel compresses to let your foot glide in smoothly, then immediately snaps back into place to lock your foot securely. You get the stability of a performance shoe with the ease of a slide."
    },
    {
      q: "Who are SlideEase shoes designed for?",
      a: "Everyone! They are built for busy professionals and achievers who frequently need to remove their shoes throughout the day (at temples, offices, or homes). They are also deeply beneficial for elders, pregnant women, or anyone suffering from back pain, flexibility issues, or arthritis, as they completely eliminate the need to bend down."
    },
    {
      q: "What is the benefit of the Wide-Toe Design?",
      a: "Traditional shoes pinch your toes together, which can cause pain and imbalance over time. Our wide-toe design mimics the natural shape of your foot. This allows your toes to splay naturally, giving you significantly better real-world stability, pressure distribution, and peak comfort during long hours of standing or walking."
    },
    {
      q: "How do I choose the correct shoe size?",
      a: "We follow standard UK/Indian footwear sizes. Select the size you normally wear in formal shoes. If you are in between sizes (e.g. UK 7.5), we recommend ordering one size up (UK 8) for maximum comfort in slides and slip-ons."
    },
    {
      q: "What is your exchange and return policy?",
      a: "We offer a 7-day hassle-free exchange and return policy. If the footwear size doesn't fit or you receive a damaged piece, raise a request on this Contact page or email us, and our team will arrange a reverse pickup from your address at zero cost."
    },
    {
      q: "Are they machine washable?",
      a: "Due to the leading-edge tech and double-layer water-resistant materials in select models, we recommend wiping them down with a damp cloth and mild soap. Avoid machine washing or submerging them completely to preserve the water-resistant layers."
    }
  ];

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
      <section className="page-hero" id="contact-hero-section" style={{ backgroundImage: "url('/og_image.png')" }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Get In Touch</span>
          <h1 className="page-hero-title">Let's Walk Together</h1>
          <p className="page-hero-desc">Have questions about shoe sizing, returns, or shipments? Contact the Slidex support team.</p>
        </div>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="container" style={{ padding: '4rem 1.5rem 1rem 1.5rem' }} id="contact-cards-section">
        <div className="contact-cards-grid">
          {/* Card 1 */}
          <div className="contact-info-card">
            <div className="contact-card-icon">💬</div>
            <h3 className="contact-card-h3">WhatsApp Support</h3>
            <p className="contact-card-p">+91 22 4567 8900</p>
            <p className="contact-card-p" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Mon to Sat • 10:00 AM - 7:00 PM IST</p>
          </div>
          {/* Card 2 */}
          <div className="contact-info-card">
            <div className="contact-card-icon">📧</div>
            <h3 className="contact-card-h3">Email Us</h3>
            <p className="contact-card-p">support@slideease.in</p>
            <p className="contact-card-p" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Responses within 24 hours (Mon-Sat)</p>
          </div>
          {/* Card 3 */}
          <div className="contact-info-card">
            <div className="contact-card-icon">🏢</div>
            <h3 className="contact-card-h3">Registered Office</h3>
            <p className="contact-card-p" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>Slideease Footwear Private Limited,</p>
            <p className="contact-card-p" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.4 }}>1002 Bldg No 1d Cts No 13, Kopari Aadi Shankarcharya, Mumbai, Maharashtra, India, 400076</p>
          </div>
        </div>
      </section>

      {/* SPLIT FORM AND MAP SECTION */}
      <section className="container" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }} id="contact-split-section">
        <div className="contact-layout-split">
          
          {/* Contact Inquiry Form */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 className="form-h3" style={{ marginBottom: '1rem' }}>Send Us a Message Directly</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Have a question about our hands-free technology? Need help picking the right size?</p>
            
            <form id="contact-us-form" onSubmit={handleFormSubmit}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '1.2rem' }}>
                <div className="form-group">
                  <label htmlFor="contact-name" className="input-label">Your Name *</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control" 
                    placeholder="Enter full name" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact-email" className="input-label">Email Address *</label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control" 
                    placeholder="name@domain.com" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-phone" className="input-label">Phone Number *</label>
                  <input 
                    type="tel" 
                    id="contact-phone" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control" 
                    placeholder="e.g. +91 98765 43210" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-orderid" className="input-label">Order ID (Optional)</label>
                  <input 
                    type="text" 
                    id="contact-orderid" 
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    className="form-control" 
                    placeholder="e.g. SLDE-9876" 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="input-label">Message *</label>
                  <textarea 
                    id="contact-message" 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-control" 
                    style={{ minHeight: '120px', resize: 'vertical' }} 
                    placeholder="Write details here..." 
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>Submit Message</button>
            </form>
            
            {submitted && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--success-color)', color: 'white', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                Message submitted successfully! We will get back to you shortly.
              </div>
            )}
          </div>

          {/* Office Location Map */}
          <div className="map-card-wrapper">
            <h3 className="form-h3">Corporate HQ Location</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>SLIDEX FOOTWEAR PRIVATE LIMITED (CIN: U47713MH2026PTC468787)</p>
            
            <div className="map-placeholder" style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
              <iframe 
                src="https://maps.google.com/maps?q=Kopari%20Aadi%20Shankarcharya%20Powai%20Mumbai&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                allowFullScreen="" 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
              <p><strong>Address:</strong> 1002 Bldg No 1d Cts No 13, Kopari Aadi Shankarcharya, Mumbai, Maharashtra, India, 400076</p>
              <p style={{ marginTop: '0.4rem' }}><strong>Directors:</strong> Arva Yusuf Tinwala & Burhanuddin Yusuf Tinwala</p>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="materials-section section-padding" id="faq-section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Find immediate answers to sizing questions, vegan leather care, and exchanges.</p>
          
          <div className="faq-accordion-container">
            {faqItems.map((item, idx) => (
              <div key={idx} className={`faq-item ${activeFaq === idx ? 'active' : ''}`}>
                <div className="faq-header" onClick={() => toggleFaq(idx)} style={{ cursor: 'pointer' }}>
                  <span className="faq-question">{item.q}</span>
                  <span className="faq-toggle-icon">{activeFaq === idx ? '▲' : '▼'}</span>
                </div>
                <div className="faq-body" style={{ display: activeFaq === idx ? 'block' : 'none' }}>
                  <div className="faq-content">{item.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
