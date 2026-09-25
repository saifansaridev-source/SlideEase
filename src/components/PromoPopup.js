'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

function shouldShowPopup(popup) {
  const freq = popup.displayFrequency || 'once_per_session';
  const key = `promo_popup_${popup.id}`;
  const now = Date.now();

  if (freq === 'always') return true;

  if (freq === 'once_ever') {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem(key);
  }

  if (freq === 'once_per_day') {
    if (typeof window === 'undefined') return false;
    const last = Number(localStorage.getItem(key) || 0);
    return now - last > 86400000;
  }

  // Default: once_per_session
  if (typeof sessionStorage === 'undefined') return false;
  return !sessionStorage.getItem(key);
}

function markShown(popup) {
  const freq = popup.displayFrequency || 'once_per_session';
  const key = `promo_popup_${popup.id}`;
  if (typeof window === 'undefined') return;

  if (freq === 'once_ever') {
    localStorage.setItem(key, '1');
  } else if (freq === 'once_per_day') {
    localStorage.setItem(key, String(Date.now()));
  } else if (freq === 'once_per_session') {
    sessionStorage.setItem(key, '1');
  }
}

function matchesPage(popup) {
  const target = popup.targetPages || 'all';
  if (target === 'all') return true;
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  if (target === 'homepage') return path === '/';
  if (target === 'shop') return path.startsWith('/shop');
  if (target === 'product') return path.startsWith('/products') || path.startsWith('/product');
  return true;
}

export default function PromoPopup() {
  const [currentPopup, setCurrentPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    let cleanup = () => {};

    const init = async () => {
      try {
        const res = await fetch('/api/popups');
        const data = await res.json();
        if (!data.success || !data.popups?.length) return;

        // Pick the first eligible popup
        const eligible = data.popups.find(p => matchesPage(p) && shouldShowPopup(p));
        if (!eligible) return;

        const trigger = eligible.triggerType || 'delay';
        const delay = (eligible.delaySeconds || 5) * 1000;

        if (trigger === 'delay') {
          const t = setTimeout(() => {
            setCurrentPopup(eligible);
            setVisible(true);
            setAnimating(true);
            markShown(eligible);
          }, delay);
          cleanup = () => clearTimeout(t);

        } else if (trigger === 'exit_intent') {
          const handleMouseOut = (e) => {
            if (e.clientY <= 0) {
              setCurrentPopup(eligible);
              setVisible(true);
              setAnimating(true);
              markShown(eligible);
              document.removeEventListener('mouseout', handleMouseOut);
            }
          };
          document.addEventListener('mouseout', handleMouseOut);
          cleanup = () => document.removeEventListener('mouseout', handleMouseOut);

        } else if (trigger === 'scroll') {
          const threshold = (eligible.scrollPercent || 40) / 100;
          const handleScroll = () => {
            const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            if (scrolled >= threshold) {
              setCurrentPopup(eligible);
              setVisible(true);
              setAnimating(true);
              markShown(eligible);
              window.removeEventListener('scroll', handleScroll);
            }
          };
          window.addEventListener('scroll', handleScroll, { passive: true });
          cleanup = () => window.removeEventListener('scroll', handleScroll);
        }
      } catch (err) {
        // Silently fail — never break storefront
      }
    };

    init();
    return () => cleanup();
  }, []);

  const handleClose = () => {
    setAnimating(false);
    setTimeout(() => {
      setVisible(false);
      setCurrentPopup(null);
    }, 300);
  };

  if (!visible || !currentPopup) return null;

  const popup = currentPopup;
  const bg = popup.bgColor || '#0f1622';
  const accent = popup.accentColor || '#b8973e';
  const textColor = popup.textColor || '#ffffff';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(10,16,28,0.72)',
          backdropFilter: 'blur(4px)',
          transition: 'opacity 0.3s ease',
          opacity: animating ? 1 : 0,
        }}
      />

      {/* Popup Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-popup-heading"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: animating ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.9)',
          opacity: animating ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
          zIndex: 10001,
          width: '92%', maxWidth: '500px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          background: bg,
          color: textColor,
          fontFamily: 'var(--font-body, inherit)',
        }}
      >
        {/* Accent top strip */}
        <div style={{ height: '4px', background: accent }} />

        {/* Optional banner image */}
        {popup.image && (
          <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
            <img src={popup.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '1.8rem 2rem 2rem' }}>
          {popup.heading && (
            <h2 id="promo-popup-heading" style={{ margin: '0 0 0.3rem', fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-heading, inherit)', color: textColor, lineHeight: 1.3 }}>
              {popup.heading}
            </h2>
          )}
          {popup.subheading && (
            <p style={{ margin: '0 0 0.8rem', fontSize: '0.92rem', color: accent, fontWeight: 600 }}>{popup.subheading}</p>
          )}
          {popup.description && (
            <p style={{ margin: '0 0 1.2rem', fontSize: '0.87rem', opacity: 0.82, lineHeight: 1.7 }}>{popup.description}</p>
          )}

          {/* Coupon pill */}
          {popup.showCouponCode && popup.couponCode && (
            <div style={{ margin: '0 0 1.2rem', padding: '0.7rem 1.1rem', border: `1.5px dashed ${accent}`, borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Coupon Code</span>
              <span style={{ fontWeight: 800, letterSpacing: '0.1em', color: accent, fontSize: '1rem' }}>{popup.couponCode}</span>
            </div>
          )}

          {/* CTA Button */}
          {popup.ctaText && popup.ctaLink && (
            <Link
              href={popup.ctaLink}
              onClick={handleClose}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.85rem 1.5rem',
                background: accent,
                color: '#fff',
                fontWeight: 700,
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.95rem',
                letterSpacing: '0.03em',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {popup.ctaText}
            </Link>
          )}

          {/* Dismiss link */}
          <button
            type="button"
            onClick={handleClose}
            style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '0.85rem', background: 'none', border: 'none', color: `${textColor}70`, fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            No thanks, continue browsing
          </button>
        </div>

        {/* X Close Button */}
        {popup.showCloseBtn !== false && (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close popup"
            style={{
              position: 'absolute', top: '12px', right: '12px',
              width: '30px', height: '30px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none', borderRadius: '50%',
              color: textColor, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
              fontSize: '18px', lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
          >
            ×
          </button>
        )}
      </div>
    </>
  );
}
