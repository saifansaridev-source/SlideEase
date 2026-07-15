'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, getSubtotal, discount, applyCoupon, couponCode } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [couponType, setCouponType] = useState(''); // 'success' or 'error'
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput) return;

    const result = await applyCoupon(couponInput);
    setCouponMsg(result.message);
    setCouponType(result.success ? 'success' : 'error');
  };

  const subtotal = getSubtotal();
  const discountVal = Math.round(subtotal * discount);
  const giftWrapVal = giftWrap ? 49 : 0;
  const totalVal = subtotal - discountVal + giftWrapVal;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem', minHeight: '60vh' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '2rem' }}>Shopping Bag</h1>

      {cart.length === 0 ? (
        <div id="cart-empty-section" style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
          <svg style={{ width: '60px', height: '60px', stroke: 'var(--text-muted)', fill: 'none', margin: '0 auto 1.5rem auto', opacity: 0.5 }} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Your shopping bag is empty!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Add some premium vegan juttis, slides, or loafers to proceed.</p>
          <Link href="/shop" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div className="cart-layout-grid" id="cart-full-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          
          {/* Table Items */}
          <div className="cart-table-col" style={{ overflowX: 'auto' }}>
            <table className="cart-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '1rem' }}>Product</th>
                  <th style={{ paddingBottom: '1rem' }}>Price</th>
                  <th style={{ paddingBottom: '1rem' }}>Quantity</th>
                  <th style={{ paddingBottom: '1rem' }}>Total</th>
                  <th style={{ paddingBottom: '1rem' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={`${item.id}-${item.size}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1.5rem 0' }}>
                      <div className="cart-product" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="cart-product-img" style={{ width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', backgroundColor: item.bgColor || '#f9f9f9' }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div className="cart-product-name" style={{ fontWeight: 600 }}>{item.name}</div>
                          <div className="cart-product-size" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Size: {item.size}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 0', fontWeight: 600 }}>₹{item.price}</td>
                    <td style={{ padding: '1.5rem 0' }}>
                      <div className="cart-qty-wrapper" style={{ display: 'inline-flex', border: '1px solid var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <button className="qty-btn" style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => updateQty(item.id, item.size, -1)}>-</button>
                        <span className="qty-val" style={{ padding: '0.3rem 0.8rem', minWidth: '30px', textAlign: 'center', display: 'inline-block' }}>{item.qty}</span>
                        <button className="qty-btn" style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => updateQty(item.id, item.size, 1)}>+</button>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 0', fontWeight: 700, color: 'var(--accent-color)' }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '1.5rem 0' }}>
                      <button 
                        className="cart-remove-btn" 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Gift wrap */}
            <div className="gift-wrap-section" style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-light)', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  style={{ width: '18px', height: '18px' }} 
                />
                🎁 Add Premium Gift Wrapping (+₹49)
              </label>
              {giftWrap && (
                <textarea 
                  placeholder="Enter a sweet message here..." 
                  rows={3} 
                  className="form-input" 
                  style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                ></textarea>
              )}
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="cart-summary-col">
            <div className="checkout-summary-card" style={{ padding: '2rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Bag Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success-color)' }}>
                    <span>Coupon Discount (10%):</span>
                    <span>-₹{discountVal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {giftWrap && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gift Wrapping:</span>
                    <span>₹49</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '1.15rem', fontWeight: 700 }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--accent-color)' }}>₹{totalVal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Coupon inputs */}
              <form onSubmit={handleApplyCoupon} style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Coupon code..." 
                  className="newsletter-input" 
                  style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>Apply</button>
              </form>
              {couponMsg && (
                <p style={{ 
                  marginTop: '0.5rem', 
                  fontSize: '0.8rem', 
                  fontWeight: 600,
                  color: couponType === 'success' ? 'var(--success-color)' : 'var(--danger-color)'
                }}>
                  {couponMsg}
                </p>
              )}

              <Link href="/checkout" className="btn btn-accent" style={{ display: 'block', textAlign: 'center', marginTop: '2.5rem', padding: '1rem' }}>
                Proceed to Checkout
              </Link>
              
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                Free shipping applied on orders above ₹999.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
