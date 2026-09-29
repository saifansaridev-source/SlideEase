"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";

const ATTRS = [
  { key: "price",        label: "Price",          render: (p) => p.price ? `Rs. ${p.price.toLocaleString("en-IN")}` : "-" },
  { key: "originalPrice",label: "MRP",            render: (p) => p.originalPrice ? `Rs. ${p.originalPrice.toLocaleString("en-IN")}` : "-" },
  { key: "discount",     label: "Discount",       render: (p) => p.originalPrice > p.price ? Math.round(((p.originalPrice-p.price)/p.originalPrice)*100)+"% OFF" : "-" },
  { key: "rating",       label: "Rating",         render: (p) => p.rating ? `${p.rating} / 5 (${p.reviewCount||p.reviews||0} reviews)` : "-" },
  { key: "sizes",        label: "Available Sizes",render: (p) => Array.isArray(p.sizes) && p.sizes.length ? "UK "+p.sizes.join(", UK ") : "-" },
  { key: "material",     label: "Material",       render: (p) => p.material || "-" },
  { key: "category",     label: "Category",       render: (p) => p.category || "-" },
  { key: "type",         label: "Style",          render: (p) => p.type || "-" },
  { key: "color",        label: "Color",          render: (p) => p.color || "-" },
  { key: "comfort",      label: "Comfort Rating", render: (p) => p.comfort || "-" },
  { key: "tag",          label: "Tag",            render: (p) => p.tag || "-" },
];

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!compareIds.length) { setProducts([]); return; }
    setLoading(true);
    setError("");
    const ids = compareIds.join(",");
    fetch(`/api/products?ids=${ids}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const sorted = compareIds.map(id => data.data.find(p => String(p.id) === String(id) || String(p._id) === String(id))).filter(Boolean);
          setProducts(sorted);
        } else {
          setError("Failed to load product details.");
        }
      })
      .catch(() => setError("Network error loading products."))
      .finally(() => setLoading(false));
  }, [compareIds]);

  const slugify = (t) => t ? t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)+/g,"") : "";

  if (compareIds.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1.5rem", textAlign: "center" }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--border-color)" strokeWidth="1.5" style={{ marginBottom: "1.5rem" }}>
          <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
        </svg>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", color: "var(--primary-color)", marginBottom: "0.5rem" }}>Nothing to Compare</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Add products from the Shop to compare them side by side.</p>
        <Link href="/shop" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--bg-light)", minHeight: "90vh", paddingBottom: "5rem" }}>
      <section style={{ background: "linear-gradient(135deg, var(--primary-color), #2d4a40)", padding: "2.5rem 1.5rem", textAlign: "center", color: "#fff" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "var(--accent-color)", display: "block", marginBottom: "0.3rem" }}>Side-by-Side</span>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", margin: "0 0 0.3rem" }}>Product Comparison</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.88rem", margin: 0 }}>Comparing {compareIds.length} of 3 products</p>
      </section>

      <div className="container" style={{ maxWidth: "1100px", margin: "2.5rem auto", padding: "0 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <Link href="/shop" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Add more products
          </Link>
          <button onClick={clearCompare} className="btn btn-outline" style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem", color: "var(--danger-color)", borderColor: "var(--danger-color)" }}>
            Clear All
          </button>
        </div>

        {loading && <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Loading product details...</div>}
        {error && <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--danger-color)", background: "#fef2f2", borderRadius: "8px", marginBottom: "1.5rem" }}>{error}</div>}

        {!loading && products.length > 0 && (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "grid", gridTemplateColumns: `200px repeat(${products.length}, 1fr)`, minWidth: "560px", gap: 0, borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid var(--border-color)" }}>

              {/* Header row — product images */}
              <div style={{ background: "var(--primary-color)", padding: "1.25rem 1rem", display: "flex", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Attribute</span>
              </div>
              {products.map((p) => (
                <div key={p.id || p._id} style={{ background: "#fff", padding: "1.25rem 1rem", textAlign: "center", borderLeft: "1px solid var(--border-color)", position: "relative" }}>
                  <button onClick={() => removeFromCompare(p.id || String(p._id))} title="Remove" aria-label="Remove from compare"
                    style={{ position: "absolute", top: "8px", right: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1, padding: "2px" }}>
                    ×
                  </button>
                  <Link href={`/product/${p.slug || slugify(p.name) || p.id}`}>
                    <img src={p.image} alt={p.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.5rem" }} />
                  </Link>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--primary-color)", lineHeight: 1.3, marginBottom: "0.4rem" }}>
                    <Link href={`/product/${p.slug || slugify(p.name) || p.id}`} style={{ color: "inherit", textDecoration: "none" }}>{p.name}</Link>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--accent-dark)", fontSize: "1rem", marginBottom: "0.5rem" }}>Rs. {p.price?.toLocaleString("en-IN")}</div>
                  <button className="btn btn-primary" onClick={() => addToCart(p, p.sizes?.[0] ? `UK ${p.sizes[0]}` : "One Size")}
                    style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem", width: "100%", marginTop: "0.25rem" }}>
                    Add to Cart
                  </button>
                </div>
              ))}

              {/* Attribute rows */}
              {ATTRS.map((attr, i) => {
                const rowBg = i % 2 === 0 ? "#fafafa" : "#fff";
                return (
                  <React.Fragment key={attr.key}>
                    <div style={{ background: rowBg, padding: "0.85rem 1rem", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem", fontWeight: 700, color: "var(--primary-color)" }}>
                      {attr.label}
                    </div>
                    {products.map((p) => (
                      <div key={(p.id||p._id)+attr.key} style={{ background: rowBg, padding: "0.85rem 1rem", borderTop: "1px solid var(--border-color)", borderLeft: "1px solid var(--border-color)", fontSize: "0.85rem", color: "var(--text-dark)", textAlign: "center" }}>
                        {attr.render(p)}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}