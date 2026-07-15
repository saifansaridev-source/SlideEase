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
        setStatusMsg(data.message);
        setStatusType('success');
        setEmail('');
      } else {
        setStatusMsg(data.error);
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
          
          {/* Brand Info */}
          <div className="footer-brand-col">
            <Link href="/" className="footer-logo-link">
              <img src="/assets/logo.png" alt="Slidex Logo" className="logo-img footer-logo-img" />
            </Link>
            <p className="footer-desc">Premium e-commerce platform offering 100% PETA-approved cruelty-free vegan footwear adorned with traditional Indian artisan weaves.</p>
            <div className="footer-social-links">
              <a href="#" className="social-icon-btn" aria-label="Facebook link">f</a>
              <a href="#" class="social-icon-btn" aria-label="Instagram link">ig</a>
              <a href="#" class="social-icon-btn" aria-label="Twitter link">tw</a>
            </div>
          </div>

          {/* Shop Online */}
          <div>
            <h3 className="footer-h3">Shop Online</h3>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link href="/shop">Browse Catalog</Link></li>
              <li className="footer-link-item"><Link href="/shop?category=mens">Men's Footwear</Link></li>
              <li className="footer-link-item"><Link href="/shop?category=womens">Women's Footwear</Link></li>
              <li className="footer-link-item"><Link href="/shop?type=loafers">Premium Loafers</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="footer-h3">Support & Legal</h3>
            <ul className="footer-links-list">
              <li className="footer-link-item"><Link href="/contact">Contact Support</Link></li>
              <li className="footer-link-item"><Link href="/blog">Blogs & Guides</Link></li>
              <li className="footer-link-item"><Link href="/faq">FAQs Center</Link></li>
              <li className="footer-link-item"><Link href="/about">About Us</Link></li>
              <li className="footer-link-item"><Link href="/returns">Return & Refund Policy</Link></li>
              <li className="footer-link-item"><Link href="/shipping">Shipping Policy</Link></li>
              <li className="footer-link-item"><Link href="/terms">Terms of Service</Link></li>
              <li className="footer-link-item"><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="footer-newsletter-col">
            <h3 className="footer-h3">Newsletter</h3>
            <p className="footer-desc" style={{ marginBottom: '0.8rem' }}>Subscribe to receive early sales notifications, lifestyle tips, and a flat 10% coupon!</p>
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
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Slidex Footwear Private Limited (CIN: U47713MH2026PTC468787). All rights reserved.</p>
          <p>
            Website Designed and Maintained by &nbsp;
            <a href="https://startupindia.biz" target="_blank" rel="noopener noreferrer" className="startup-credit">Startup India Business</a>
          </p>
        </div>

      </div>
    </footer>
  );
}
