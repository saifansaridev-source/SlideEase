'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'register' || tabParam === 'login') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Password strength states
  const [pwdScore, setPwdScore] = useState(0);
  const [pwdLabel, setPwdLabel] = useState('');
  const [pwdColor, setPwdColor] = useState('');

  // Handle password strength scoring
  useEffect(() => {
    if (!regPassword) {
      setPwdScore(0);
      setPwdLabel('');
      setPwdColor('');
      return;
    }
    
    let score = 0;
    if (regPassword.length >= 6) score++;
    if (regPassword.length >= 8) score++;
    if (/[A-Z]/.test(regPassword)) score++;
    if (/[0-9]/.test(regPassword)) score++;
    if (/[^A-Za-z0-9]/.test(regPassword)) score++;

    const levels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#15803d'];
    
    setPwdScore(score);
    setPwdLabel(levels[score]);
    setPwdColor(colors[score]);
  }, [regPassword]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setLoginSuccess('Authentication successful! Directing to your account...');
        const targetPath = redirectPath || (data.user?.role === 'admin' ? '/admin' : '/dashboard');
        setTimeout(() => {
          router.push(targetPath);
          router.refresh();
        }, 750);
      } else {
        setLoginError(data.error || 'Invalid email address or password.');
      }
    } catch (err) {
      setLoginError('A network error occurred. Please verify your connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword.length < 6) {
      setRegError('Password must contain at least 6 characters.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setRegSuccess('Account created successfully! Preparing your artisan suite...');
        
        // Auto-login after registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        });
        const loginData = await loginRes.json();
        
        if (loginData.success) {
          setTimeout(() => {
            router.push(redirectPath || '/dashboard');
            router.refresh();
          }, 1200);
        } else {
          setActiveTab('login');
        }
      } else {
        setRegError(data.error || 'Registration failed. This email may already exist.');
      }
    } catch (err) {
      setRegError('A network error occurred. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="auth-page-container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', background: 'radial-gradient(ellipse at top, #faf6ee 0%, #f4eee1 100%)' }}>
      
      <div className="auth-card" style={{ width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(201, 169, 97, 0.25)', boxShadow: '0 20px 45px -15px rgba(10, 22, 40, 0.08), 0 0 0 1px rgba(10, 22, 40, 0.03)', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        
        {/* Subtle Luxury Top Accent Bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #c9a961 0%, #a37f37 100%)' }}></div>

        {/* Brand Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
            <img src="/assets/logo.png" alt="SlideEase" style={{ height: '46px', width: 'auto', margin: '0 auto', display: 'block' }} />
          </Link>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: 700, margin: 0 }}>
            Artisan Footwear Member Suite
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <button 
            type="button"
            className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => { setActiveTab('login'); setLoginError(''); setLoginSuccess(''); }}
            style={{ 
              flex: 1, 
              padding: '0.65rem 1rem', 
              border: 'none', 
              borderRadius: '7px',
              background: activeTab === 'login' ? '#ffffff' : 'transparent', 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 700, 
              fontSize: '0.9rem',
              color: activeTab === 'login' ? 'var(--primary-color)' : '#64748b',
              boxShadow: activeTab === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setRegError(''); setRegSuccess(''); }}
            style={{ 
              flex: 1, 
              padding: '0.65rem 1rem', 
              border: 'none', 
              borderRadius: '7px',
              background: activeTab === 'register' ? '#ffffff' : 'transparent', 
              fontFamily: 'var(--font-heading)', 
              fontWeight: 700, 
              fontSize: '0.9rem',
              color: activeTab === 'register' ? 'var(--primary-color)' : '#64748b',
              boxShadow: activeTab === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* SIGN IN FORM */}
        {activeTab === 'login' && (
          <div className="auth-form-wrapper" id="form-login">
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--primary-color)', margin: '0 0 0.35rem 0' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>Access your orders, saved addresses, and concierge support.</p>
            </div>
            
            {loginError && (
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>{loginSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="login-email" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
                <input 
                  type="email" 
                  id="login-email" 
                  required 
                  placeholder="name@example.com"
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Password</label>
                  <Link href="/contact" style={{ fontSize: '0.75rem', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 500 }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showLoginPassword ? 'text' : 'password'} 
                    id="login-password" 
                    required 
                    placeholder="Enter your password"
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem 2.6rem 0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    {showLoginPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loginLoading}
                className="btn btn-primary" 
                style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
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

            {regError && (
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div style={{ padding: '0.85rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-name" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Full Name *</label>
                <input 
                  type="text" 
                  id="reg-name" 
                  required 
                  placeholder="e.g. Aarav Patel"
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-email" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Email Address *</label>
                <input 
                  type="email" 
                  id="reg-email" 
                  required 
                  placeholder="name@example.com"
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label htmlFor="reg-password" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Create Password *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showRegPassword ? 'text' : 'password'} 
                    id="reg-password" 
                    required 
                    placeholder="Min. 6 characters"
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem 2.6rem 0.75rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    {showRegPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.244 2.25"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></path></svg>
                    )}
                  </button>
                </div>
                {regPassword && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '50px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${(pwdScore / 5) * 100}%`, 
                          height: '100%', 
                          backgroundColor: pwdColor,
                          transition: 'width 0.3s ease' 
                        }}
                      ></div>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: pwdColor, marginTop: '0.25rem', textAlign: 'right' }}>
                      Strength: {pwdLabel}
                    </div>
                  </div>
                )}
              </div>

              <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.45, margin: '0.2rem 0' }}>
                By creating an account, you agree to SlideEase's <Link href="/terms" style={{ color: 'var(--accent-color)' }}>Terms</Link> and <Link href="/privacy" style={{ color: 'var(--accent-color)' }}>Privacy Policy</Link>.
              </p>

              <button 
                type="submit" 
                disabled={regLoading}
                className="btn btn-primary" 
                style={{ padding: '0.85rem', width: '100%', marginTop: '0.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {regLoading ? 'Registering...' : 'Create My Account →'}
              </button>
            </form>
          </div>
        )}

        {/* Card Footer Trust Badges */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-around', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            100% PETA Vegan
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            7-Day Returns
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Secure Checkout
          </span>
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
