import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Slidex Footwear',
  description: 'Read the Terms of Service for Slidex Footwear. Understand the rules and conditions that govern your use of our e-commerce platform.',
};

export default function TermsPage() {
  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">Terms of Service</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '300px', height: '35vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Legal</span>
          <h1 className="page-hero-title">Terms of Service</h1>
          <p className="page-hero-desc">Last updated: July 1, 2026</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container legal-content" style={{ maxWidth: '900px' }}>
          
          {/* Essential Extracts */}
          <div style={{ backgroundColor: 'var(--primary-light, #f0f9ff)', borderLeft: '4px solid var(--primary-color)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>⚖️ Essential Extracts (Key Terms)</h3>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: 0, lineHeight: 1.6, fontSize: '0.95rem' }}>
              <li style={{ marginBottom: '0.8rem' }}><strong>Product Representation:</strong> We strive to display product colors and materials as accurately as possible. Slight variations may occur due to screen settings or photographic lighting.</li>
              <li style={{ marginBottom: '0.8rem' }}><strong>Intellectual Property:</strong> All content on this website—including the Slideease name, logo, hands-free product designs, and text—is the exclusive property of Slideease Footwear.</li>
              <li><strong>Governing Law:</strong> These terms are governed by and construed in accordance with the laws of India. Any disputes will be subject to the exclusive jurisdiction of the courts in Mumbai, India.</li>
            </ul>
          </div>

          <div className="legal-toc">
            <h3>Table of Contents</h3>
            <ol>
              <li><a href="#tos-1">1. Acceptance of Terms</a></li>
              <li><a href="#tos-2">2. Account Registration</a></li>
              <li><a href="#tos-3">3. Products & Pricing</a></li>
              <li><a href="#tos-4">4. Orders & Payment</a></li>
              <li><a href="#tos-5">5. Shipping & Delivery</a></li>
              <li><a href="#tos-6">6. Returns & Refunds</a></li>
              <li><a href="#tos-7">7. Intellectual Property</a></li>
              <li><a href="#tos-8">8. User Conduct</a></li>
              <li><a href="#tos-9">9. Limitation of Liability</a></li>
              <li><a href="#tos-10">10. Governing Law</a></li>
              <li><a href="#tos-11">11. Contact Information</a></li>
            </ol>
          </div>

          <div className="legal-section" id="tos-1">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using the Slidex Footwear website ("www.slidexfootwear.com"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all the terms and conditions, you must not use our website or services.</p>
            <p>These Terms apply to all visitors, users, customers, and others who access or use the Service. By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.</p>
          </div>

          <div className="legal-section" id="tos-2">
            <h2>2. Account Registration</h2>
            <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.</p>
            <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
            <p>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
          </div>

          <div className="legal-section" id="tos-3">
            <h2>3. Products & Pricing</h2>
            <p>All products displayed on our website are subject to availability. Prices for our products are subject to change without notice. We reserve the right to modify or discontinue any product at any time without prior notice.</p>
            <p>Prices are listed in Indian Rupees (INR) and are inclusive of all applicable taxes (GST). Promotional discounts are applied at checkout and may be subject to specific terms and conditions.</p>
            <p>We make every effort to display product colors and images as accurately as possible. However, monitor displays may vary, and we cannot guarantee that your display accurately reflects the color of the actual product.</p>
          </div>

          <div className="legal-section" id="tos-4">
            <h2>4. Orders & Payment</h2>
            <p>By placing an order, you are making an offer to purchase a product. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspected fraud.</p>
            <p>We accept the following payment methods: UPI, Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking, PhonePe, Paytm, Google Pay, and Cash on Delivery (COD) for select locations.</p>
            <p>All payment information is processed securely through our payment partners using 256-bit SSL encryption. Slidex Footwear does not store your full payment card information on our servers.</p>
          </div>

          <div className="legal-section" id="tos-5">
            <h2>5. Shipping & Delivery</h2>
            <p>We ship to all serviceable pin codes across India. Standard delivery is free on orders above ₹999 and takes 3-5 business days. Express delivery (₹99) is available for metro cities with 24-48 hour delivery.</p>
            <p>Delivery times are estimates and not guaranteed. Slidex Footwear is not responsible for delays caused by courier partners, force majeure events, or incorrect address details provided by the customer.</p>
          </div>

          <div className="legal-section" id="tos-6">
            <h2>6. Returns & Refunds</h2>
            <p>We offer a 7-day return and exchange policy from the date of delivery. Products must be returned in their original condition, unworn, unwashed, and with all tags attached.</p>
            <p>For complete details, please refer to our <Link href="/returns" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Return & Refund Policy</Link>.</p>
          </div>

          <div className="legal-section" id="tos-7">
            <h2>7. Intellectual Property</h2>
            <p>The Slidex Footwear name, logo, product designs, website content, images, and all associated intellectual property are owned by Slidex Footwear Private Limited and are protected by Indian and international copyright, trademark, and intellectual property laws.</p>
            <p>You may not copy, reproduce, distribute, or create derivative works based on our content without express written consent from Slidex Footwear.</p>
          </div>

          <div className="legal-section" id="tos-8">
            <h2>8. User Conduct</h2>
            <p>You agree not to: (a) use the website for any unlawful purpose, (b) submit false or misleading information, (c) attempt to gain unauthorized access to any portion of the website, (d) interfere with the proper functioning of the website, (e) upload malicious code or content, (f) impersonate any person or entity.</p>
          </div>

          <div className="legal-section" id="tos-9">
            <h2>9. Limitation of Liability</h2>
            <p>In no event shall Slidex Footwear, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
          </div>

          <div className="legal-section" id="tos-10">
            <h2>10. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.</p>
          </div>

          <div className="legal-section" id="tos-11">
            <h2>11. Contact Information</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>Email:</strong> legal@slidexfootwear.com</li>
              <li><strong>Phone:</strong> +91 22 4567 8900</li>
              <li><strong>Address:</strong> 1002 Bldg No 1d, Kopari, Powai, Mumbai 400076, India</li>
              <li><strong>CIN:</strong> U47713MH2026PTC468787</li>
            </ul>
          </div>

        </div>
      </section>
    </>
  );
}
