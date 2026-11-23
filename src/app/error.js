'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('SlideEase Application Error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      backgroundColor: '#fafafa',
      fontFamily: 'var(--font-primary, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        border: '1px solid #f0f0f0',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#fef3c7',
          color: '#d97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '1.75rem',
        }}>
          👟
        </div>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#18181b',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em',
        }}>
          Something went wrong
        </h2>

        <p style={{
          fontSize: '0.95rem',
          color: '#71717a',
          lineHeight: 1.6,
          marginBottom: '1.75rem',
        }}>
          We encountered an unexpected issue while loading this page. Our team has been notified, and you can reload or continue exploring our footwear collection.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: '8px',
              backgroundColor: '#18181b',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Try Again
          </button>

          <Link
            href="/shop"
            style={{
              padding: '0.85rem 1.75rem',
              borderRadius: '8px',
              backgroundColor: '#f4f4f5',
              color: '#27272a',
              fontWeight: 600,
              fontSize: '0.95rem',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease',
            }}
          >
            Browse All Footwear
          </Link>
        </div>
      </div>
    </div>
  );
}
