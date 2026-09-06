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
            <div className="footer-social-links">
              <a href="https://instagram.com/slideease" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram link">ig</a>
              <a href="https://facebook.com/slideease" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Facebook link">f</a>
              <a href="https://twitter.com/slideease" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Twitter link">tw</a>
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
              <li className="footer-link-item"><Link href="/shop?sale=true" style={{ color: 'var(--danger-color)', fontWeight: 600 }}>Seasonal Offers</Link></li>
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
              <li className="footer-link-item"><Link href="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>🔒 Staff Portal</Link></li>
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
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p>© {new Date().getFullYear()} SlideEase Private Limited (CIN: U47713MH2026PTC468787). All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <Link href="/admin/login" style={{ color: '#94a3b8', fontSize: '0.75rem', textDecoration: 'none' }}>
              Admin Login 🔐
            </Link>
            <p style={{ margin: 0 }}>
              Website Designed and Maintained by &nbsp;
              <a href="https://startupindia.biz" target="_blank" rel="noopener noreferrer" className="startup-credit">Startup India Business</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
