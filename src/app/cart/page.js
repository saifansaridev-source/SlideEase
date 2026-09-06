'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { 
    cart, 
    updateQty, 
    removeFromCart, 
    clearCart, 
    getSubtotal, 
    discount, 
    applyCoupon, 
    couponCode,
    addToCart 
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponType, setCouponType] = useState(''); // 'success' | 'error'
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [addedAccessoryToast, setAddedAccessoryToast] = useState('');
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 999,
    shippingFlatRate: 79,
    freeShippingEnabled: true,
  });

  // Fetch dynamic shipping settings
  useEffect(() => {
    fetch('/api/shipping-settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setShippingSettings(d.data);
      })
      .catch(() => {});
  }, []);

  // Hydrate gift wrap state from sessionStorage if set previously
  useEffect(() => {
    const savedGiftWrap = sessionStorage.getItem('slidex_gift_wrap') === 'true';
    const savedGiftMsg = sessionStorage.getItem('slidex_gift_msg') || '';
    setGiftWrap(savedGiftWrap);
    setGiftMessage(savedGiftMsg);
  }, []);

  const handleGiftWrapChange = (e) => {
    const checked = e.target.checked;
    setGiftWrap(checked);
    sessionStorage.setItem('slidex_gift_wrap', String(checked));
  };

  const handleGiftMessageChange = (e) => {
    const msg = e.target.value;
    setGiftMessage(msg);
    sessionStorage.setItem('slidex_gift_msg', msg);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const result = await applyCoupon(couponInput);
    setCouponMsg(result.message);
    setCouponType(result.success ? 'success' : 'error');
  };

  const FREE_SHIPPING_THRESHOLD = shippingSettings.freeShippingEnabled
    ? (shippingSettings.freeShippingThreshold || 999)
    : Infinity;
  const subtotal = getSubtotal();
  const discountVal = Math.round(subtotal * discount);
  const giftWrapVal = giftWrap ? 49 : 0;
  const shippingVal = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : (shippingSettings.shippingFlatRate || 79);
  const totalVal = Math.max(0, subtotal - discountVal + giftWrapVal + shippingVal);
  const freeShippingDiff = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const accessories = [
    {
      id: 'acc-spray',
      name: 'Vegan Shoe Protector Spray',
      category: 'Care',
      desc: 'Waterproofing shield spray for cotton canvas and synthetic leather footwear.',
      price: 399,
      icon: '🚿',
      bgColor: '#f5f0eb'
    },
    {
      id: 'acc-socks',
      name: 'Anti-Odor Organic Socks',
      category: 'Accessories',
      desc: 'Pack of 3 super-soft bamboo fabric ankle socks designed for loafers.',
      price: 299,
      icon: '🧦',
      bgColor: '#eef5f2'
    },
    {
      id: 'acc-trees',
      name: 'Premium Cedar Shoe Trees',
      category: 'Care',
      desc: 'Maintains the shape and absorbs moisture when shoes are stored.',
      price: 499,
      icon: '🪵',
      bgColor: '#fbf4e8'
    }
  ];

  const handleAddAccessory = (acc) => {
    addToCart(
      {
        id: acc.id,
        name: acc.name,
        price: acc.price,
        image: '/og_image.png',
        bgColor: acc.bgColor,
        type: acc.category
      },
      'Standard',
      1
    );
    setAddedAccessoryToast(`Added ${acc.name} to your cart!`);
    setTimeout(() => setAddedAccessoryToast(''), 3000);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light)', minHeight: '80vh', paddingBottom: '4rem' }}>
      
      {/* Toast notification */}
      {addedAccessoryToast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--primary-color)',
          color: '#ffffff',
          padding: '0.8rem 1.4rem',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✓</span>
          <span>{addedAccessoryToast}</span>
        </div>
      )}

      {/* SECTION 3: CART HERO & STEP TRACKER */}
      <section 
        className="page-hero" 
        id="cart-hero-section" 
        style={{ 
          backgroundImage: "url('/og_image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          padding: '4rem 1.5rem',
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '2rem'
        }}
      >
        <div className="page-hero-overlay" style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(26, 36, 33, 0.82)',
          zIndex: 1
        }}></div>

        <div className="page-hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '700px', margin: '0 auto' }}>
          <span className="page-hero-tagline" style={{
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-color)',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Your Basket
          </span>
          <h1 className="page-hero-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', margin: '0 0 0.8rem 0' }}>
            Shopping Cart
          </h1>
          <p className="page-hero-desc" style={{ color: 'rgba(253, 251, 247, 0.8)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            Review your selected handcrafted items before checkout.
          </p>

          <div className="step-tracker" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="step-item active">
              1
              <span className="step-label" style={{ color: '#ffffff' }}>Cart</span>
            </div>
            <div className="step-item">
              2
              <span className="step-label" style={{ color: 'rgba(253, 251, 247, 0.6)' }}>Checkout</span>
            </div>
            <div className="step-item">
              3
              <span className="step-label" style={{ color: 'rgba(253, 251, 247, 0.6)' }}>Payment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Free Shipping Meter Banner */}
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto 2rem auto', padding: '0 1.5rem' }}>
        <div style={{
          backgroundColor: 'var(--bg-white)',
          borderRadius: 'var(--radius-md)',
          padding: '1.2rem 1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                <span style={{ color: 'var(--success-color)' }}>🎉 Congratulations! You have unlocked FREE Express Delivery!</span>
              ) : (
                <span>
                  Add <strong style={{ color: 'var(--accent-color)' }}>₹{freeShippingDiff}</strong> more to get <strong>FREE Express Shipping</strong>!
                </span>
              )}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Threshold: ₹999</span>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: '#e8ece9',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${freeShippingProgress}%`,
              height: '100%',
              backgroundColor: subtotal >= FREE_SHIPPING_THRESHOLD ? 'var(--success-color)' : 'var(--accent-color)',
              transition: 'width 0.4s ease'
            }}></div>
          </div>
        </div>
      </div>

      {/* Main Cart or Empty state */}
      {cart.length === 0 ? (
        <section className="container" id="cart-empty-section" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{
            backgroundColor: 'var(--bg-white)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '3.5rem 2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: '1rem 0 0.5rem 0', color: 'var(--primary-color)' }}>
              Your Cart is Empty
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              Looks like you haven't added any handcrafted vegan footwear to your cart yet. Discover our signature cruelty-free collections!
            </p>
            <Link href="/shop" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', display: 'inline-block' }}>
              Start Shopping
            </Link>
          </div>
        </section>
      ) : (
        <section className="container" id="cart-full-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2rem 1.5rem' }}>
          <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Column: Items Table + Gift Options + Coupons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* SECTION 5: Items Table */}
                <div className="cart-table-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem 1rem 0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0, color: 'var(--primary-color)' }}>
                      Cart Items ({cart.reduce((s, i) => s + i.qty, 0)})
                    </h2>
                    <button 
                      onClick={clearCart}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--text-muted)', 
                        fontSize: '0.8rem', 
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Clear Bag
                    </button>
                  </div>

                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th style={{ textAlign: 'center' }}>Quantity</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody id="cart-items-table-body">
                      {cart.map((item) => (
                        <tr key={`${item.id}-${item.size}`}>
                          <td>
                            <div className="cart-product">
                              <div 
                                className="cart-product-img" 
                                style={{ 
                                  backgroundColor: item.bgColor || 'var(--accent-light)',
                                  overflow: 'hidden',
                                  flexShrink: 0
                                }}
                              >
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                  />
                                ) : (
                                  <span>👞</span>
                                )}
                              </div>
                              <div>
                                <Link 
                                  href={`/product/${item.id}`} 
                                  className="cart-product-name"
                                  style={{ textDecoration: 'none', color: 'var(--primary-color)', display: 'block' }}
                                >
                                  {item.name}
                                </Link>
                                <div className="cart-product-size">
                                  Size: <strong style={{ color: 'var(--primary-color)' }}>{item.size}</strong>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')}</td>
                          <td>
                            <div className="cart-qty-wrapper" style={{ margin: '0 auto' }}>
                              <button 
                                className="qty-btn" 
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 0.3rem', color: 'var(--primary-color)' }}
                                onClick={() => updateQty(item.id, item.size, -1)}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.qty}</span>
                              <button 
                                className="qty-btn" 
                                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 0.3rem', color: 'var(--primary-color)' }}
                                onClick={() => updateQty(item.id, item.size, 1)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-color)' }}>
                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              className="cart-remove-btn" 
                              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                              onClick={() => removeFromCart(item.id, item.size)}
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ padding: '1rem 0.5rem 0.5rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/shop" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', textDecoration: 'underline', fontWeight: 600 }}>
                      ← Continue Shopping
                    </Link>
                  </div>
                </div>

                {/* SECTION 6: Gift Customization */}
                <div className="gift-options-section">
                  <label className="gift-checkbox-label">
                    <input 
                      type="checkbox" 
                      id="gift-wrap-checkbox" 
                      checked={giftWrap}
                      onChange={handleGiftWrapChange}
                    />
                    <div>
                      <span>Add Premium Artisan Gift Wrap (₹49)</span>
                      <p className="gift-desc">
                        Send this as an exquisite present! We wrap your order in reusable artisan handmade box paper, satin ribbon, and include a personalized handwritten message card.
                      </p>
                    </div>
                  </label>
                  {giftWrap && (
                    <textarea 
                      id="gift-message" 
                      className="gift-textarea" 
                      style={{ display: 'block' }}
                      placeholder="Type your gift message here... (Max 150 characters)"
                      maxLength={150}
                      value={giftMessage}
                      onChange={handleGiftMessageChange}
                    ></textarea>
                  )}
                </div>

                {/* SECTION 7: Coupon / Discount Input */}
                <div className="coupon-section">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem', color: 'var(--primary-color)', fontFamily: 'var(--font-heading)' }}>
                    Have a Promo Code or Voucher?
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                    Enter coupon codes below to receive promotional discounts on your cart total. Try code <strong style={{ color: 'var(--accent-color)' }}>SLIDEEASE10</strong> for 10% off!
                  </p>
                  <form onSubmit={handleApplyCoupon} className="coupon-form">
                    <input 
                      type="text" 
                      id="coupon-code-val" 
                      className="coupon-input" 
                      placeholder="Enter coupon (e.g. SLIDEEASE10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.6rem', fontSize: '0.85rem' }}>
                      Apply
                    </button>
                  </form>
                  {couponMsg && (
                    <div style={{ 
                      marginTop: '0.8rem', 
                      padding: '0.5rem 0.8rem', 
                      borderRadius: '4px',
                      fontSize: '0.82rem', 
                      fontWeight: 600,
                      backgroundColor: couponType === 'success' ? '#e8f5e9' : '#ffebee',
                      color: couponType === 'success' ? 'var(--success-color)' : 'var(--danger-color)'
                    }}>
                      {couponType === 'success' ? '✓ ' : '✕ '}
                      {couponMsg}
                    </div>
                  )}
                  {discount > 0 && couponCode && (
                    <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-light)', padding: '0.3rem 0.7rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                      <span>Applied: <strong>{couponCode}</strong> ({Math.round(discount * 100)}% OFF)</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: SECTION 8: Order Summary */}
              <div>
                <div className="cart-summary-card">
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    marginBottom: '1.5rem', 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '0.8rem', 
                    color: 'var(--primary-color)',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    Order Summary
                  </h3>
                  
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span id="summary-subtotal" style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discount > 0 && (
                    <div className="summary-row">
                      <span>Promo Discount ({couponCode || 'PROMO'})</span>
                      <span id="summary-discount" style={{ color: 'var(--danger-color)', fontWeight: 600 }}>
                        -₹{discountVal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {giftWrap && (
                    <div className="summary-row">
                      <span>Artisan Gift Wrap</span>
                      <span style={{ fontWeight: 600 }}>+₹49</span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Shipping Fees</span>
                    {shippingVal === 0 ? (
                      <span style={{ color: 'var(--success-color)', fontWeight: 700 }}>FREE</span>
                    ) : (
                      <span style={{ fontWeight: 600 }}>₹{shippingVal}</span>
                    )}
                  </div>

                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span id="summary-total" style={{ color: 'var(--accent-color)' }}>₹{totalVal.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <Link 
                      href="/checkout" 
                      className="btn btn-accent" 
                      style={{ width: '100%', textAlign: 'center', display: 'block', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
                    >
                      Proceed To Checkout →
                    </Link>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}>
                      🔒 256-Bit SSL Encrypted Razorpay Checkout
                    </p>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      ✓ 7-Day Hassle-Free Returns & Exchanges
                    </p>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                      🌱 100% PETA-Approved Vegan Footwear
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* SECTION 9: CROSS-SELL RECOMMENDED ACCESSORIES */}
      <section className="materials-section section-padding" id="cart-crosssell-section" style={{ backgroundColor: 'var(--bg-white)', marginTop: '3rem', borderTop: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.8rem', textAlign: 'center', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', marginBottom: '0.4rem' }}>
            Complete Your Look
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
            Add these artisan accessories and footwear care essentials to extend the life of your vegan shoes.
          </p>
          
          <div className="materials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {accessories.map((acc) => (
              <div 
                key={acc.id} 
                className="material-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  padding: '2rem 1.5rem',
                  backgroundColor: 'var(--bg-light)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{acc.icon}</div>
                <h3 className="material-h3" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {acc.name}
                </h3>
                <p className="material-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem', lineHeight: 1.5, flex: 1 }}>
                  {acc.desc}
                </p>
                <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '1.2rem', marginBottom: '1.2rem' }}>
                  ₹{acc.price}
                </div>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => handleAddAccessory(acc)} 
                  style={{ fontSize: '0.8rem', padding: '0.65rem 1.2rem', width: '100%' }}
                >
                  + Add Accessory
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
