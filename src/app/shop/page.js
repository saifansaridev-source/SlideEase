'use client';

import React, { useState, useEffect, useTransition, Suspense, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

/* ── JSON-LD Breadcrumb ───────────────────────────────────────────────────── */
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://your-domain.com' },
    { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://your-domain.com/shop' },
  ],
};

/* ── Shimmer skeleton card ────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="product-card">
      <div
        className="product-card-img-wrapper"
        style={{
          background: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          height: '260px',
        }}
      />
      <div className="product-card-details" style={{ display:'flex', flexDirection:'column', gap:'0.7rem', padding:'1rem' }}>
        {[60,85,50,100].map((w, i) => (
          <div key={i} style={{ height: i===1?'18px':'14px', width: w+'%', borderRadius:'4px', background:'#e8e8e8' }} />
        ))}
      </div>
    </div>
  );
}

/* ── ShopContent — all filter/sort/fetch logic ───────────────────────────── */
function ShopContent() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /* ── URL params (all 7 filter dimensions) ── */
  const category = searchParams.get('category') || 'all';
  const type     = searchParams.get('type')     || 'all';
  const price    = searchParams.get('price')    || 'all';
  const color    = searchParams.get('color')    || 'all';
  const material = searchParams.get('material') || 'all';
  const stock    = searchParams.get('stock')    || 'all';
  const sort     = searchParams.get('sort')     || 'default';
  const q        = searchParams.get('q')        || '';

  /* ── Fetch state ── */
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  /* ── Fetch /api/products; client-side post-filter for price/color/material/stock ── */
  const fetchProducts = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (category !== 'all') p.set('category', category);
    if (type     !== 'all') p.set('type',     type);
    if (sort !== 'default') p.set('sort',     sort);
    if (q)                  p.set('q',        q);

    fetch('/api/products?' + p.toString())
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          let data = json.data;
          if (price !== 'all') {
            data = data.filter(p => {
              if (price === 'under-1000') return p.price < 1000;
              if (price === '1000-1500') return p.price >= 1000 && p.price <= 1500;
              if (price === '1500-2000') return p.price >= 1500 && p.price <= 2000;
              if (price === 'above-2000') return p.price > 2000;
              return true;
            });
          }
          if (color !== 'all') {
            const normColor = color.toLowerCase().trim();
            data = data.filter(p => (p.color || '').toLowerCase().trim() === normColor);
          }
          if (material !== 'all') {
            const clean = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const targetMat = clean(material);
            data = data.filter(p => {
              const pMat = clean(p.material);
              return pMat.includes(targetMat) || targetMat.includes(pMat);
            });
          }
          if (stock === 'in-stock')  data = data.filter(p => (p.stock || 99) > 5);
          if (stock === 'low-stock') data = data.filter(p => (p.stock || 99) > 0 && (p.stock || 99) <= 5);
          setProducts(data);
          setIsFallback(!!json.isFallback);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, type, price, color, material, stock, sort, q]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  /* ── Helper: set one URL param, preserve others ── */
  const updateQuery = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all' && value !== 'default') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => router.push(pathname + '?' + params.toString()));
  };

  const heroTitles = {
    all:    'Artisanal Footwear Catalog',
    mens:   "Men's Footwear Collection",
    womens: "Women's Footwear Collection",
  };

  /* ── Filter / sort option definitions ── */
  const row1Filters = [
    { label: 'Gender:',  id: 'filter-category', val: category, key: 'category', opts: [['all','All Genders'],['mens',"Men's Footwear"],['womens',"Women's Footwear"]] },
    { label: 'Style:',   id: 'filter-type',     val: type,     key: 'type',     opts: [['all','All Styles'],['slides','Slides & Slip-Ons'],['sandals','Sandals & Flats'],['loafers','Premium Loafers']] },
    { label: 'Price:',   id: 'filter-price',    val: price,    key: 'price',    opts: [['all','All Prices'],['under-1000','Under ₹1000'],['1000-1500','₹1000–₹1500'],['1500-2000','₹1500–₹2000'],['above-2000','Above ₹2000']] },
    { label: 'Color:',   id: 'filter-color',    val: color,    key: 'color',    opts: [['all','All Colors'],['tan','Tan'],['black','Black'],['teal','Teal'],['red','Red'],['purple','Purple'],['gold','Gold'],['blue','Blue'],['pink','Pink'],['green','Green']] },
  ];
  const row2Filters = [
    { label: 'Material:', id: 'filter-material', val: material, key: 'material', opts: [['all','All Materials'],['vegan-leather','Vegan Leather'],['velvet','Velvet'],['jute','Jute'],['khadi','Khadi Cotton'],['ikat','Ikat Canvas']] },
    { label: 'Status:',   id: 'filter-stock',    val: stock,    key: 'stock',    opts: [['all','All Status'],['in-stock','In Stock'],['low-stock','Low Stock']] },
  ];

  return (
    <>
      {/* JSON-LD BreadcrumbList */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="page-hero" id="shop-hero-section" style={{ backgroundImage: "url('/og_image.png')" }}>
        <div className="page-hero-overlay" />
        <div className="page-hero-content">
          <span className="page-hero-tagline">Limited Weaves</span>
          <h1 className="page-hero-title">{heroTitles[category] || heroTitles.all}</h1>
          <p className="page-hero-desc">
            Browse our premium catalog of men&apos;s and women&apos;s slides, sandals, and loafers
            handcrafted using animal-free vegan leather and woven heritage weaves.
          </p>
        </div>
      </section>

      {/* ── CATEGORY TABS ───────────────────────────────────────────────── */}
      <section className="container" style={{ padding: '3rem 1.5rem 1rem' }} id="shop-tab-filters-section">
        <div className="shop-categories-tab">
          {[['all','All Products'],['mens',"Men's Footwear"],['womens',"Women's Footwear"]].map(([val, label]) => (
            <button
              key={val}
              id={`tab-${val}`}
              className={`category-tab-btn${category === val ? ' active' : ''}`}
              onClick={() => updateQuery('category', val)}
            >{label}</button>
          ))}
        </div>
      </section>

      {/* ── FILTER + SORT BAR ───────────────────────────────────────────── */}
      <section className="container" style={{ padding: '0 1.5rem 2rem' }} id="shop-controls-section">
        <div className="shop-filter-bar">

          {/* Row 1: Gender, Style, Price, Color */}
          <div className="filter-group">
            {row1Filters.map(({ label, id, val, key, opts }) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="filter-label">{label}</span>
                <select
                  id={id}
                  className="filter-select"
                  value={val}
                  aria-label={`Filter by ${key}`}
                  onChange={e => updateQuery(key, e.target.value)}
                >
                  {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Row 2: Material, Stock, Sort */}
          <div className="filter-group">
            {row2Filters.map(({ label, id, val, key, opts }) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="filter-label">{label}</span>
                <select
                  id={id}
                  className="filter-select"
                  value={val}
                  aria-label={`Filter by ${key}`}
                  onChange={e => updateQuery(key, e.target.value)}
                >
                  {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <span className="filter-label">Sort By:</span>
              <select
                id="sort-by"
                className="filter-select"
                value={sort}
                aria-label="Sort products"
                onChange={e => updateQuery('sort', e.target.value)}
              >
                <option value="default">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* ── PRODUCT GRID ────────────────────────────────────────────────── */}
      <section
        className="container"
        style={{ padding: '0 1.5rem 4rem', minHeight: '40vh' }}
        id="shop-products-grid-section"
      >
        {(loading || isPending) ? (
          <div className="product-grid shop-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600, fontSize: '1.2rem' }}>No products match your filters.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try clearing a filter or exploring other styles!</p>
          </div>
        ) : (
          <>
            {isFallback && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                ℹ️ Showing catalog preview — database connection unavailable.
              </p>
            )}
            <div className="product-grid shop-grid">
              {products.map(product => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── COUNT FOOTER ────────────────────────────────────────────────── */}
      {!loading && products.length > 0 && (
        <section
          className="container"
          style={{ padding: '0 1.5rem 4rem', textAlign: 'center' }}
          id="shop-pagination-section"
        >
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p>Showing {products.length} handcrafted footwear design{products.length !== 1 ? 's' : ''}.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '0.3rem' }}>Every pair is custom-crafted in limited quantities by our local weavers.</p>
          </div>
        </section>
      )}

      {/* ── STYLE LOOKBOOK ──────────────────────────────────────────────── */}
      <section className="materials-section section-padding" id="shop-style-guide-section">
        <div className="container">
          <h2 className="section-title">How To Style SlideEase</h2>
          <p className="section-subtitle">Our footwear is versatile, matching ethnic, formal, and casual styles alike.</p>
          <div className="materials-grid">
            {[
              { icon: '👔', title: 'Ethno-Formal Look',   desc: 'Pair our Maharaja Velvet Loafers or Royal Mandala slides with Nehru jackets, linen shirts, or premium cotton kurtas for wedding receptions or festivals.' },
              { icon: '👖', title: 'Smart-Casual Appeal', desc: 'Slip on the Peacock Ikat Loafers or Classic Tan Vegan slides with rolled-up chinos, polo shirts, or denim jeans for weekend get-togethers.' },
              { icon: '👗', title: 'Boho-Chic Elegance',  desc: 'Match our Jaipur Floral Mojris or Kashmiri Aari Slides with flowy maxi dresses, long skirts, or indigo-dyed kurtis for an artistic, daily look.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="material-card">
                <div className="material-icon-wrapper">{icon}</div>
                <h3 className="material-h3">{title}</h3>
                <p className="material-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTISANAL HERITAGE ──────────────────────────────────────────── */}
      <section className="brand-story-section section-padding" id="shop-heritage-section">
        <div className="container">
          <div className="brand-story-grid">
            <div className="brand-story-image">
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80"
                alt="Weaving and leather crafting details"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', aspectRatio: '1.25' }}
              />
            </div>
            <div className="brand-story-text">
              <span className="brand-story-sub">Sustainable Sourcing</span>
              <h2 className="brand-story-h2">Empowering Local Weaving Guilds</h2>
              <p className="brand-story-p">
                By purchasing a pair of SlideEase shoes, you become a patron of local Indian weavers.
                We partner directly with artisan clusters in Gujarat, Rajasthan, and Madhya Pradesh,
                paying fair wages and providing continuous employment. This allows us to source genuine
                handloom fabrics while helping sustain traditional weaving techniques passed down through generations.
              </p>
              <p className="brand-story-p">
                Every fabric piece has minor, unique weave textures, making your pair truly one-of-a-kind.
                Thank you for walking hand-in-hand with Startup India Business and local Indian artisans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* shimmer animation */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </>
  );
}

/* ── Page export ─────────────────────────────────────────────────────────── */
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', padding: '8rem 0', color: 'var(--text-muted)', fontWeight: 600, fontSize: '1.2rem' }}>
          Loading shop catalog…
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
