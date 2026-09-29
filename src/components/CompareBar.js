"use client";
import React from "react";
import Link from "next/link";
import { useCompare } from "@/context/CompareContext";

export default function CompareBar() {
  const { compareIds, clearCompare, maxCompare } = useCompare();
  if (compareIds.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 8000, background: "var(--primary-color)", color: "#fff",
        borderRadius: "999px", padding: "0.75rem 1.5rem",
        display: "flex", alignItems: "center", gap: "1rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        animation: "compareBarIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        whiteSpace: "nowrap", flexWrap: "wrap", justifyContent: "center",
      }}
    >
      <style>{`@keyframes compareBarIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5">
        <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
      </svg>
      <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
        {compareIds.length}/{maxCompare} products selected
      </span>
      <Link href="/compare" className="btn" style={{ background: "var(--accent-color)", color: "#fff", padding: "0.4rem 1rem", borderRadius: "999px", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none", border: "none" }}>
        Compare Now
      </Link>
      <button
        onClick={clearCompare}
        aria-label="Clear comparison"
        style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "26px", height: "26px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
      >
        ×
      </button>
    </div>
  );
}