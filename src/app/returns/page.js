import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Return & Refund Policy | Slidex Footwear',
  description: 'Slidex Footwear Return & Refund Policy. 30-day hassle-free returns, exchange process, and refund timelines.',
};

export default function ReturnsPage() {
  return (
    <>
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">Return & Refund Policy</li>
          </ol>
        </div>
      </nav>

      <section className="page-hero" style={{ backgroundImage: "url('/og_image.png')", minHeight: '300px', height: '35vh' }}>
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="page-hero-tagline">Our Promise</span>
          <h1 className="page-hero-title">Return & Refund Policy</h1>
          <p className="page-hero-desc">Hassle-free 30-day returns. No questions asked.</p>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container legal-content" style={{ maxWidth: '900px' }}>

          {/* Return Steps */}
          <div className="return-steps-grid">
            <div className="return-step-card">
              <div className="return-step-num">1</div>
              <h4>Request Return</h4>
              <p>Contact us within 30 days of delivery via email, phone, or the Contact page with your Order ID.</p>
            </div>
            <div className="return-step-card">
              <div className="return-step-num">2</div>
              <h4>Free Pickup</h4>
              <p>Our courier partner will pick up the product from your address at zero cost within 2-3 business days.</p>
            </div>
            <div className="return-step-card">
              <div className="return-step-num">3</div>
              <h4>Quality Check</h4>
              <p>We inspect the returned product within 48 hours of receiving it at our facility.</p>
            </div>
            <div className="return-step-card">
              <div className="return-step-num">4</div>
              <h4>Refund Processed</h4>
              <p>Refund is initiated to your original payment method within 5-7 business days of approval.</p>
            </div>
          </div>

          <div className="legal-section">
            <h2>Return Eligibility</h2>
            <p>Products are eligible for return if:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0 1.5rem' }}>
              <li>The return is requested within <strong>30 days</strong> of delivery</li>
              <li>The product is in its original, unworn condition</li>
              <li>All original tags and packaging are intact</li>
              <li>The product is not customized or personalized</li>
            </ul>
            <p><strong>Non-returnable items:</strong></p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li>Products that have been worn, washed, or altered</li>
              <li>Products without original packaging or tags</li>
              <li>Gift cards and vouchers</li>
              <li>Items marked as "Final Sale" or "Non-Returnable"</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>Exchanges</h2>
            <p>We offer free size exchanges on all orders. If your Slidex footwear doesn't fit perfectly:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li>Contact us and specify the new size you need</li>
              <li>We'll arrange a reverse pickup and ship the correct size</li>
              <li>Exchange delivery takes 5-7 business days after pickup</li>
              <li>If the desired size is out of stock, a full refund will be processed</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>Refund Timeline</h2>
            <table className="specs-table" style={{ margin: '1rem 0', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--border-color)' }}>Payment Method</th>
                  <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--border-color)' }}>Refund Timeline</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Credit/Debit Card</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>5-7 business days</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>UPI (Google Pay, PhonePe, Paytm)</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>3-5 business days</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Net Banking</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>5-7 business days</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Cash on Delivery</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>7-10 business days (via bank transfer)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>Wallet (Paytm, PhonePe)</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid var(--border-color)' }}>24-48 hours</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Note: The refund amount may take additional time to reflect in your account depending on your bank's processing time. Slidex Footwear is not responsible for delays caused by banking institutions.</p>
          </div>

          <div className="legal-section">
            <h2>Damaged or Defective Products</h2>
            <p>If you receive a damaged or defective product:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li>Contact us within <strong>48 hours</strong> of delivery with photos of the damage</li>
              <li>We will arrange immediate free replacement or full refund</li>
              <li>No need to return the damaged product in most cases</li>
              <li>Priority processing — replacement shipped within 24 hours</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>Cancellations</h2>
            <p>You can cancel your order at any time before it has been shipped. Once shipped, cancellation is not possible — you may return the product after delivery instead.</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li><strong>Before shipment:</strong> Full refund within 24-48 hours</li>
              <li><strong>After shipment:</strong> Please follow the return process above</li>
              <li><strong>COD orders:</strong> No charges apply for pre-shipment cancellation</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>Shipping Charges on Returns</h2>
            <p>Slidex Footwear bears all return shipping costs for eligible returns. The customer does not need to pay any shipping charges for returns or exchanges.</p>
            <p>For international orders (when applicable), return shipping charges may be deducted from the refund amount.</p>
          </div>

          <div className="legal-section">
            <h2>Need Help?</h2>
            <p>If you have any questions about returns or refunds, reach out to us:</p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li><strong>Email:</strong> returns@slidexfootwear.com</li>
              <li><strong>Phone:</strong> +91 22 4567 8900 (Mon-Sat, 9AM-6PM)</li>
              <li><strong>Contact Form:</strong> <Link href="/contact" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Contact Us Page</Link></li>
            </ul>
          </div>

        </div>
      </section>
    </>
  );
}
