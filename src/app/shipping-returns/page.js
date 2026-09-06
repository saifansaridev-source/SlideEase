import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Shipping & Returns Policy | SlideEase Footwear',
  description: 'Review our India-wide delivery timelines, express shipping, and 30-day hassle-free returns and exchange policy at SlideEase Footwear.',
};

export default function ShippingReturnsPage() {
  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">Shipping & Returns</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '280px', height: '32vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Fulfilment & Satisfaction</span>
          <h1 className="page-hero-title">Shipping & Returns Policy</h1>
          <p className="page-hero-desc">Everything you need to know about dispatch timelines, delivery, exchanges, and hassle-free returns.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container" style={{ maxWidth: '920px' }}>
          <div className="legal-content">

            <div className="legal-toc">
              <h3>Table of Contents</h3>
              <ol>
                <li><a href="#shipping-policy">1. Shipping & Delivery Policy</a></li>
                <li><a href="#delivery-timelines">2. Delivery Zones & Estimated Timelines</a></li>
                <li><a href="#shipping-charges">3. Shipping Rates & COD Policy</a></li>
                <li><a href="#tracking">4. Tracking Your Order</a></li>
                <li><a href="#returns-policy">5. 30-Day Return & Exchange Policy</a></li>
                <li><a href="#return-steps">6. How to Initiate a Return or Exchange</a></li>
                <li><a href="#refund-process">7. Refund Timelines & Payment Modes</a></li>
                <li><a href="#contact-support">8. Customer Assistance</a></li>
              </ol>
            </div>

            {/* SECTION 1: Shipping Policy */}
            <div className="legal-section" id="shipping-policy">
              <h2>1. Shipping & Delivery Policy</h2>
              <p>
                At SlideEase Footwear, every pair of handcrafted vegan shoes is inspected, packed with sustainable 
                biodegradable materials, and dispatched from our primary fulfillment facility in Mumbai, Maharashtra.
              </p>
              <p>
                <strong>Processing Window:</strong> All orders are processed within 1 to 2 business days (Monday through Saturday, 
                excluding national and state holidays). Orders confirmed before 12:00 PM IST on business days are queued for 
                same-day dispatch.
              </p>
            </div>

            {/* SECTION 2: Delivery Timelines */}
            <div className="legal-section" id="delivery-timelines">
              <h2>2. Delivery Zones & Estimated Timelines</h2>
              <p>We partner with premier logistics providers—including Blue Dart, Delhivery, and Xpressbees—to ensure swift, secure delivery across 19,000+ pin codes in India.</p>

              <div className="admin-table-wrapper" style={{ margin: '1.5rem 0', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-light)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Destination Zone</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Estimated Transit Time</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Courier Partners</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Mumbai & MMR Region</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>1 – 2 Business Days</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Delhivery / Local Direct</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Tier 1 Metro Cities (Delhi, BLR, HYD, MAA, CCU)</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>2 – 4 Business Days</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Blue Dart Air / Delhivery Express</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>Rest of India (Tier 2 & 3 Cities)</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>4 – 6 Business Days</td>
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>Delhivery / Xpressbees</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>Northeast, J&K, Island Territories</td>
                      <td style={{ padding: '12px 16px' }}>6 – 8 Business Days</td>
                      <td style={{ padding: '12px 16px' }}>India Post Speed Post / Blue Dart</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3: Shipping Charges */}
            <div className="legal-section" id="shipping-charges">
              <h2>3. Shipping Rates & COD Policy</h2>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: 1.8, margin: '1rem 0' }}>
                <li><strong>Prepaid Orders:</strong> FREE Standard Shipping across India on all prepaid orders (UPI, Credit/Debit Cards, Net Banking).</li>
                <li><strong>Orders Below ₹999:</strong> A nominal flat shipping fee of ₹79 applies to small carts under ₹999.</li>
                <li><strong>Cash on Delivery (COD):</strong> COD is supported for cart values up to ₹5,000. A standard ₹99 convenience handling charge is added at checkout to cover reverse cash transit logistics.</li>
                <li><strong>Priority Express Delivery:</strong> Available in select metro pin codes for ₹149 (dispatched within 12 hours via air transit).</li>
              </ul>
            </div>

            {/* SECTION 4: Tracking */}
            <div className="legal-section" id="tracking">
              <h2>4. Tracking Your Order</h2>
              <p>
                As soon as your shipment is scanned by our courier partner, you will receive an automated dispatch notification 
                via SMS, WhatsApp, and email containing a direct live tracking link and Air Waybill (AWB) number.
              </p>
              <p>
                You can also check the status anytime in your <Link href="/dashboard" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>SlideEase Customer Dashboard</Link>.
              </p>
            </div>

            <hr style={{ margin: '3rem 0', borderColor: 'var(--border-color)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

            {/* SECTION 5: Returns & Exchange */}
            <div className="legal-section" id="returns-policy">
              <h2>5. 30-Day Hassle-Free Returns & Exchange</h2>
              <p>
                We want you to feel confident and comfortable in every step. If the size isn't right, or the design 
                doesn't meet your expectations, we offer a straightforward <strong>30-day return or exchange window</strong> from the date of delivery.
              </p>

              <div style={{ backgroundColor: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0', borderLeft: '4px solid var(--accent-color)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>Eligibility Guidelines</h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', margin: 0, lineHeight: 1.7, fontSize: '0.95rem' }}>
                  <li>Footwear must be unworn, undamaged, and free of dirt or outdoor scuffs (please try on carpeted surfaces).</li>
                  <li>Original branded shoebox, tags, and packaging materials must be intact.</li>
                  <li>Custom engraved or personalized footwear cannot be returned unless manufacturing defect is detected.</li>
                  <li>Complimentary gifts or promotional accessories included with the order must be returned in case of full order refund.</li>
                </ul>
              </div>
            </div>

            {/* SECTION 6: Return Steps */}
            <div className="legal-section" id="return-steps">
              <h2>6. How to Initiate a Return or Exchange</h2>
              <div className="return-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', margin: '2rem 0' }}>
                <div className="return-step-card" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="return-step-num" style={{ width: '40px', height: '40px', background: 'var(--accent-color)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>1</div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Submit Request</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-muted)' }}>Go to your Dashboard or contact support with your Order ID & request type (exchange / refund).</p>
                </div>
                <div className="return-step-card" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="return-step-num" style={{ width: '40px', height: '40px', background: 'var(--accent-color)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>2</div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Free Pickup</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-muted)' }}>Our courier collects the packaged shoebox from your doorstep within 2–3 business days.</p>
                </div>
                <div className="return-step-card" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="return-step-num" style={{ width: '40px', height: '40px', background: 'var(--accent-color)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>3</div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Quality Check</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-muted)' }}>Items arrive at our facility and are inspected within 48 hours for unworn condition.</p>
                </div>
                <div className="return-step-card" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="return-step-num" style={{ width: '40px', height: '40px', background: 'var(--accent-color)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 700 }}>4</div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Resolution</h4>
                  <p style={{ fontSize: '0.88rem', margin: 0, color: 'var(--text-muted)' }}>Replacement size dispatched immediately, or refund credited within 5–7 business days.</p>
                </div>
              </div>
            </div>

            {/* SECTION 7: Refund Process */}
            <div className="legal-section" id="refund-process">
              <h2>7. Refund Timelines & Payment Modes</h2>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: 1.8, margin: '1rem 0' }}>
                <li><strong>Prepaid Transactions (UPI / Cards / Net Banking):</strong> Credited directly to the original bank account or payment method within 5 to 7 business days following quality approval.</li>
                <li><strong>Cash on Delivery (COD) Orders:</strong> You can choose between instant SlideEase Store Credit (+ 5% bonus wallet credit) or direct NEFT/IMPS bank transfer to your provided account details.</li>
                <li><strong>Exchange Orders:</strong> First size exchange is 100% free of reverse pickup charges.</li>
              </ul>
            </div>

            {/* SECTION 8: Support */}
            <div className="legal-section" id="contact-support">
              <h2>8. Customer Assistance</h2>
              <p>
                Need help with a shipment, exchange, or return? Our dedicated support team is available Monday through Saturday, 9:30 AM to 6:30 PM IST.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                <Link href="/contact" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
                  Contact Support Page
                </Link>
                <Link href="/size-guide" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem' }}>
                  Consult Size Guide
                </Link>
                <a href="https://wa.me/912245678900?text=Hello%20SlideEase%20Support,%20I%20have%20an%20inquiry%20regarding%20shipping%20or%20returns." target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem' }}>
                  WhatsApp Concierge
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
