import React from 'react';

export default function Loading() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '3px solid #f3f4f6',
        borderTopColor: 'var(--primary-color, #18181b)',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `
      }} />
      <span style={{
        marginTop: '1.25rem',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#71717a',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        Loading SlideEase...
      </span>
    </div>
  );
}
