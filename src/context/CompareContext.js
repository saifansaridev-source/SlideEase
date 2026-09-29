'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

const CompareContext = createContext(null);
const MAX_COMPARE = 3;

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState([]);

  const addToCompare = useCallback((productId) => {
    setCompareIds((prev) => {
      if (prev.includes(productId) || prev.length >= MAX_COMPARE) return prev;
      return [...prev, productId];
    });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setCompareIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleCompare = useCallback((productId) => {
    setCompareIds((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, productId];
    });
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);
  const isInCompare = useCallback((productId) => compareIds.includes(productId), [compareIds]);

  return (
    React.createElement(CompareContext.Provider,
      { value: { compareIds, addToCompare, removeFromCompare, toggleCompare, clearCompare, isInCompare, maxCompare: MAX_COMPARE } },
      children
    )
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}