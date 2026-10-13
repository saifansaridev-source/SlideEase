'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    // Listen for custom auth change events (e.g., after login, registration, or logout)
    const handleAuthChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener('auth:change', handleAuthChange);
    return () => {
      window.removeEventListener('auth:change', handleAuthChange);
    };
  }, [fetchCurrentUser]);

  const logout = useCallback(async (redirectUrl = '/login') => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
      window.dispatchEvent(new Event('auth:change'));
      if (redirectUrl) {
        router.push(redirectUrl);
        router.refresh();
      }
    }
  }, [router]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    await fetchCurrentUser();
    window.dispatchEvent(new Event('auth:change'));
  }, [fetchCurrentUser]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
