'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FaqPage() {
  const [selectedCat, setSelectedCat] = useState('all');
  const [openIndex, setOpenIndex] = useState(7); // default open return policy (index 7) or first item

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'ordering', label: 'Ordering' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'returns', label: 'Returns' },
    { id: 'products', label: 'Products' },
    { id: 'account', label: 'Account' },
  ];

  const faqItems = [
    // ORDERING
    {
      category: 'ordering',
      q: 'How do I place an order?',
      a: 'Browse our catalog, select your size and quantity, and click "Add to Cart." Proceed to checkout, enter your shipping details, and choose a payment method. You\'ll receive an order confirmation email immediately after placing the order.',
    },
    {
      category: 'ordering',
      q: 'Can I modify or cancel my order after placing it?',
      a: 'Yes, you can modify or cancel your order anytime before it has been shipped. Contact us via email at support@your-domain.com or call +91 22 4567 8900. Once shipped, cancellations are not possible, but you can return the product after delivery.',
    },
    {
      category: 'ordering',
      q: 'What payment methods do you accept?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards (Visa, Mastercard, RuPay), Net Banking, mobile wallets, and Cash on Delivery (COD) for select pin codes. All online payments are secured with 256-bit SSL encryption.',
    },
    {
      category: 'ordering',
      q: 'Can I checkout without creating an account?',
      a: 'Yes! We offer guest checkout. However, creating an account lets you track orders, manage addresses, earn loyalty points, and enjoy faster future checkouts.',
    },
    // SHIPPING
    {
      category: 'shipping',
      q: 'How long does delivery take?',
      a: 'Standard delivery takes 3-5 business days across India and is FREE on orders above ₹999. Express delivery (₹99) is available for metro cities and takes 24-48 hours. You\'ll receive tracking updates via email and SMS.',
    },
    {
      category: 'shipping',
      q: 'Do you ship internationally?',
      a: 'Currently, we ship within India only. International shipping is planned for Q4 2026. Sign up for our newsletter to be notified when international shipping launches.',
    },
    {
      category: 'shipping',
      q: 'How can I track my order?',
      a: 'Once your order is shipped, you\'ll receive a tracking link via email. You can also track your order by logging into your account and visiting the "My Orders" section. If you checked out as a guest, use the tracking link in your confirmation email.',
    },
    // RETURNS
    {
      category: 'returns',
      q: 'What is your return and exchange policy?',
      a: 'We offer a 7-day hassle-free return and exchange policy. Products must be returned in their original, unworn condition with tags intact. We arrange free reverse pickup from your address. Full details are on our Shipping & Returns page.',
    },
    {
      category: 'returns',
      q: 'How long do refunds take?',
      a: 'Refunds are processed within 5-7 business days after we receive and inspect the returned product. UPI and wallet refunds are faster (24-48 hours). Card and net banking refunds may take 5-7 business days depending on your bank.',
    },
    {
      category: 'returns',
      q: 'What if I receive a damaged or wrong product?',
      a: 'Contact us within 48 hours of delivery with photos of the damage. We\'ll arrange an immediate free replacement or full refund. In most cases, you don\'t need to return the damaged product.',
    },
    // PRODUCTS
    {
      category: 'products',
      q: 'How does the hands-free technology actually work?',
      a: 'SlideEase shoes are built with an engineered, flexible heel counter and leading-edge internal architecture. When you step down, the heel compresses to let your foot glide in smoothly, then immediately snaps back into place to lock your foot securely. You get the stability of a performance shoe with the ease of a slide.',
    },
    {
      category: 'products',
      q: 'Who are SlideEase shoes designed for?',
      a: 'Everyone! They are built for busy professionals and achievers who frequently need to remove their shoes throughout the day (at temples, offices, or homes). They are also deeply beneficial for elders, pregnant women, or anyone suffering from back pain, flexibility issues, or arthritis, as they completely eliminate the need to bend down.',
    },
    {
      category: 'products',
      q: 'What is the benefit of the Wide-Toe Design?',
      a: 'Traditional shoes pinch your toes together, which can cause pain and imbalance over time. Our wide-toe design mimics the natural shape of your foot. This allows your toes to splay naturally, giving you significantly better real-world stability, pressure distribution, and peak comfort during long hours of standing or walking.',
    },
    {
      category: 'products',
      q: 'How do I choose the correct shoe size?',
      a: 'We follow standard UK/Indian footwear sizes. Select the size you normally wear in formal shoes. If you are in between sizes (e.g., UK 7.5), we recommend ordering one size up (UK 8) for maximum comfort in slides and slip-ons. Check the Size Guide on each product page for detailed measurements.',
    },
    {
      category: 'products',
      q: 'Are your shoes really 100% vegan?',
      a: 'Yes! Every SlideEase product is certified PETA-Approved Vegan. We use zero animal products — our "leather" is premium synthetic vegan leather, and our canvas is handwoven from cotton and jute fibers. Even our adhesives are plant-based.',
    },
    {
      category: 'products',
      q: 'Are they machine washable?',
      a: 'Due to the leading-edge tech and double-layer water-resistant materials in select models, we recommend wiping them down with a damp cloth and mild soap. Avoid machine washing or submerging them completely to preserve the water-resistant layers.',
    },
    // ACCOUNT
    {
      category: 'account',
      q: 'How do I create an account?',
      a: 'Visit our Account Portal and click the "Register" tab. Fill in your name, email, and password. You\'ll receive a welcome email with a 10% discount code for your first purchase.',
    },
    {
      category: 'account',
      q: 'I forgot my password. How do I reset it?',
      a: 'Click the "Forgot Password?" link on the login page. Enter your registered email address, and we\'ll send a password reset link. Follow the link to set a new password. If you don\'t receive the email, check your spam folder or contact us.',
    },
    {
      category: 'account',
      q: 'What is the SlideEase Loyalty Club?',
      a: 'The SlideEase Club is our free loyalty program. Members earn 5 reward points for every ₹100 spent, receive early access to sales, and get a 10% welcome discount. Points can be redeemed as discounts on future orders.',
    },
  ];

  const filteredFaqs = selectedCat === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === selectedCat);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">FAQs</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '300px', height: '35vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Help Center</span>
          <h1 className="page-hero-title">Frequently Asked Questions</h1>
          <p className="page-hero-desc">Everything you need to know about SlideEase Footwear.</p>
        </div>
      </section>

      {/* FAQ Category Tabs */}
      <section className="container" style={{ padding: '3rem 1.5rem 1rem' }}>
        <div className="shop-categories-tab" id="faq-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-tab-btn ${selectedCat === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Accordions */}
      <section className="section-padding" style={{ paddingTop: '1rem' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="faq-accordion-container" id="faq-container">
            {filteredFaqs.map((item, idx) => {
              // Find index of this item in the master list so openIndex remains correct
              const masterIndex = faqItems.findIndex(f => f.q === item.q);
              const isOpen = openIndex === masterIndex;

              return (
                <div key={idx} className={`faq-item ${isOpen ? 'active' : ''}`} data-category={item.category}>
                  <div className="faq-header" onClick={() => toggleFaq(masterIndex)} style={{ cursor: 'pointer' }}>
                    <span className="faq-question">{item.q}</span>
                    <span className="faq-toggle-icon">{isOpen ? '▲' : '▼'}</span>
                  </div>
                  <div className="faq-body" style={{ display: isOpen ? 'block' : 'none' }}>
                    <div className="faq-content" dangerouslySetInnerHTML={{ __html: item.a }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Still need help? */}
          <div style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem 2rem', backgroundColor: 'var(--bg-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Still Have Questions?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Our customer support team is available Monday to Saturday, 9 AM to 6 PM.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-primary">Contact Support</Link>
              <a href="mailto:support@your-domain.com" className="btn btn-outline">Email Us</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
