'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, updateQty, removeFromCart, getSubtotal, isCartOpen, setIsCartOpen } = useCart();
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [secondsRemaining, setSecondsRemaining] = useState(899); // 14 mins 59 secs
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);

  // Load admin-controlled free shipping threshold
  useEffect(() => {
    fetch('/api/shipping-settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.freeShippingThreshold) {
          setFreeShippingThreshold(json.data.freeShippingThreshold);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isCartOpen) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 899));
    }, 1000);
    return () => clearInterval(timer);
  }, [isCartOpen]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const subtotal = getSubtotal();
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const diff = freeShippingThreshold - subtotal;

  return (
    <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} id="sidebar-cart-drawer">
      {/* Header */}
      <div className="cart-drawer-header">
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>
          Shopping Bag ({cart.reduce((total, item) => total + (item.qty || 1), 0)})
        </h3>
        <button 
          className="cart-drawer-close" 
          aria-label="Close cart drawer" 
          id="cart-drawer-close-btn" 
          style={{ fontSize: '1.6rem', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setIsCartOpen(false)}
        >
          &times;
        </button>
      </div>

      {/* Urgency countdown alert */}
      {cart.length > 0 && (
        <div style={{ background: 'var(--accent-light)', padding: '8px 16px', fontSize: '0.78rem', color: 'var(--accent-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderBottom: '1px solid var(--border-gold)' }}>
          <span>⏳</span> High demand: Items held in your bag for <strong>{formattedTime}</strong>
        </div>
      )}

      {/* Free Shipping Progress Meter */}
      {cart.length > 0 && (
        <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>
              {diff > 0 ? (
                <>Add <strong>₹{diff.toLocaleString('en-IN')}</strong> for <strong>Free Express Shipping</strong></>
              ) : (
                <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>🎉 You've unlocked Complimentary Express Delivery!</span>
              )}
            </span>
            <span style={{ fontWeight: 600 }}>{progressPercent}%</span>
          </div>
          <div style={{ height: '6px', width: '100%', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                background: diff > 0 ? 'var(--accent-color)' : 'var(--success-color)', 
                transition: 'width 0.4s ease' 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="cart-drawer-items">
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.7 }}>🛍️</div>
            <p style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--primary-color)' }}>Your bag is currently empty</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
              Explore our handcrafted vegan collections crafted with traditional Indian heritage weaves.
            </p>
            <Link 
              href="/shop" 
              className="btn btn-accent" 
              style={{ display: 'inline-block' }}
              onClick={() => setIsCartOpen(false)}
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          cart.map((item) => (
            <div key={`${item.id}-${item.size}`} className="drawer-cart-item">
              <div className="drawer-cart-item-img" style={{ backgroundColor: item.bgColor || '#f9f9f9', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={item.image || '/assets/slides.png'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="drawer-cart-item-details">
                <div className="drawer-cart-item-title" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 6px 0' }}>
                  Size: <strong>UK {item.size}</strong> {item.pattern ? `• ${item.pattern}` : ''}
                </div>
                <div className="drawer-cart-item-price" style={{ fontWeight: 700, color: 'var(--accent-dark)' }}>
                  ₹{(item.price * item.qty).toLocaleString('en-IN')}
                </div>
                <div className="drawer-cart-item-qty" style={{ marginTop: '6px' }}>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.size, -1)} aria-label="Decrease quantity">-</button>
                  <span className="qty-val">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.size, 1)} aria-label="Increase quantity">+</button>
                  <button 
                    className="cart-remove-btn" 
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    onClick={() => removeFromCart(item.id, item.size)}
                    aria-label="Remove item"
                  >
                    <svg style={{ width: '15px', height: '15px', fill: 'currentColor' }} viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer & Checkout Area */}
      {cart.length > 0 && (
        <div className="cart-drawer-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '16px', background: '#fff' }}>
          {/* Gift wrap toggle */}
          <div style={{ marginBottom: '12px', padding: '8px 10px', background: 'var(--bg-light)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
              <input 
                type="checkbox" 
                checked={giftWrap} 
                onChange={(e) => setGiftWrap(e.target.checked)}
                style={{ accentColor: 'var(--accent-color)', cursor: 'pointer' }}
              />
              <span>🎁 Add Luxury Gift Box Packaging (<strong>+₹49</strong>)</span>
            </label>
            {giftWrap && (
              <input 
                type="text" 
                placeholder="Include a personalized gift message..."
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                style={{ marginTop: '6px', width: '100%', padding: '6px 8px', fontSize: '0.78rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
              />
            )}
          </div>

          <div className="drawer-subtotal" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-color)' }}>
            <span>Subtotal:</span>
            <span id="drawer-subtotal-val">₹{(subtotal + (giftWrap ? 49 : 0)).toLocaleString('en-IN')}</span>
          </div>

          <div className="drawer-cart-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link 
              href="/checkout" 
              className="btn btn-accent" 
              style={{ textAlign: 'center', width: '100%', padding: '12px' }} 
              onClick={() => setIsCartOpen(false)}
            >
              Proceed to Checkout • ₹{(subtotal + (giftWrap ? 49 : 0)).toLocaleString('en-IN')}
            </Link>
            <Link 
              href="/cart" 
              className="btn btn-outline" 
              style={{ textAlign: 'center', width: '100%', padding: '10px' }} 
              onClick={() => setIsCartOpen(false)}
            >
              View Full Cart & Apply Coupons
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
