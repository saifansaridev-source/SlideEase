'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: '#fafafa',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{
          maxWidth: '480px',
          width: '90%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '2.5rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.4rem', color: '#18181b', marginBottom: '0.5rem' }}>
            System Notice
          </h2>
          <p style={{ color: '#71717a', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            An application error occurred. Click below to refresh your session.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              backgroundColor: '#18181b',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload SlideEase
          </button>
        </div>
      </body>
    </html>
  );
}
