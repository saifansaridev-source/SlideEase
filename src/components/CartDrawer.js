'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, updateQty, removeFromCart, getSubtotal, isCartOpen, setIsCartOpen } = useCart();

  return (
    <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} id="sidebar-cart-drawer">
      <div className="cart-drawer-header">
        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Shopping Cart</h3>
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

      <div className="cart-drawer-items">
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <svg style={{ width: '50px', height: '50px', stroke: 'currentColor', fill: 'none', margin: '0 auto 1rem auto', opacity: 0.5 }} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p style={{ fontWeight: 600 }}>Your cart is empty</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Fill it with our premium handcrafted vegan shoes!</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={`${item.id}-${item.size}`} className="drawer-cart-item">
              <div className="drawer-cart-item-img" style={{ backgroundColor: item.bgColor || '#f9f9f9', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div className="drawer-cart-item-details">
                <div className="drawer-cart-item-title">{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Size: {item.size}</div>
                <div className="drawer-cart-item-price">₹{item.price}</div>
                <div className="drawer-cart-item-qty">
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.size, -1)}>-</button>
                  <span className="qty-val">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.size, 1)}>+</button>
                  <button 
                    className="cart-remove-btn" 
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => removeFromCart(item.id, item.size)}
                  >
                    <svg style={{ width: '16px', height: '16px', fill: 'currentColor' }} viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-drawer-footer">
        <div className="drawer-subtotal">
          <span>Subtotal:</span>
          <span id="drawer-subtotal-val">₹{getSubtotal().toLocaleString('en-IN')}</span>
        </div>
        <div className="drawer-cart-actions">
          <Link href="/cart" className="btn btn-outline" style={{ textAlign: 'center', width: '100%' }} onClick={() => setIsCartOpen(false)}>
            View Full Cart
          </Link>
          <Link href="/checkout" className="btn btn-accent" style={{ textAlign: 'center', width: '100%' }} onClick={() => setIsCartOpen(false)}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
