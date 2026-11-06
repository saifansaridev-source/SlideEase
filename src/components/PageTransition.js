'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * PageTransition — Lightweight App Router page transition.
 * Uses a simple opacity fade that respects prefers-reduced-motion.
 * Does NOT block server-side rendering or streaming.
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [opacity, setOpacity] = useState(1);
  const prevPathname = useRef(pathname);

  // Skip animation if user prefers reduced motion
  const prefersReduced =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    if (prefersReduced) {
      setDisplayChildren(children);
      return;
    }

    // Fade out
    setOpacity(0);

    const fadeInTimer = setTimeout(() => {
      setDisplayChildren(children);
      setOpacity(1);
    }, 220); // matches transition duration below

    return () => clearTimeout(fadeInTimer);
  }, [pathname, children, prefersReduced]);

  return (
    <div
      style={{
        opacity,
        transition: 'opacity 220ms cubic-bezier(0.25,0.8,0.25,1)',
        minHeight: 'inherit',
      }}
    >
      {displayChildren}
    </div>
  );
}

