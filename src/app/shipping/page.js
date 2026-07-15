import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping Policy | Slidex Footwear',
  description: 'Review delivery transit times, standard and priority express shipping rates, delivery zones across India, and tracking info at Slidex Footwear.',
};

export default function ShippingPage() {
  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">Shipping Policy</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '280px', height: '30vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Fulfilment & Delivery</span>
          <h1 className="page-hero-title">Shipping Policy</h1>
          <p className="page-hero-desc">Learn about how we package, dispatch, and deliver your footwear.</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="legal-content">
            
            <div className="legal-toc">
              <h3>Table of Contents</h3>
              <ol>
                <li><a href="#processing-time">1. Order Processing Times</a></li>
                <li><a href="#shipping-rates">2. Shipping Rates & Estimates</a></li>
                <li><a href="#delivery-zones">3. Delivery Zones & Pin Codes</a></li>
                <li><a href="#tracking">4. Tracking Your Shipment</a></li>
                <li><a href="#undelivered">5. Failed Deliveries & Address Corrections</a></li>
              </ol>
            </div>

            <div className="legal-section" id="processing-time">
              <h2>1. Order Processing Times</h2>
              <p>All orders are processed within 1 to 2 business days (excluding Sundays and national holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.</p>
              <p>Orders placed before 12:00 PM IST on business days are generally dispatched from our central warehouse in Mumbai on the same day.</p>
            </div>

            <div className="legal-section" id="shipping-rates">
              <h2>2. Shipping Rates & Estimates</h2>
              <p>We offer shipping across India. Standard Shipping is free for all orders with a cart subtotal above ₹999. Surcharges apply for express priority delivery:</p>
              
              <div className="admin-table-wrapper" style={{ margin: '1.5rem 0', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-light)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Shipping Method</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Order Subtotal</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Estimated Delivery Time</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}><strong>Standard Shipping</strong></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Under ₹999</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>3 to 5 business days</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>₹99</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}><strong>Standard Shipping</strong></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>₹999 and above</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>3 to 5 business days</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}><strong>FREE</strong></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}><strong>Priority Express Shipping</strong></td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>Any amount</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>24 to 48 hours (Metros only)</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>₹149</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="legal-section" id="delivery-zones">
              <h2>3. Delivery Zones & Pin Codes</h2>
              <p>We partner with premier logistics providers (Blue Dart, Delhivery, and Xpressbees) to cover over 19,000 pin codes across India. During checkout, our pin code validation tool will confirm if service is active in your area.</p>
              <p>If your location is categorized as a Remote Zone by our logistics partners, standard delivery may take an additional 2 to 3 business days.</p>
            </div>

            <div className="legal-section" id="tracking">
              <h2>4. Tracking Your Shipment</h2>
              <p>When your order has shipped, you will receive an email and an SMS notification containing a tracking number and link. You can check the current status of your shipment by clicking the link or visiting the "My Orders" panel in your Customer Dashboard.</p>
              <p>Please allow 24 hours for the tracking information to become active in our logistics partners' systems.</p>
            </div>

            <div className="legal-section" id="undelivered">
              <h2>5. Failed Deliveries & Address Corrections</h2>
              <p>Our courier partners will attempt delivery up to three (3) times before returning the package to our warehouse. Please ensure you provide a valid mobile number and correct delivery address details during checkout to prevent shipment failures.</p>
              <p>For immediate corrections to addresses after placing an order, please email <a href="mailto:support@slidexfootwear.com" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>support@slidexfootwear.com</a> or call +91 22 4567 8900 within 2 hours of purchase.</p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
