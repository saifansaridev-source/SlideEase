'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { useAuth } from '@/context/AuthContext';

// ─── Google Sign-In Button (GIS) ─────────────────────────────────────────────
function GoogleSignInButton({ onSuccess, onError, label = 'Continue with Google', disabled = false }) {
  const btnContainerRef = useRef(null);
  const [gisReady, setGisReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const callbackRef = useRef(null);

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  // Keep a stable ref to callbacks so the GIS credential callback always has fresh closures
  callbackRef.current = { onSuccess, onError };

  const handleGoogleCallback = async (response) => {
    const { onSuccess: successCb, onError: errorCb } = callbackRef.current;
    if (!response?.credential) {
      errorCb('Google sign-in was cancelled or returned no credential. Please try again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });
      const data = await res.json();
      if (data.success) {
        successCb(data.user);
      } else {
        errorCb(data.error || 'Google sign-in failed. Please try again.');
      }
    } catch (err) {
      errorCb('Network error during Google sign-in. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const callbackFnRef = useRef(handleGoogleCallback);
  callbackFnRef.current = handleGoogleCallback;

  const renderGis = () => {
    if (!GOOGLE_CLIENT_ID || typeof window === 'undefined' || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => callbackFnRef.current(response),
        auto_select: false,
        cancel_on_tap_outside: true,
        // Do NOT use ux_mode: 'popup' — let GIS decide (avoids popup-blocked errors)
      });

      if (btnContainerRef.current) {
        btnContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(btnContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: label.toLowerCase().includes('sign up') ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          width: 380,
          logo_alignment: 'left',
        });
      }

      setGisReady(true);

      // NOTE: We intentionally do NOT call window.google.accounts.id.prompt() here.
      // One Tap is not needed when we have an explicit Sign-In button, and prompt()
      // causes [GSI_LOGGER] popup-blocked errors in browsers that block cross-origin popups.
    } catch (e) {
      console.warn('GIS init error:', e.message);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      renderGis();
    }
  }, [label, GOOGLE_CLIENT_ID]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderGis}
        onReady={renderGis}
      />
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '44px',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        {loading && (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
            Signing in with Google...
          </div>
        )}
        <div
          ref={btnContainerRef}
          style={{
            width: '100%',
            display: loading ? 'none' : 'flex',
            justifyContent: 'center',
          }}
        />
        {!gisReady && !loading && (
          <div
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #dadce0',
              backgroundColor: '#ffffff',
              color: '#3c4043',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              boxSizing: 'border-box',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Loading Google Sign-In...
          </div>
        )}
      </div>
    </>
  );
}

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user: currentAuthUser, refreshUser, loading: authLoading } = useAuth();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'register' || tabParam === 'login') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (!authLoading && currentAuthUser) {
      const dest = redirectPath || (currentAuthUser.role === 'admin' ? '/admin' : '/dashboard');
      router.replace(dest);
    }
  }, [currentAuthUser, authLoading, redirectPath, router]);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const [pwdScore, setPwdScore] = useState(0);
  const [pwdLabel, setPwdLabel] = useState('');
  const [pwdColor, setPwdColor] = useState('');

  useEffect(() => {
    if (!regPassword) { setPwdScore(0); setPwdLabel(''); setPwdColor(''); return; }
    let score = 0;
    if (regPassword.length >= 6) score++;
    if (regPassword.length >= 8) score++;
    if (/[A-Z]/.test(regPassword)) score++;
    if (/[0-9]/.test(regPassword)) score++;
    if (/[^A-Za-z0-9]/.test(regPassword)) score++;
    setPwdScore(score);
    setPwdLabel(['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score]);
    setPwdColor(['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#15803d'][score]);
  }, [regPassword]);

  const handleGoogleSuccess = async (user) => {
    if (activeTab === 'login') { setLoginSuccess('Google sign-in successful! Redirecting...'); setLoginError(''); }
    else { setRegSuccess('Google sign-in successful! Redirecting...'); setRegError(''); }
    try { await refreshUser(); } catch {}
    setTimeout(() => { router.push(redirectPath || (user?.role === 'admin' ? '/admin' : '/dashboard')); router.refresh(); }, 500);
  };
  const handleGoogleError = (msg) => {
    if (activeTab === 'login') setLoginError(msg);
    else setRegError(msg);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(''); setLoginSuccess(''); setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
      const data = await res.json();
      if (data.success) {
        setLoginSuccess('Authentication successful! Directing to your account...');
        try { await refreshUser(); } catch {}
        setTimeout(() => { router.push(redirectPath || (data.user?.role === 'admin' ? '/admin' : '/dashboard')); router.refresh(); }, 500);
      } else {
        setLoginError(data.error || 'Invalid email address or password.');
      }
    } catch { setLoginError('A network error occurred. Please verify your connection.'); }
    finally { setLoginLoading(false); }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(''); setRegSuccess('');
    if (regPassword.length < 6) { setRegError('Password must contain at least 6 characters.'); return; }
    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }) });
      const data = await res.json();
      if (data.success) {
        setRegSuccess('Account created! Preparing your artisan suite...');
        const loginRes = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: regEmail, password: regPassword }) });
        const loginData = await loginRes.json();
        if (loginData.success) {
          try { await refreshUser(); } catch {}
          setTimeout(() => { router.push(redirectPath || '/dashboard'); router.refresh(); }, 800);
        } else { setActiveTab('login'); }
      } else {
        setRegError(data.error || 'Registration failed. This email may already exist.');
      }
    } catch { setRegError('A network error occurred. Please try again.'); }
    finally { setRegLoading(false); }
  };

  if (!authLoading && currentAuthUser) {
    return (
      <div className="auth-page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', background: 'radial-gradient(ellipse at top, #faf6ee 0%, #f4eee1 100%)' }}>
        <div className="auth-card" style={{ width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(201, 169, 97, 0.25)', boxShadow: '0 20px 45px -15px rgba(10, 22, 40, 0.08)', padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>👋</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--primary-color)', margin: '0 0 0.5rem 0' }}>
            Already Signed In
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>
            You are logged in as <strong>{currentAuthUser.name}</strong> ({currentAuthUser.email}).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href={redirectPath || (currentAuthUser.role === 'admin' ? '/admin' : '/dashboard')} className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', textDecoration: 'none' }}>
              Go to Account Dashboard →
            </Link>
            <Link href="/" className="btn btn-outline" style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', textDecoration: 'none' }}>
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', background: 'radial-gradient(ellipse at top, #faf6ee 0%, #f4eee1 100%)' }}>
      <div className="auth-card" style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(201, 169, 97, 0.25)', boxShadow: '0 20px 45px -15px rgba(10, 22, 40, 0.08), 0 0 0 1px rgba(10, 22, 40, 0.03)', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #c9a961 0%, #a37f37 100%)' }}></div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <img src="/assets/logo.png" alt="SlideEase" style={{ height: '46px', width: 'auto', margin: '0 auto', display: 'block' }} />
          </Link>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: 700, margin: 0 }}>Artisan Footwear Member Suite</p>
        </div>

        <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          {['login', 'register'].map((tab) => (
            <button key={tab} type="button" onClick={() => { setActiveTab(tab); setLoginError(''); setLoginSuccess(''); setRegError(''); setRegSuccess(''); }}
              style={{ flex: 1, padding: '0.65rem 1rem', border: 'none', borderRadius: '7px', background: activeTab === tab ? '#ffffff' : 'transparent', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: activeTab === tab ? 'var(--primary-color)' : '#64748b', boxShadow: activeTab === tab ? '0 2px 6px rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* SIGN IN FORM */}
        {activeTab === 'login' && (
          <div className="auth-form-wrapper" id="form-login">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)', margin: '0 0 0.35rem 0' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Access your orders, saved addresses, and concierge support.</p>
            </div>
            {loginError && <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '1.25rem' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>{loginError}</span></div>}
            {loginSuccess && <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>{loginSuccess}</span></div>}

            <GoogleSignInButton label="Continue with Google" onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={loginLoading} />
            <OrDivider />

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="login-email" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
                <input type="email" id="login-email" required placeholder="name@example.com" className="form-control" style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Password</label>
                  <Link href="/contact" style={{ fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type={showLoginPassword ? 'text' : 'password'} id="login-password" required placeholder="Enter your password" className="form-control" style={{ width: '100%', padding: '0.75rem 2.6rem 0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} aria-label={showLoginPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                    {showLoginPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loginLoading} id="btn-login-submit" className="btn btn-primary" style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxSizing: 'border-box' }}>
                {loginLoading ? 'Authenticating...' : 'Sign In to SlideEase →'}
              </button>
            </form>
          </div>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <div className="auth-form-wrapper" id="form-register">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)', margin: '0 0 0.35rem 0' }}>Join SlideEase</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Create your profile to unlock member privileges &amp; order tracking.</p>
            </div>
            {regError && <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '1.25rem' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0, marginTop: '1px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>{regError}</span></div>}
            {regSuccess && <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>{regSuccess}</span></div>}

            <GoogleSignInButton label="Sign up with Google" onSuccess={handleGoogleSuccess} onError={handleGoogleError} disabled={regLoading} />
            <OrDivider />

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-name" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Full Name *</label>
                <input type="text" id="reg-name" required placeholder="e.g. Aarav Patel" className="form-control" style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} value={regName} onChange={(e) => setRegName(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-email" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Email Address *</label>
                <input type="email" id="reg-email" required placeholder="name@example.com" className="form-control" style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-password" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Create Password *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showRegPassword ? 'text' : 'password'} id="reg-password" required placeholder="Min. 6 characters" className="form-control" style={{ width: '100%', padding: '0.75rem 2.6rem 0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' }} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} aria-label={showRegPassword ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
                    {showRegPassword ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                  </button>
                </div>
                {regPassword && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '50px', overflow: 'hidden' }}>
                      <div style={{ width: `${(pwdScore / 5) * 100}%`, height: '100%', backgroundColor: pwdColor, transition: 'width 0.3s ease' }}></div>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: pwdColor, marginTop: '0.25rem', textAlign: 'right' }}>Strength: {pwdLabel}</div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.45, margin: '0.2rem 0' }}>
                By creating an account, you agree to SlideEase&apos;s <Link href="/terms" style={{ color: 'var(--accent-color)' }}>Terms</Link> and <Link href="/privacy" style={{ color: 'var(--accent-color)' }}>Privacy Policy</Link>.
              </p>
              <button type="submit" disabled={regLoading} id="btn-register-submit" className="btn btn-primary" style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxSizing: 'border-box' }}>
                {regLoading ? 'Registering...' : 'Create My Account →'}
              </button>
            </form>
          </div>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
          {['100% PETA Vegan', '7-Day Returns', 'Secure Checkout'].map((badge) => (
            <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              {badge}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>Loading account portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
