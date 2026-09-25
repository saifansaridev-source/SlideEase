'use client';

import React, { useState } from 'react';

export default function ContactFormClient() {
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
      {/* CONTACT INFO CARDS */}
      <section className="container" style={{ padding: '4rem 1.5rem 1rem 1.5rem' }} id="contact-cards-section">
        <div className="contact-cards-grid">
          {/* Card 1: WhatsApp Concierge */}
          <div className="contact-info-card">
            <div className="contact-card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,169,97,0.15), rgba(201,169,97,0.05))', color: 'var(--accent-color)', margin: '0 auto 1.25rem' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h3 className="contact-card-h3">WhatsApp Concierge</h3>
            <p className="contact-card-p" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>+91 22 4567 8900</p>
            <p className="contact-card-p" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Mon to Sat • 10:00 AM - 7:00 PM IST</p>
          </div>

          {/* Card 2: Email Support */}
          <div className="contact-info-card">
            <div className="contact-card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,169,97,0.15), rgba(201,169,97,0.05))', color: 'var(--accent-color)', margin: '0 auto 1.25rem' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            <h3 className="contact-card-h3">Email Support</h3>
            <p className="contact-card-p" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>support@slideease.com</p>
            <p className="contact-card-p" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>Responses within 24 business hours</p>
          </div>

          {/* Card 3: Registered Office */}
          <div className="contact-info-card">
            <div className="contact-card-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(201,169,97,0.15), rgba(201,169,97,0.05))', color: 'var(--accent-color)', margin: '0 auto 1.25rem' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18"></path>
                <path d="M5 21V7l8-4v18"></path>
                <path d="M19 21V11l-6-3"></path>
                <path d="M9 9h1"></path>
                <path d="M9 13h1"></path>
                <path d="M9 17h1"></path>
              </svg>
            </div>
            <h3 className="contact-card-h3">Registered Office</h3>
            <p className="contact-card-p" style={{ fontSize: '0.85rem', lineHeight: 1.4, fontWeight: 600 }}>SlideEase Footwear Private Limited</p>
            <p className="contact-card-p" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.45 }}>1002 Bldg No 1d Cts No 13, Kopari Aadi Shankarcharya, Mumbai, Maharashtra 400076</p>
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
              Submissions are directly delivered to our Mumbai artisan desk for prompt assistance.
            </p>

            {errorMsg && (
              <div style={{ padding: '0.9rem 1.2rem', backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {submitted ? (
              <div style={{ padding: '2.5rem 2rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', marginBottom: '1rem' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', fontFamily: 'var(--font-heading)' }}>Thank You for Reaching Out!</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: '#15803d' }}>
                  Your message has been safely received. A dedicated SlideEase customer care concierge will reply within 24 business hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '1.75rem', fontSize: '0.85rem', padding: '0.6rem 1.8rem' }}
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
                  {loading ? 'Sending Inquiry...' : 'Submit Inquiry to SlideEase →'}
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

            <div className="map-placeholder" style={{ position: 'relative', height: '300px', overflow: 'hidden', borderRadius: '8px' }}>
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
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', lineHeight: '1.6' }}>
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
                <div className="faq-header" onClick={() => toggleFaq(idx)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="faq-question">{item.q}</span>
                  <span className="faq-toggle-icon" style={{ display: 'inline-flex', alignItems: 'center', transition: 'transform 0.25s ease', transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
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
