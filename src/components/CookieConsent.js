'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('slidex_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('slidex_cookie_consent', JSON.stringify({ necessary: true, analytics: true, marketing: true, date: new Date().toISOString() }));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('slidex_cookie_consent', JSON.stringify({ necessary: true, analytics, marketing, date: new Date().toISOString() }));
    setShowPreferences(false);
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('slidex_cookie_consent', JSON.stringify({ necessary: true, analytics: false, marketing: false, date: new Date().toISOString() }));
    setShowBanner(false);
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div 
          className="cookie-consent-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--primary-dark)',
            color: '#fff',
            padding: '16px 24px',
            zIndex: 9999,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
            borderTop: '1px solid rgba(201, 169, 97, 0.35)',
            animation: 'fadeUpDrift 0.35s ease'
          }}
        >
          <div className="cookie-consent-inner" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '280px', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              🍪 We use cookies to enhance your browsing experience, deliver tailored artisanal recommendations, and analyze site traffic. Read our <Link href="/cookie" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>Cookie Policy</Link>.
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setShowPreferences(true)} 
                className="btn btn-outline" 
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Preferences
              </button>
              <button 
                onClick={handleDecline} 
                className="btn btn-outline" 
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Decline Non-Essential
              </button>
              <button 
                onClick={handleAcceptAll} 
                className="btn btn-accent" 
                style={{ padding: '6px 18px', fontSize: '0.8rem' }}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="modal-overlay show" style={{ zIndex: 10001 }} onClick={() => setShowPreferences(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cookie Preferences</h3>
              <button className="modal-close" onClick={() => setShowPreferences(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Control which cookies you allow us to set on your device. Essential cookies cannot be disabled as they are needed for cart and security features.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-light)', borderRadius: '6px' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-color)' }}>Strictly Necessary</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cart, login authentication, checkout security.</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-dark)' }}>Always Active</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-light)', borderRadius: '6px' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-color)' }}>Analytics & Performance</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Page speed metrics, anonymous browsing trends.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={analytics} 
                    onChange={(e) => setAnalytics(e.target.checked)} 
                    style={{ accentColor: 'var(--accent-color)', width: '18px', height: '18px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-light)', borderRadius: '6px' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-color)' }}>Marketing & Social</h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tailored campaign promotions and style suggestions.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={marketing} 
                    onChange={(e) => setMarketing(e.target.checked)} 
                    style={{ accentColor: 'var(--accent-color)', width: '18px', height: '18px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowPreferences(false)}>Cancel</button>
                <button className="btn btn-accent" onClick={handleSavePreferences}>Save Preferences</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
