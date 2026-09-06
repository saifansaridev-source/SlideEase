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
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeFaq, setActiveFaq] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.orderId ? `Order Inquiry: ${formData.orderId}` : 'Customer Inquiry',
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', orderId: '', message: '' });
      } else {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? -1 : index);
  };

  const faqItems = [
    {
      q: "How does SlideEase cruelty-free footwear compare to traditional leather?",
      a: "SlideEase footwear is 100% PETA-approved vegan. We use premium plant-based cork footbeds, breathable organic cotton canvas, and durable microfiber vegan leather that offers the identical luxurious feel and patina of traditional leather without harming a single animal."
    },
    {
      q: "Who are SlideEase shoes designed for?",
      a: "Everyone! They are built for busy professionals and achievers who value elegance, ergonomic arch support, and timeless Indian artisan weaves like Pochampally Ikat and Kutch embroidery."
    },
    {
      q: "How do I choose the correct shoe size?",
      a: "We follow standard Indian/UK footwear sizes. Select the size you normally wear. If you are in between sizes (e.g. UK 7.5), we recommend ordering one size up (UK 8) for maximum comfort."
    },
    {
      q: "What is your exchange and return policy?",
      a: "We offer a 7-day hassle-free exchange and return policy. If the footwear size doesn't fit or you receive a defective piece, raise a request on this Contact page or message our WhatsApp concierge, and our team will arrange a reverse pickup from your address at zero cost."
    },
    {
      q: "How do I clean and care for my SlideEase shoes?",
      a: "Wipe them gently with a damp soft cloth and mild soap. Allow them to air dry naturally away from direct scorching heat. You can also use our Vegan Shoe Protector Spray to shield fabric motifs."
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
          <p className="page-hero-desc">Have questions about shoe sizing, custom orders, or returns? Contact the SlideEase artisan support team.</p>
        </div>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="container" style={{ padding: '4rem 1.5rem 0.5rem 1.5rem' }} id="contact-cards-section">
        <div className="contact-cards-grid">
          {/* Card 1 */}
          <div className="contact-info-card">
            <div className="contact-card-icon">💬</div>
            <h3 className="contact-card-h3">WhatsApp Concierge</h3>
            <p className="contact-card-p">+91 22 4567 8900</p>
            <p className="contact-card-p" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Mon to Sat • 10:00 AM - 7:00 PM IST</p>
          </div>
          {/* Card 2 */}
          <div className="contact-info-card">
            <div className="contact-card-icon">📧</div>
            <h3 className="contact-card-h3">Email Support</h3>
            <p className="contact-card-p">support@slideease.com</p>
            <p className="contact-card-p" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Responses within 24 hours (Mon-Sat)</p>
          </div>
          {/* Card 3 */}
          <div className="contact-info-card">
            <div className="contact-card-icon">🏢</div>
            <h3 className="contact-card-h3">Registered Office</h3>
            <p className="contact-card-p" style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>SlideEase Footwear Private Limited,</p>
            <p className="contact-card-p" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.4 }}>1002 Bldg No 1d Cts No 13, Kopari Aadi Shankarcharya, Mumbai, Maharashtra, India, 400076</p>
          </div>
        </div>
      </section>

      {/* SPLIT FORM AND MAP SECTION */}
      <section className="container" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }} id="contact-split-section">
        <div className="contact-layout-split">

          {/* Contact Inquiry Form */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 className="form-h3" style={{ marginBottom: '0.6rem' }}>Send Us a Direct Message</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Submissions are directly delivered to our Mumbai artisan desk and backed by our database.
            </p>

            {errorMsg && (
              <div style={{ padding: '0.8rem', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {submitted ? (
              <div style={{ padding: '2rem', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✓</div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Thank You for Reaching Out!</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Your message has been safely received. A dedicated SlideEase customer care artisan will reply within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '1.5rem', fontSize: '0.8rem', padding: '0.5rem 1.5rem' }}
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form id="contact-us-form" onSubmit={handleFormSubmit}>
                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '1.2rem' }}>
                  <div className="form-group">
                    <label htmlFor="contact-name" className="input-label">Your Full Name *</label>
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
                    <label htmlFor="contact-phone" className="input-label">Phone Number (WhatsApp preferred)</label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-orderid" className="input-label">Order Number (Optional)</label>
                    <input
                      type="text"
                      id="contact-orderid"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g. SE-123456"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message" className="input-label">How can we assist you? *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="form-control"
                      style={{ minHeight: '120px', resize: 'vertical' }}
                      placeholder="Type details about your inquiry, exchange, or custom sizing needs..."
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }}
                >
                  {loading ? 'Saving Submission...' : 'Submit Inquiry to SlideEase →'}
                </button>
              </form>
            )}
          </div>

          {/* Office Location Map */}
          <div className="map-card-wrapper">
            <h3 className="form-h3">SlideEase Corporate Headquarters</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              SlideEase Footwear Private Limited (CIN: U47713MH2026PTC468787)
            </p>

            <div className="map-placeholder" style={{ position: 'relative', height: '300px', overflow: 'hidden', borderRadius: '4px' }}>
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
              <p><strong>Headquarters:</strong> 1002 Bldg No 1d Cts No 13, Kopari Aadi Shankarcharya, Mumbai, Maharashtra, India, 400076</p>
              <p style={{ marginTop: '0.4rem' }}><strong>Support Hours:</strong> Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="materials-section section-padding" id="faq-section" style={{ backgroundColor: 'var(--bg-white)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Quick guidance on vegan materials, sizing, and our 7-day doorstep exchange.</p>

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
