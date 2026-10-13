import React from 'react';
import Link from 'next/link';
import { getCmsPage } from '@/lib/cms';

export async function generateMetadata() {
  const cmsPage = await getCmsPage('privacy');
  return {
    title: cmsPage?.metaTitle || 'Privacy Policy | SlideEase Footwear',
    description: cmsPage?.metaDesc || 'SlideEase Footwear Privacy Policy — how we collect, use, and protect your personal data. GDPR and CCPA compliant.',
  };
}

export default async function PrivacyPage() {
  const cmsPage = await getCmsPage('privacy');
  const heroTitle = cmsPage?.isDbDriven && cmsPage?.title ? cmsPage.title : 'Privacy Policy';

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
          <span className="page-hero-tagline">Your Data</span>
          <h1 className="page-hero-title">{heroTitle}</h1>
          <p className="page-hero-desc">Last updated: July 1, 2026 | GDPR &amp; CCPA Compliant</p>
        </div>
      </section>

      {cmsPage?.isDbDriven && cmsPage?.content ? (
        <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }}>
          <div className="container legal-content" style={{ maxWidth: '900px' }} dangerouslySetInnerHTML={{ __html: cmsPage.content }} />
        </section>
      ) : (
        <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }}>
          <div className="container legal-content" style={{ maxWidth: '900px' }}>


          {/* Essential Extracts */}
          <div style={{ backgroundColor: 'var(--primary-light, #f0f9ff)', borderLeft: '4px solid var(--primary-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>🔒 Essential Extracts (Key Terms)</h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
              <li style={{ marginBottom: '0.8rem' }}><strong>Data Collection:</strong> We collect your name, shipping address, email, phone number, and payment information solely to process your orders and enhance your shopping experience.</li>
              <li style={{ marginBottom: '0.8rem' }}><strong>Data Security:</strong> Your payment transactions are securely processed through encrypted, PCI-DSS compliant payment gateways. Slideease never stores your credit card details.</li>
              <li><strong>Communication:</strong> By providing your information, you agree to receive order updates via email, SMS, and WhatsApp. You can opt out of marketing communications at any time.</li>
            </ul>
          </div>

          <div className="legal-toc">
            <h3>Table of Contents</h3>
            <ol>
              <li><a href="#pp-1">1. Information We Collect</a></li>
              <li><a href="#pp-2">2. How We Use Your Information</a></li>
              <li><a href="#pp-3">3. Cookies & Tracking Technologies</a></li>
              <li><a href="#pp-4">4. Data Sharing & Third Parties</a></li>
              <li><a href="#pp-5">5. Data Security</a></li>
              <li><a href="#pp-6">6. Data Retention</a></li>
              <li><a href="#pp-7">7. Your Rights (GDPR/CCPA)</a></li>
              <li><a href="#pp-8">8. Children's Privacy</a></li>
              <li><a href="#pp-9">9. Changes to This Policy</a></li>
              <li><a href="#pp-10">10. Contact Us</a></li>
            </ol>
          </div>

          <div className="legal-section" id="pp-1">
            <h2>1. Information We Collect</h2>
            <p>We collect information in the following ways:</p>
            <h4>Information You Provide Directly</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0 1rem' }}>
              <li><strong>Account Information:</strong> Name, email address, phone number, password when you register.</li>
              <li><strong>Order Information:</strong> Shipping address, billing address, payment details when you make a purchase.</li>
              <li><strong>Communication Data:</strong> Information you provide when contacting us (name, email, message content).</li>
              <li><strong>Review Data:</strong> Name and review content when you submit product reviews.</li>
            </ul>
            <h4>Information Collected Automatically</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, click patterns, referring URLs.</li>
              <li><strong>Location Data:</strong> Approximate geographic location based on IP address.</li>
              <li><strong>Cookies:</strong> Session and persistent cookies for site functionality and analytics.</li>
            </ul>
          </div>

          <div className="legal-section" id="pp-2">
            <h2>2. How We Use Your Information</h2>
            <p>We use collected information for the following purposes:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li>To process and fulfill your orders, including shipping and delivery</li>
              <li>To manage your account and provide customer support</li>
              <li>To send order confirmations, shipping updates, and delivery notifications</li>
              <li>To personalize your shopping experience and show relevant product recommendations</li>
              <li>To send marketing communications (with your explicit consent)</li>
              <li>To prevent fraud and enhance website security</li>
              <li>To analyze website usage and improve our services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          <div className="legal-section" id="pp-3">
            <h2>3. Cookies & Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to collect and store information about your interactions with our website.</p>
            <table className="specs-table" style={{ margin: '1rem 0', width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)', width: '30%' }}><strong>Essential Cookies</strong></td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Required for basic site functionality (cart, login sessions). Cannot be disabled.</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}><strong>Analytics Cookies</strong></td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Help us understand how visitors use our website (Google Analytics).</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}><strong>Marketing Cookies</strong></td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Used to deliver personalized advertisements and track campaign performance.</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}><strong>Preference Cookies</strong></td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Remember your settings and preferences (language, currency).</td>
                </tr>
              </tbody>
            </table>
            <p>You can manage cookie preferences through our <Link href="/cookie" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Cookie Policy</Link> page.</p>
          </div>

          <div className="legal-section" id="pp-4">
            <h2>4. Data Sharing & Third Parties</h2>
            <p>We do <strong>not sell</strong> your personal data to third parties. We only share essential operational data with verified service partners:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li><strong>Payment Gateway:</strong> Razorpay for PCI-DSS compliant secure checkout and verification. Card credentials are never handled or stored on SlideEase servers.</li>
              <li><strong>Logistics Partners:</strong> Shiprocket, Delhivery, and Blue Dart for order fulfillment, live tracking, and reverse pickup logistics.</li>
              <li><strong>Evidence Photos:</strong> Customer-uploaded product photographs are securely stored on private cloud storage solely to verify returns and process exchange/refund eligibility.</li>
              <li><strong>Transactional Communications:</strong> Resend API for sending order confirmations, dispatch notices, and return status notifications.</li>
              <li><strong>Legal Compliance:</strong> When required by applicable statutory authorities under Indian law.</li>
            </ul>
          </div>

          <div className="legal-section" id="pp-5">
            <h2>5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li>TLS 1.3 encryption for all data in transit across HTTPS</li>
              <li>HMAC SHA-256 cryptographically verified sessions and webhook authentication</li>
              <li>Timing-safe comparison checks protecting against timing attacks</li>
              <li>PCI-DSS compliant payment processing via Razorpay</li>
              <li>Role-based access controls for administrative dashboard operations</li>
              <li>Server-side file validation and MIME filtering for customer uploads</li>
            </ul>
          </div>

          <div className="legal-section" id="pp-6">
            <h2>6. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to fulfill orders, process warranty or return requests, and comply with tax and accounting requirements.</p>
          </div>

          <div className="legal-section" id="pp-7">
            <h2>7. Your Rights (GDPR/CCPA & Indian Digital Personal Data Protection)</h2>
            <p>You have the right to access, review, correct, or request deletion of your personal account information at any time.</p>
            <div className="rights-grid">
              <div className="right-card"><h4>🔍 Right to Access</h4><p>Request a copy of personal information and order history.</p></div>
              <div className="right-card"><h4>✏️ Right to Rectification</h4><p>Request correction of inaccurate shipping or profile data.</p></div>
              <div className="right-card"><h4>🗑️ Right to Erasure</h4><p>Request deletion of your account and profile records.</p></div>
              <div className="right-card"><h4>📦 Right to Portability</h4><p>Export your order and address data upon request.</p></div>
            </div>
            <p style={{ marginTop: '1rem' }}>To exercise any of these rights, contact our Data Grievance Officer at <strong>support@slideease.in</strong>.</p>
          </div>

          <div className="legal-section" id="pp-8">
            <h2>8. Children's Privacy</h2>
            <p>Our website is intended for general audiences. We do not knowingly collect personal data from minors under 18 years of age.</p>
          </div>

          <div className="legal-section" id="pp-9">
            <h2>9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Any modifications will be posted directly with an updated revision date.</p>
          </div>

          <div className="legal-section" id="pp-10">
            <h2>10. Contact Us</h2>
            <p>For any privacy, order, or customer assistance inquiries:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li><strong>Customer Support & Returns:</strong> support@slideease.in</li>
              <li><strong>General Inquiries:</strong> contact@slideease.in</li>
              <li><strong>Administrative Operations:</strong> admin@slideease.in</li>
              <li><strong>Corporate Address:</strong> Powai, Mumbai 400076, Maharashtra, India</li>
            </ul>
          </div>

          </div>
        </section>
      )}
    </>
  );
}

