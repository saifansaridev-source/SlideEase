'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart, getSubtotal, discount, clearCart } = useCart();
  const router = useRouter();

  // Redirect if cart empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart]);

  // Billing form states
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Gateway mock overlay
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('Connecting to gateway...');

  const subtotal = getSubtotal();
  const discountVal = Math.round(subtotal * discount);
  
  // Shipping calculations
  const shippingVal = shippingMethod === 'express' ? 149 : (subtotal >= 999 ? 0 : 99);
  
  // Tax breakdown (18% inclusive GST)
  const taxPct = 0.18;
  const taxVal = Math.round((subtotal - discountVal) * (taxPct / (1 + taxPct)));
  
  const totalVal = subtotal - discountVal + shippingVal;

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    if (!email || !firstname || !lastname || !phone || !address || !city || !state || !zip) {
      return;
    }

    // Trigger secure payment simulation
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingText('Connecting to Razorpay gateway...');

    // Progress bar runner
    const timer = setInterval(async () => {
      setProcessingProgress((prev) => {
        const next = prev + 20;
        if (next === 40) setProcessingText('Validating 3D-Secure payment details...');
        if (next === 80) setProcessingText('Capturing secure payment response...');
        if (next >= 100) {
          clearInterval(timer);
          completeCheckout();
        }
        return next;
      });
    }, 600);
  };

  const completeCheckout = async () => {
    try {
      const orderBody = {
        firstname,
        lastname,
        email,
        phone,
        address,
        city,
        state,
        zip,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          size: item.size
        })),
        paymentMethod,
        subtotal,
        discount: discountVal,
        tax: taxVal,
        shipping: shippingVal,
        total: totalVal
      };

      // POST checkout order to API route (insert into MongoDB)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody),
      });
      const data = await res.json();

      if (data.success) {
        // Save order to sessionStorage to display on the confirmation page
        sessionStorage.setItem('slidex_last_order', JSON.stringify(data.data));
        clearCart();
        setIsProcessing(false);
        router.push('/checkout/confirmation');
      } else {
        alert('Order insertion failed: ' + data.error);
        setIsProcessing(false);
      }
    } catch (err) {
      alert('Order submission failed: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '2.5rem' }}>Secure Checkout</h1>

      <div className="checkout-layout-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem' }}>
        
        {/* Form billing */}
        <div className="checkout-form-col">
          <form onSubmit={handleSubmitCheckout} className="contact-form" style={{ gap: '1.5rem' }}>
            
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem' }}>Contact Information</h3>
              <div className="form-group">
                <label htmlFor="checkout-email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  id="checkout-email" 
                  required 
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1rem' }}>Shipping Address</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="checkout-firstname" className="form-label">First Name</label>
                  <input 
                    type="text" 
                    id="checkout-firstname" 
                    required 
                    className="form-input"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-lastname" className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    id="checkout-lastname" 
                    required 
                    className="form-input"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="checkout-phone" className="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  id="checkout-phone" 
                  required 
                  placeholder="e.g. +91 98765 43210"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="checkout-address" className="form-label">Street Address</label>
                <input 
                  type="text" 
                  id="checkout-address" 
                  required 
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="checkout-city" className="form-label">City</label>
                  <input 
                    type="text" 
                    id="checkout-city" 
                    required 
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-state" className="form-label">State</label>
                  <input 
                    type="text" 
                    id="checkout-state" 
                    required 
                    className="form-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="checkout-zip" className="form-label">ZIP Code</label>
                  <input 
                    type="text" 
                    id="checkout-zip" 
                    required 
                    className="form-input"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1rem' }}>Shipping Method</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label className={`radio-label ${shippingMethod === 'standard' ? 'active' : ''}`} style={{ display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="shipping-method" 
                    value="standard" 
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <strong>Standard Delivery</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>3-5 days • Free above ₹999</div>
                </label>
                <label className={`radio-label ${shippingMethod === 'express' ? 'active' : ''}`} style={{ display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="shipping-method" 
                    value="express" 
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <strong>Express Delivery</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>24-48 hours • ₹149 flat</div>
                </label>
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1rem' }}>Payment Gateway</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label className={`radio-label ${paymentMethod === 'upi' ? 'active' : ''}`} style={{ display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="payment-method" 
                    value="upi" 
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  UPI (GPay / PhonePe / Paytm)
                </label>
                <label className={`radio-label ${paymentMethod === 'card' ? 'active' : ''}`} style={{ display: 'block', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="payment-method" 
                    value="card" 
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Credit / Debit Card
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-accent" style={{ padding: '1rem', fontSize: '1rem', marginTop: '1rem' }}>
              Pay Securely via Razorpay (₹{totalVal.toLocaleString('en-IN')})
            </button>

          </form>
        </div>

        {/* Dynamic Items Summary */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-card" style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Order Details</h3>
            
            <div id="checkout-items-list" style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="checkout-product-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <span className="checkout-product-title" style={{ fontWeight: 600 }}>{item.name}</span><br />
                    <span className="checkout-product-qty" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Size: {item.size} × {item.qty}</span>
                  </div>
                  <span className="checkout-product-price" style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountVal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                  <span>Discount:</span>
                  <span>-₹{discountVal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping:</span>
                <span>{shippingVal === 0 ? 'FREE' : `₹${shippingVal}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <span>Includes GST (18%):</span>
                <span>₹{taxVal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--accent-color)' }}>₹{totalVal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Razorpay simulation overlay */}
      {isProcessing && (
        <div className="modal-overlay active" style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" style={{ maxWidth: '400px', padding: '2.5rem', textAlign: 'center', borderRadius: '12px', backgroundColor: 'var(--bg-white)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '1rem', color: '#3399cc' }}>💳</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>Razorpay Secure Payment</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Processing secure payment capture...</p>
            <div className="review-bar" style={{ height: '6px', marginBottom: '1.5rem', backgroundColor: '#e2e8f0', borderRadius: '50px', overflow: 'hidden', position: 'relative' }}>
              <div 
                className="review-bar-fill" 
                style={{ 
                  width: `${processingProgress}%`, 
                  height: '100%', 
                  backgroundColor: '#3399cc', 
                  transition: 'width 0.4s ease' 
                }}
              ></div>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)' }}>{processingText}</div>
          </div>
        </div>
      )}

    </div>
  );
}
