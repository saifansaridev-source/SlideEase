'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (data.success) {
        setStatusMsg(data.message || 'Subscribed successfully! Check your email.');
        setStatusType('success');
        setEmail('');
      } else {
        setStatusMsg(data.error || 'Subscription failed. Please try again.');
        setStatusType('error');
      }
    } catch (err) {
      setStatusMsg('Something went wrong. Please try again.');
      setStatusType('error');
    }

    setTimeout(() => {
      setStatusMsg('');
      setStatusType('');
    }, 5000);
  };

  return (
    <footer className="main-footer" id="main-website-footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-logo-link">
              <img src="/assets/logo.png" alt="SlideEase Logo" className="logo-img footer-logo-img" />
            </Link>
            <p className="footer-desc">
              India's premium handcrafted vegan footwear brand. 100% PETA-approved, cruelty-free materials adorned with traditional Indian artisan weaves.
            </p>
            <div className="footer-social-links" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {/* Instagram */}
              <a 
                href="https://instagram.com/slideease" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-btn" 
                aria-label="Follow SlideEase on Instagram"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </a>

              {/* Facebook */}
              <a 
                href="https://facebook.com/slideease" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-btn" 
                aria-label="Connect with SlideEase on Facebook"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>

              {/* X / Twitter */}
              <a 
                href="https://twitter.com/slideease" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-btn" 
                aria-label="Follow SlideEase on X (Twitter)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/912245678900" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-icon-btn" 
                aria-label="Chat with SlideEase on WhatsApp"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Online */}
          <div>
            <h3 className="footer-h3">Shop Online</h3>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link href="/shop">Browse Catalog</Link></li>
              <li className="footer-link-item"><Link href="/shop?category=mens">Men's Footwear</Link></li>
              <li className="footer-link-item"><Link href="/shop?category=womens">Women's Footwear</Link></li>
              <li className="footer-link-item"><Link href="/shop?type=loafers">Artisan Loafers</Link></li>
              <li className="footer-link-item"><Link href="/shop?sale=true" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Seasonal Offers</Link></li>
            </ul>
          </div>

          {/* Customer Care & Legal */}
          <div>
            <h3 className="footer-h3">Support & Legal</h3>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link href="/contact">Contact Support</Link></li>
              <li className="footer-link-item"><Link href="/blog">Blog & Guides</Link></li>
              <li className="footer-link-item"><Link href="/faq">FAQs Center</Link></li>
              <li className="footer-link-item"><Link href="/size-guide">Size Guide</Link></li>
              <li className="footer-link-item"><Link href="/about">About Us</Link></li>
              <li className="footer-link-item"><Link href="/shipping-returns">Shipping & Returns</Link></li>
              <li className="footer-link-item"><Link href="/terms">Terms of Service</Link></li>
              <li className="footer-link-item"><Link href="/privacy">Privacy Policy</Link></li>
              <li className="footer-link-item"><Link href="/cookie">Cookie Policy</Link></li>
              <li className="footer-link-item">
                <Link href="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="footer-newsletter-col">
            <h3 className="footer-h3">Newsletter</h3>
            <p className="footer-desc" style={{ marginBottom: '0.8rem' }}>
              Subscribe to receive early sales notifications, lifestyle tips, and a flat 10% coupon!
            </p>
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email..." 
                required 
                className="newsletter-input" 
                aria-label="Email address for newsletter"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" className="newsletter-btn">Join</button>
            </form>
            {statusMsg && (
              <p style={{ 
                marginTop: '0.8rem', 
                fontSize: '0.8rem', 
                fontWeight: 600,
                color: statusType === 'success' ? 'var(--success-color)' : 'var(--danger-color)'
              }}>
                {statusMsg}
              </p>
            )}
          </div>

        </div>

        {/* Footer Bottom credits */}
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem', paddingTop: '1.5rem', marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(253, 251, 247, 0.65)' }}>© {new Date().getFullYear()} SlideEase Private Limited (CIN: U47713MH2026PTC468787). All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link href="/admin/login" style={{ color: 'rgba(253, 251, 247, 0.6)', fontSize: '0.78rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', transition: 'color 0.2s' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              Admin Login
            </Link>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(253, 251, 247, 0.6)' }}>
              Website Maintained by &nbsp;
              <a href="https://startupindia.biz" target="_blank" rel="noopener noreferrer" className="startup-credit" style={{ color: 'var(--accent-color)' }}>Startup India Business</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
