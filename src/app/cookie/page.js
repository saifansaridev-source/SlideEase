import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Cookie Policy | Slidex Footwear',
  description: 'Read about what cookies we use, why we use them, cookie categories, third-party analytics integrations, and how to adjust preference configurations at Slidex Footwear.',
};

export default function CookiePage() {
  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">Cookie Policy</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '280px', height: '30vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Privacy Assurance</span>
          <h1 className="page-hero-title">Cookie Policy</h1>
          <p className="page-hero-desc">How we use tracking cookies, beacons, and storage tokens.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="legal-content">
            
            <div className="legal-toc">
              <h3>Table of Contents</h3>
              <ol>
                <li><a href="#definition">1. What Are Cookies?</a></li>
                <li><a href="#how-we-use">2. How We Use Cookies</a></li>
                <li><a href="#categories">3. Cookie Categories We Collect</a></li>
                <li><a href="#managing-cookies">4. Managing Cookie Preferences</a></li>
                <li><a href="#updates">5. Policy Updates</a></li>
              </ol>
            </div>

            <div className="legal-section" id="definition">
              <h2>1. What Are Cookies?</h2>
              <p>Cookies are small text files containing alphanumeric characters that are saved on your browser directory or mobile device storage when you visit websites. They help web servers identify user sessions, preserve state preferences, and monitor navigation analytics.</p>
              <p>We may also employ web beacons, tracking pixels, and Local Storage Objects (LSOs) to collect shopping analytics.</p>
            </div>

            <div className="legal-section" id="how-we-use">
              <h2>2. How We Use Cookies</h2>
              <p>Slidex Footwear uses cookies to ensure our digital store behaves correctly. This includes tracking items placed in your shopping cart, preserving user profiles during session transitions, analyzing traffic metrics, and offering personalized discount coupons.</p>
            </div>

            <div className="legal-section" id="categories">
              <h2>3. Cookie Categories We Collect</h2>
              <p>We classify cookies into three distinct functional categories:</p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                <li style={{ marginBottom: '0.8rem' }}><strong>Necessary Cookies (Always Active):</strong> Essential to run core storefront features. They manage items in your shopping bag, handle secure checkout gateways, and maintain user authentications. Removing these will break checkout capabilities.</li>
                <li style={{ marginBottom: '0.8rem' }}><strong>Analytics & Performance Cookies:</strong> Monitor aggregate visitor volumes, track search queries, detect error codes, and evaluate browser speeds. We utilize Google Analytics to process this aggregate anonymous data.</li>
                <li><strong>Marketing & Targeting Cookies:</strong> Preserves newsletter choices, exits intent popups, and provides customizable seasonal voucher overlays based on your catalog interest.</li>
              </ul>
            </div>

            <div className="legal-section" id="managing-cookies">
              <h2>4. Managing Cookie Preferences</h2>
              <p>Under GDPR and CCPA compliance directives, you retain the legal right to customize, restrict, or revoke consent to analytics and marketing cookies at any time.</p>
              <p>To modify your consent, you can clear your browser cookies cache, which will trigger the consent banner on your next visit. You can also customize your preference directly by accessing our Cookie Banner settings during checkout or profile management.</p>
            </div>

            <div className="legal-section" id="updates">
              <h2>5. Policy Updates</h2>
              <p>We reserve the right to modify this Cookie Policy from time to time. Any changes will become effective immediately upon publishing the updated file on Slidex Footwear's website. We advise checking this page periodically to remain informed of our privacy compliance standards.</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
