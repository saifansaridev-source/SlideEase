'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * SplitScreenIntro — Premium cinematic brand reveal for SlideEase.
 *
 * One master GSAP timeline drives every element simultaneously:
 *   Center light ignites
 *   → SlideEase brand rises
 *   → Panels + logo + light sweep all move TOGETHER
 *   → Homepage reveals underneath
 *   → Clean exit
 *
 * Plays on every full page reload. No sessionStorage gate.
 * Respects prefers-reduced-motion.
 */
export default function SplitScreenIntro() {
  const [done, setDone] = useState(false);

  // Panel refs
  const containerRef  = useRef(null);
  const leftRef       = useRef(null);
  const rightRef      = useRef(null);

  // Center brand refs
  const brandRef      = useRef(null);
  const logoRef       = useRef(null);
  const dividerRef    = useRef(null);
  const taglineRef    = useRef(null);

  // Light effect refs
  const centerGlowRef = useRef(null);
  const sweepRef      = useRef(null);

  useEffect(() => {
    // Bail out immediately if already done (shouldn't happen, but safety check)
    if (done) return;

    let gsapCtx;

    const run = async () => {
      const { gsap } = await import('gsap');

      // ── Reduced-motion: instant fade-away ─────────────────────────────────
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsapCtx = gsap.context(() => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.35,
            ease: 'power1.out',
            onComplete: () => setDone(true),
          });
        });
        return;
      }

      // ── Set initial states ─────────────────────────────────────────────────
      gsapCtx = gsap.context(() => {
        gsap.set(leftRef.current,       { x: '0%' });
        gsap.set(rightRef.current,      { x: '0%' });
        gsap.set(logoRef.current,       { opacity: 0, scale: 0.88, y: 14 });
        gsap.set(dividerRef.current,    { scaleX: 0, opacity: 0, transformOrigin: 'center center' });
        gsap.set(taglineRef.current,    { opacity: 0, y: 10 });
        gsap.set(centerGlowRef.current, { scaleX: 1, opacity: 0.35, transformOrigin: 'center center' });
        gsap.set(sweepRef.current,      { x: '-110%', opacity: 0 });
        gsap.set(brandRef.current,      { opacity: 1 });
        gsap.set(containerRef.current,  { opacity: 1 });

        // ── Master timeline ────────────────────────────────────────────────
        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          onComplete: () => setDone(true),
        });

        // ── PHASE 1: Center ignition (0s → ~0.75s) ────────────────────────
        // Center glow blooms
        tl.to(centerGlowRef.current, {
          scaleX: 2.8,
          opacity: 1,
          duration: 0.65,
          ease: 'power2.out',
        }, 0);

        // Logo rises in
        tl.to(logoRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, 0.08);

        // Divider line draws in
        tl.to(dividerRef.current, {
          scaleX: 1,
          opacity: 0.7,
          duration: 0.5,
          ease: 'power2.out',
        }, 0.18);

        // Tagline floats up
        tl.to(taglineRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
        }, 0.28);

        // ── PHASE 2: Synchronized split — ALL AT ONCE (starts at 0.5s) ────
        //    Panels, glow, sweep, and brand-exit are all on the same beat.

        const SPLIT = 0.5;   // timeline position where the big moment fires
        const SPLIT_DUR = 1.15; // duration of the panel sweep

        // LEFT panel exits left
        tl.to(leftRef.current, {
          x: '-100%',
          duration: SPLIT_DUR,
          ease: 'expo.inOut',
        }, SPLIT);

        // RIGHT panel exits right  — starts at identical position, same easing
        tl.to(rightRef.current, {
          x: '100%',
          duration: SPLIT_DUR,
          ease: 'expo.inOut',
        }, SPLIT);

        // Center glow expands outward and fades as panels peel away
        tl.to(centerGlowRef.current, {
          scaleX: 28,
          opacity: 0,
          duration: SPLIT_DUR * 0.85,
          ease: 'expo.out',
        }, SPLIT);

        // Light sweep races across the seam
        tl.to(sweepRef.current, {
          x: '110%',
          opacity: 0.55,
          duration: SPLIT_DUR * 0.75,
          ease: 'power2.inOut',
        }, SPLIT + 0.05);

        // Sweep fades at the end of its travel
        tl.to(sweepRef.current, {
          opacity: 0,
          duration: 0.25,
          ease: 'power1.out',
        }, SPLIT + SPLIT_DUR * 0.72);

        // Logo gently rises and fades out as the panels open
        tl.to(logoRef.current, {
          opacity: 0,
          y: -16,
          scale: 1.03,
          duration: 0.55,
          ease: 'power2.in',
        }, SPLIT + 0.18);

        // Tagline fades out
        tl.to(taglineRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.4,
          ease: 'power2.in',
        }, SPLIT + 0.12);

        // Divider fades out
        tl.to(dividerRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power1.out',
        }, SPLIT + 0.08);

        // ── PHASE 3: Container final fade-out ─────────────────────────────
        tl.to(containerRef.current, {
          opacity: 0,
          duration: 0.28,
          ease: 'power1.out',
        }, SPLIT + SPLIT_DUR - 0.1);
      });
    };

    run();

    return () => {
      if (gsapCtx) gsapCtx.revert();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        overflow: 'hidden',
        // Body scroll lock during intro
        pointerEvents: 'all',
      }}
    >
      {/* ── Left Panel ────────────────────────────────────────────────────── */}
      <div
        ref={leftRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '50%',
          background: '#080d14',
          willChange: 'transform',
          // Subtle inner edge gradient for depth
          boxShadow: 'inset -40px 0 80px rgba(184,151,62,0.04)',
        }}
      />

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      <div
        ref={rightRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: '50%',
          background: '#080d14',
          willChange: 'transform',
          boxShadow: 'inset 40px 0 80px rgba(184,151,62,0.04)',
        }}
      />

      {/* ── Center Glow Line ──────────────────────────────────────────────── */}
      <div
        ref={centerGlowRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: '3px',
          marginLeft: '-1.5px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(184,151,62,0.6) 20%, rgba(255,240,200,0.95) 50%, rgba(184,151,62,0.6) 80%, transparent 100%)',
          filter: 'blur(2px)',
          willChange: 'transform, opacity',
        }}
      />

      {/* ── Light Sweep ───────────────────────────────────────────────────── */}
      <div
        ref={sweepRef}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          width: '180px',
          marginLeft: '-90px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,248,220,0.25) 40%, rgba(255,252,235,0.55) 50%, rgba(255,248,220,0.25) 60%, transparent 100%)',
          filter: 'blur(8px)',
          willChange: 'transform, opacity',
          pointerEvents: 'none',
        }}
      />

      {/* ── Brand Center ──────────────────────────────────────────────────── */}
      <div
        ref={brandRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          pointerEvents: 'none',
          // Sits above both panels
          zIndex: 2,
        }}
      >
        {/* Logo */}
        <div
          ref={logoRef}
          style={{
            willChange: 'transform, opacity',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/assets/logo.png"
            alt="SlideEase"
            style={{
              height: 'clamp(36px, 6vw, 58px)',
              width: 'auto',
              display: 'block',
              // Invert to white + gold tint
              filter: 'brightness(0) invert(1) sepia(1) saturate(0.4) hue-rotate(5deg)',
              userSelect: 'none',
              draggable: false,
            }}
          />
        </div>

        {/* Divider line */}
        <div
          ref={dividerRef}
          style={{
            height: '1px',
            width: 'clamp(120px, 16vw, 200px)',
            marginTop: '1rem',
            marginBottom: '0.85rem',
            background: 'linear-gradient(90deg, transparent, rgba(184,151,62,0.9) 30%, rgba(255,240,190,1) 50%, rgba(184,151,62,0.9) 70%, transparent)',
            willChange: 'transform, opacity',
          }}
        />

        {/* Tagline */}
        <p
          ref={taglineRef}
          style={{
            margin: 0,
            fontSize: 'clamp(0.6rem, 1.5vw, 0.72rem)',
            fontWeight: 700,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#b8973e',
            fontFamily: 'var(--font-heading, Georgia, serif)',
            willChange: 'transform, opacity',
            whiteSpace: 'nowrap',
          }}
        >
          Ascend with Heritage
        </p>
      </div>
    </div>
  );
}
