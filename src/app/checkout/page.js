'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { cart, getSubtotal, discount, couponCode, clearCart } = useCart();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Billing form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [zip, setZip] = useState('');

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Admin-controlled shipping settings (loaded from DB via API)
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 999,
    shippingFlatRate: 79,
    expressDeliveryCharge: 149,
    codCharge: 49,
    freeShippingEnabled: true,
    expressEnabled: true,
    codEnabled: true,
  });

  // Gift wrap from session
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  useEffect(() => {
    const savedGiftWrap = sessionStorage.getItem('slidex_gift_wrap') === 'true';
    const savedGiftMsg = sessionStorage.getItem('slidex_gift_msg') || '';
    setGiftWrap(savedGiftWrap);
    setGiftMessage(savedGiftMsg);

    // Load admin-controlled shipping settings
    fetch('/api/shipping-settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setShippingSettings(prev => ({ ...prev, ...json.data }));
        }
      })
      .catch(() => { });

    // Pre-fill user profile if logged in
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setEmail(data.user.email || '');
          if (data.user.name) {
            const parts = data.user.name.split(' ');
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');
          }
          if (data.user.phone) setPhone(data.user.phone);
          if (data.user.address) setAddress(data.user.address);
        }
      })
      .catch(() => { });
  }, []);

  const FREE_SHIPPING_THRESHOLD = shippingSettings.freeShippingEnabled ? shippingSettings.freeShippingThreshold : Infinity;
  const subtotal = getSubtotal();
  const discountVal = Math.round(subtotal * discount);
  const giftWrapVal = giftWrap ? 49 : 0;
  const standardShippingVal = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : (shippingSettings.shippingFlatRate || 79);
  const shippingVal = shippingMethod === 'express' ? (shippingSettings.expressDeliveryCharge || 149) : standardShippingVal;
  const codAdditional = paymentMethod === 'cod' ? (shippingSettings.codCharge || 49) : 0;
  const totalVal = Math.max(0, subtotal - discountVal + giftWrapVal + shippingVal + codAdditional);

  const orderData = {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zip,
    items: cart.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      size: item.size,
      image: item.image || '',
    })),
    subtotal,
    discount: discountVal,
    couponCode: couponCode || null,
    giftWrap: giftWrapVal,
    giftWrapMessage: giftMessage,
    shipping: shippingVal,
    shippingMethod,
    codCharge: codAdditional,
    total: totalVal,
    paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay Online',
  };

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!firstName || !lastName || !email || !phone || !address || !city || !zip) {
      setErrorMsg('Please fill in all required shipping and contact details.');
      return;
    }

    setIsProcessing(true);

    // 1. CASH ON DELIVERY FLOW
    if (paymentMethod === 'cod') {
      try {
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderData,
            isCod: true,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          clearCart();
          sessionStorage.removeItem('slidex_gift_wrap');
          sessionStorage.removeItem('slidex_gift_msg');
          router.push(`/order-confirmation?orderId=${verifyData.orderId}`);
        } else {
          setErrorMsg(verifyData.error || 'Failed to place COD order.');
          setIsProcessing(false);
        }
      } catch (err) {
        setErrorMsg('Network error while placing order. Please try again.');
        setIsProcessing(false);
      }
      return;
    }

    // 2. RAZORPAY ONLINE PAYMENT FLOW
    try {
      const orderRes = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalVal,
        }),
      });

      const razorpayOrder = await orderRes.json();
      if (!razorpayOrder.success) {
        setErrorMsg(razorpayOrder.error || 'Failed to initialize payment gateway.');
        setIsProcessing(false);
        return;
      }

      if (typeof window === 'undefined' || !window.Razorpay) {
        setErrorMsg('Payment gateway script failed to load. Please refresh and retry.');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: razorpayOrder.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: 'SlideEase Footwear',
        description: 'Cruelty-Free Artisan Footwear Order',
        image: '/og_image.png',
        order_id: razorpayOrder.order.id,
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#1a2421',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData,
                isCod: false,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              sessionStorage.removeItem('slidex_gift_wrap');
              sessionStorage.removeItem('slidex_gift_msg');
              router.push(`/order-confirmation?orderId=${verifyData.orderId}`);
            } else {
              setErrorMsg(verifyData.error || 'Payment signature verification failed.');
              setIsProcessing(false);
            }
          } catch (verErr) {
            setErrorMsg('Payment recorded but verification network failed. Please contact support.');
            setIsProcessing(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (resp) {
        setErrorMsg(resp.error?.description || 'Payment was declined by bank or failed at gateway.');
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (err) {
      setErrorMsg('Error connecting to Razorpay. ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '90vh', paddingBottom: '5rem' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Page Hero & Step Tracker */}
      <section
        className="page-hero"
        style={{
          backgroundImage: "url('/og_image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '3.5rem 1.5rem',
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(26, 36, 33, 0.85)', zIndex: 1 }}></div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px', margin: '0 auto' }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-color)', display: 'block', marginBottom: '0.4rem' }}>
            Fast & Secure
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', margin: '0 0 0.5rem 0' }}>
            Checkout
          </h1>
          <p style={{ color: 'rgba(253, 251, 247, 0.8)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Complete your delivery details and choose your preferred payment method.
          </p>

          <div className="step-tracker" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div className="step-item completed">
              ✓
              <span className="step-label" style={{ color: 'rgba(253, 251, 247, 0.7)' }}>Cart</span>
            </div>
            <div className="step-item active">
              2
              <span className="step-label" style={{ color: '#ffffff' }}>Checkout</span>
            </div>
            <div className="step-item">
              3
              <span className="step-label" style={{ color: 'rgba(253, 251, 247, 0.6)' }}>Payment</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>

        {errorMsg && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '0.5rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            borderLeft: '5px solid #c62828',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            ✕ {errorMsg}
          </div>
        )}

        <div className="checkout-layout-grid">

          {/* LEFT: Delivery & Payment Details Form */}
          <form onSubmit={handleProcessOrder} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 1. Contact Information */}
            <div className="checkout-card">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>1.</span> Contact Information
              </h2>
              <div className="checkout-form-row-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>
                    Mobile Phone (+91) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="checkout-card">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>2.</span> Delivery Address
              </h2>

              <div className="checkout-form-row-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Samreen"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Ansari"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat No, Apartment, Street name"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                />
              </div>

              <div className="checkout-form-row-3">
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Other">Other State / UT</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="400001"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* 3. Shipping Method Selection */}
            <div className="checkout-card">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>3.</span> Shipping Option
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: `2px solid ${shippingMethod === 'standard' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: shippingMethod === 'standard' ? 'var(--accent-light)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Standard Artisan Shipping</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Delivery: 4–6 Business Days</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: standardShippingVal === 0 ? 'var(--success-color)' : 'var(--primary-color)' }}>
                    {standardShippingVal === 0 ? 'FREE' : '₹99'}
                  </span>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: `2px solid ${shippingMethod === 'express' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: shippingMethod === 'express' ? 'var(--accent-light)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Express Priority Air Courier ⚡</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Guaranteed Delivery: 1–2 Business Days</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>₹149</span>
                </label>
              </div>
            </div>

            {/* 4. Payment Selection */}
            <div className="checkout-card">
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--primary-color)', margin: '0 0 1.2rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span>4.</span> Payment Gateway
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                {/* Razorpay Online */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.2rem',
                  border: `2px solid ${paymentMethod === 'razorpay' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'razorpay' ? 'var(--accent-light)' : 'transparent'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-color)' }}>
                      Online Payment via Razorpay (Instant & Secured)
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0.6rem 0' }}>
                      UPI (Google Pay, PhonePe, Paytm), Debit & Credit Cards, NetBanking, and Wallets.
                    </p>
                    <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>
                      <span style={{ backgroundColor: '#fff', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid var(--border-color)' }}>UPI</span>
                      <span style={{ backgroundColor: '#fff', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid var(--border-color)' }}>Cards</span>
                      <span style={{ backgroundColor: '#fff', padding: '0.2rem 0.5rem', borderRadius: '3px', border: '1px solid var(--border-color)' }}>NetBanking</span>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.2rem',
                  border: `2px solid ${paymentMethod === 'cod' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'cod' ? 'var(--accent-light)' : 'transparent'
                }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-color)' }}>
                      Cash on Delivery (COD)
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                      Pay with cash or UPI QR code at your doorstep upon parcel receipt.
                    </p>
                  </div>
                </label>

              </div>

              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn btn-accent"
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.7 : 1
                  }}
                >
                  {isProcessing
                    ? 'Processing Order Securely...'
                    : paymentMethod === 'cod'
                      ? `Confirm COD Order (₹${totalVal.toLocaleString('en-IN')})`
                      : `Pay ₹${totalVal.toLocaleString('en-IN')} with Razorpay →`}
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                🔒 256-Bit SSL Encrypted Payment Gateway • 100% Buyer Protection
              </div>
            </div>

          </form>

          {/* RIGHT: Order Summary Card */}
          <div className="checkout-card checkout-summary-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0, color: 'var(--primary-color)' }}>
                Order Summary
              </h3>
              <Link href="/cart" style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                Edit Cart
              </Link>
            </div>

            {/* Cart Items Miniature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '280px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.3rem' }}>
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '4px', overflow: 'hidden', backgroundColor: item.bgColor || '#f9f9f9', flexShrink: 0 }}>
                      <img src={item.image || '/og_image.png'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--primary-color)', lineHeight: 1.2 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size {item.size} × {item.qty}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountVal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger-color)', fontWeight: 600 }}>
                  <span>Promo Discount ({couponCode || 'PROMO'})</span>
                  <span>-₹{discountVal.toLocaleString('en-IN')}</span>
                </div>
              )}

              {giftWrap && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Artisan Gift Wrap</span>
                  <span>₹49</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping ({shippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                <span style={{ fontWeight: 600, color: shippingVal === 0 ? 'var(--success-color)' : 'inherit' }}>
                  {shippingVal === 0 ? 'FREE' : `₹${shippingVal}`}
                </span>
              </div>

              {codAdditional > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>COD Handling Fee</span>
                  <span style={{ fontWeight: 600 }}>₹{codAdditional}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                <span>Total Due</span>
                <span style={{ color: 'var(--accent-color)' }}>₹{totalVal.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '-0.4rem' }}>
                {shippingSettings.taxIncludedInPrice
                  ? `(Incl. ₹${Math.round(totalVal * (shippingSettings.taxRate || 18) / (100 + (shippingSettings.taxRate || 18))).toLocaleString('en-IN')} GST: ${shippingSettings.cgstRate || 9}% CGST + ${shippingSettings.sgstRate || 9}% SGST)`
                  : `(Net + ${(shippingSettings.cgstRate || 9) + (shippingSettings.sgstRate || 9)}% GST)`
                }
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-light)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <div>📦 <strong>Free Returns:</strong> 7-day hassle-free doorstep returns & exchanges.</div>
              <div style={{ marginTop: '0.3rem' }}>🌱 <strong>Cruelty-Free Guarantee:</strong> 100% PETA-approved vegan materials.</div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
