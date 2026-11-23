import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      backgroundColor: '#fafafa',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '3rem 2rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        border: '1px solid #f0f0f0',
      }}>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          color: '#d97706',
          lineHeight: 1,
          marginBottom: '1rem',
          letterSpacing: '-0.04em',
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#18181b',
          marginBottom: '0.75rem',
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: '#71717a',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          The footwear product or page you are looking for may have been moved, updated, or does not exist.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#18181b',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Go Home
          </Link>
          <Link
            href="/shop"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#f4f4f5',
              color: '#18181b',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Explore Footwear Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
