'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PROMO_MESSAGES = [
  null, // placeholder, rendered below
  null,
  null,
];

const SESSION_KEY = 'se_promobar_dismissed';

export default function PromoBar() {
  const pathname = usePathname();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dismissed, setDismissed] = useState(true);
  const [msgVisible, setMsgVisible] = useState(true);
  const { user: userState } = useAuth();

  useEffect(() => {
    try {
      const wasDismissed = sessionStorage.getItem(SESSION_KEY) === '1';
      setDismissed(wasDismissed);
    } catch (_) {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % 3);
        setMsgVisible(true);
      }, 300);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (_) {}
    setDismissed(true);
  };

  if (pathname?.startsWith('/admin') || dismissed) return null;

  const messages = [
    <><strong>🚀 Grand Launch Sale!</strong> Use code <strong>SLIDEEASE10</strong> for 10% off your first pair + Free Shipping across India on orders above ₹999!</>,
    <>Hands-Free Step-In Technology &bull; Zero Bending Required &bull; Wide-Toe Anatomical Comfort</>,
    <>7-Day Hassle-Free Size Exchanges &bull; Pan-India Express Delivery</>,
  ];

  const points = userState?.points || 0;
  const tierName = points >= 1500 ? 'Master Guild VIP' : points >= 500 ? 'Connoisseur' : 'Apprentice';

  return (
    <div className="promo-bar" id="promo-bar-section">
      <div className="promo-bar-container">
        <span className="promo-heritage-tag">&#x2736; Grand Launch</span>
        <Link 
          href="/shop" 
          id="promo-text" 
          style={{ 
            transition: 'opacity 0.3s ease', 
            opacity: msgVisible ? 1 : 0,
            color: 'inherit',
            textDecoration: 'none',
            display: 'inline-block'
          }}
          title="Shop Slideease Collection"
        >
          {messages[currentIdx]}
        </Link>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {userState ? (
            <Link href="/dashboard" className="circle-header-pill" id="header-circle-pill" title="View Your SlideEase Circle Privileges">
              <span className="circle-dot"></span> Circle &bull; <strong>{points} Pts</strong> ({tierName})
            </Link>
          ) : (
            <Link href="/login" className="circle-header-pill" id="header-circle-pill" title="Join SlideEase Circle">
              <span className="circle-dot"></span> SlideEase Circle &bull; <strong>Join VIP Privileges</strong>
            </Link>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement banner"
            title="Dismiss announcement"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '2px 6px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: 1,
            }}
          >
            &#x2715;
          </button>
        </div>
      </div>
    </div>
  );
}
