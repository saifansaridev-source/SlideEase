'use client';

import React from 'react';
import Link from 'next/link';

export default function ProductError({ error, reset }) {
  return (
    <div style={{
      minHeight: '65vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: '#fafafa',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
        padding: '2.5rem 2rem',
        border: '1px solid #f0f0f0',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👟</div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#18181b', marginBottom: '0.5rem' }}>
          Footwear Details Unavailable
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#71717a', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          We could not load the details for this footwear item. You can retry or explore our complete catalog.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#18181b',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Retry Loading
          </button>
          <Link
            href="/shop"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#f4f4f5',
              color: '#27272a',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            Browse Shoes
          </Link>
        </div>
      </div>
    </div>
  );
}
