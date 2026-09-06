'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    errorParam === 'unauthorized' ? 'Access denied: Admin credentials required.' : ''
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Invalid administrator credentials.');
        setLoading(false);
        return;
      }

      if (data.user?.role !== 'admin') {
        setErrorMsg('Access denied. This account does not possess administrator role privileges.');
        setLoading(false);
        return;
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setErrorMsg('Network error. Failed to authenticate administrator.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '440px',
      margin: '4rem auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      padding: '2.5rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛡️</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', margin: '0 0 0.4rem 0', color: 'var(--primary-color)' }}>
          Admin Portal
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Sign in with your SlideEase administrator credentials
        </p>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '0.8rem 1rem',
          borderRadius: '4px',
          fontSize: '0.82rem',
          marginBottom: '1.5rem',
          fontWeight: 600,
          borderLeft: '4px solid #c62828'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>
            Admin Email Address
          </label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@slideease.com"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--primary-color)' }}>
            Password
          </label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.85rem',
            marginTop: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Authenticating...' : 'Sign In to Admin Panel →'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
        <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Return to SlideEase Storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>Loading admin portal...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
