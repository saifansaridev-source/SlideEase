'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PROMO_MESSAGES = [
  <>Complimentary Pan-India Express Delivery on Bespoke Orders • Code <strong>SLIDEEASE10</strong></>,
  <>100% Handcrafted Cruelty-Free Vegan Footwear • Made Proudly in India</>,
  <>Artisanal Motifs • 7-Day Hassle-Free Size Exchanges</>
];

export default function PromoBar() {
  const pathname = usePathname();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userState, setUserState] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setUserState(data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % PROMO_MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Calculate tier
  const points = userState?.points || 0;
  const tierName = points >= 1500 ? 'Master Guild VIP' : points >= 500 ? 'Connoisseur' : 'Apprentice';

  return (
    <div className="promo-bar" id="promo-bar-section">
      <div className="promo-bar-container">
        <span className="promo-heritage-tag">Ascend with Heritage</span>
        <span id="promo-text" style={{ transition: 'opacity 0.4s ease' }}>
          {PROMO_MESSAGES[currentIdx]}
        </span>
        {userState ? (
          <Link href="/dashboard" className="circle-header-pill" id="header-circle-pill" title="View Your SlideEase Circle Privileges">
            <span className="circle-dot"></span> Circle • <strong>{points} Pts</strong> ({tierName})
          </Link>
        ) : (
          <Link href="/login" className="circle-header-pill" id="header-circle-pill" title="Join SlideEase Circle">
            <span className="circle-dot"></span> SlideEase Circle • <strong>Join VIP Privileges</strong>
          </Link>
        )}
      </div>
    </div>
  );
}
