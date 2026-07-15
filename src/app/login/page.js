'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

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

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setLoginSuccess('Logged in successfully! Redirecting...');
        const targetPath = data.user.role === 'admin' ? '/admin' : '/dashboard';
        setTimeout(() => {
          router.push(targetPath);
          router.refresh();
        }, 1500);
      } else {
        setLoginError(data.error || 'Login failed.');
      }
    } catch (err) {
      setLoginError('An error occurred. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setRegSuccess('Registered successfully! Auto logging in...');
        
        // Auto-login after registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: regEmail, password: regPassword }),
        });
        const loginData = await loginRes.json();
        
        if (loginData.success) {
          setTimeout(() => {
            router.push('/dashboard');
            router.refresh();
          }, 1500);
        } else {
          setActiveTab('login');
        }
      } else {
        setRegError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setRegError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem 6rem 1.5rem', maxWidth: '500px' }}>
      
      <div className="auth-tabs" style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '2.5rem' }}>
        <button 
          className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
          style={{ 
            flex: 1, 
            padding: '1rem', 
            border: 'none', 
            background: 'none', 
            fontFamily: 'var(--font-heading)', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            borderBottom: activeTab === 'login' ? '3px solid var(--accent-color)' : 'none',
            color: activeTab === 'login' ? 'var(--accent-color)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>
        <button 
          className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
          style={{ 
            flex: 1, 
            padding: '1rem', 
            border: 'none', 
            background: 'none', 
            fontFamily: 'var(--font-heading)', 
            fontWeight: 700, 
            fontSize: '1.1rem',
            borderBottom: activeTab === 'register' ? '3px solid var(--accent-color)' : 'none',
            color: activeTab === 'register' ? 'var(--accent-color)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </div>

      {activeTab === 'login' ? (
        <div className="auth-section-form active" id="form-login">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Please enter your credentials to log into your account.</p>
          
          {loginError && <div className="woocommerce-error" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--danger-light)', borderTopColor: 'var(--danger-color)' }}>{loginError}</div>}
          {loginSuccess && <div className="woocommerce-message" style={{ marginBottom: '1.5rem' }}>{loginSuccess}</div>}

          <form onSubmit={handleLoginSubmit} className="contact-form" style={{ gap: '1.2rem' }}>
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <input 
                type="email" 
                id="login-email" 
                required 
                className="form-input" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <input 
                type="password" 
                id="login-password" 
                required 
                className="form-input" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', width: '100%', marginTop: '1rem' }}>
              Sign In
            </button>
          </form>
        </div>
      ) : (
        <div className="auth-section-form active" id="form-register">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>Register today to earn 100 reward points and enjoy faster checkouts.</p>

          {regError && <div className="woocommerce-error" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--danger-light)', borderTopColor: 'var(--danger-color)' }}>{regError}</div>}
          {regSuccess && <div className="woocommerce-message" style={{ marginBottom: '1.5rem' }}>{regSuccess}</div>}

          <form onSubmit={handleRegisterSubmit} className="contact-form" style={{ gap: '1.2rem' }}>
            <div className="form-group">
              <label htmlFor="reg-name" className="form-label">Full Name</label>
              <input 
                type="text" 
                id="reg-name" 
                required 
                className="form-input" 
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email Address</label>
              <input 
                type="email" 
                id="reg-email" 
                required 
                className="form-input" 
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="reg-password" className="form-label">Password</label>
              <input 
                type="password" 
                id="reg-password" 
                required 
                className="form-input" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              {regPassword && (
                <>
                  <div className="password-strength" style={{ height: '5px', backgroundColor: '#e2e8f0', borderRadius: '50px', overflow: 'hidden', marginTop: '0.5rem' }}>
                    <div 
                      className="password-strength-fill" 
                      style={{ 
                        width: `${(pwdScore / 5) * 100}%`, 
                        height: '100%', 
                        backgroundColor: pwdColor,
                        transition: 'width 0.3s ease' 
                      }}
                    ></div>
                  </div>
                  <div className="password-strength-text" style={{ fontSize: '0.75rem', fontWeight: 700, color: pwdColor, marginTop: '0.2rem', textAlign: 'right' }}>
                    {pwdLabel}
                  </div>
                </>
              )}
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', width: '100%', marginTop: '1rem' }}>
              Register Account
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
