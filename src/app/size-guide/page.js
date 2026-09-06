import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Size Guide | SlideEase Footwear',
  description: 'Find your perfect fit with the SlideEase Footwear size guide. Detailed size charts for men, women, and kids — in UK, US, EU, and India sizes.',
};

export default function SizeGuidePage() {
  const mensSizes = [
    { india: '6', uk: '6', eu: '40', us: '7', cm: '25.0' },
    { india: '7', uk: '7', eu: '41', us: '8', cm: '25.7' },
    { india: '8', uk: '8', eu: '42', us: '9', cm: '26.3' },
    { india: '9', uk: '9', eu: '43', us: '10', cm: '27.0' },
    { india: '10', uk: '10', eu: '44', us: '11', cm: '27.6' },
    { india: '11', uk: '11', eu: '45', us: '12', cm: '28.3' },
    { india: '12', uk: '12', eu: '46', us: '13', cm: '29.0' },
  ];

  const womensSizes = [
    { india: '3', uk: '3', eu: '36', us: '5', cm: '22.0' },
    { india: '4', uk: '4', eu: '37', us: '6', cm: '22.7' },
    { india: '5', uk: '5', eu: '38', us: '7', cm: '23.3' },
    { india: '6', uk: '6', eu: '39', us: '8', cm: '24.0' },
    { india: '7', uk: '7', eu: '40', us: '9', cm: '24.7' },
    { india: '8', uk: '8', eu: '41', us: '10', cm: '25.3' },
    { india: '9', uk: '9', eu: '42', us: '11', cm: '26.0' },
  ];

  const kidsSizes = [
    { india: '1', uk: '1', eu: '33', us: '2', cm: '20.5', age: '5–6 yrs' },
    { india: '2', uk: '2', eu: '34', us: '3', cm: '21.0', age: '6–7 yrs' },
    { india: '3', uk: '3', eu: '35', us: '4', cm: '21.7', age: '7–8 yrs' },
    { india: '4', uk: '4', eu: '36', us: '5', cm: '22.3', age: '8–9 yrs' },
    { india: '5', uk: '5', eu: '37', us: '6', cm: '23.0', age: '9–10 yrs' },
    { india: '6', uk: '6', eu: '38', us: '7', cm: '23.7', age: '10–11 yrs' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .sg-hero {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark, #1a2a4a) 100%);
          color: var(--bg-white);
          text-align: center;
          padding: 5rem 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .sg-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(212,163,115,0.15) 0%, transparent 70%);
          border-radius: 50%;
        }
        .sg-hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: 0.03em;
          position: relative;
        }
        .sg-hero p {
          font-size: 1.1rem;
          color: rgba(253,251,247,0.85);
          max-width: 580px;
          margin: 0 auto 2rem;
          position: relative;
        }
        .sg-hero-badges {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
          position: relative;
        }
        .sg-badge {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 50px;
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: var(--bg-white);
          backdrop-filter: blur(4px);
        }

        /* Measure Banner */
        .measure-banner {
          background: var(--accent-color);
          color: var(--bg-white);
          padding: 1.2rem;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 600;
        }

        /* Tab Navigation */
        .sg-tabs {
          display: flex;
          gap: 0;
          border-bottom: 2px solid var(--border-color);
          background: var(--bg-white);
          position: sticky;
          top: 70px;
          z-index: 10;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .sg-tabs::-webkit-scrollbar { display: none; }
        .sg-tab-btn {
          padding: 1rem 2rem;
          border: none;
          background: none;
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          white-space: nowrap;
          transition: var(--transition-smooth);
        }
        .sg-tab-btn:hover { color: var(--primary-color); }
        .sg-tab-btn.active {
          color: var(--accent-color);
          border-bottom-color: var(--accent-color);
        }

        /* Section layout */
        .sg-section {
          padding: 4rem 0;
        }
        .sg-section-title {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }
        .sg-section-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 2.5rem;
        }

        /* Size Table */
        .sg-table-wrapper {
          overflow-x: auto;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          margin-bottom: 3rem;
          box-shadow: var(--shadow-sm);
        }
        .sg-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 480px;
        }
        .sg-table thead tr {
          background: var(--primary-color);
          color: var(--bg-white);
        }
        .sg-table thead th {
          padding: 1rem 1.2rem;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .sg-table tbody tr {
          border-bottom: 1px solid var(--border-color);
          transition: background 0.2s ease;
        }
        .sg-table tbody tr:last-child { border-bottom: none; }
        .sg-table tbody tr:hover { background: var(--bg-light); }
        .sg-table tbody td {
          padding: 0.9rem 1.2rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-dark);
        }
        .sg-table tbody td:first-child {
          font-weight: 700;
          color: var(--accent-color);
        }
        .sg-table tbody tr:nth-child(even) { background: rgba(0,0,0,0.02); }
        .sg-table tbody tr:nth-child(even):hover { background: var(--bg-light); }

        /* How to measure */
        .measure-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }
        @media (max-width: 900px) {
          .measure-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .measure-grid { grid-template-columns: 1fr; }
        }
        .measure-step {
          background: var(--bg-white);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 2rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
          transition: var(--transition-smooth);
        }
        .measure-step:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--accent-color);
        }
        .measure-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
        }
        .measure-step h3 {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.6rem;
        }
        .measure-step p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Fit Tips */
        .fit-tips-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .fit-tips-grid { grid-template-columns: 1fr; }
        }
        .fit-tip {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          background: var(--bg-light);
          border-radius: var(--radius-md);
          padding: 1.2rem;
        }
        .fit-tip-icon {
          font-size: 1.6rem;
          flex-shrink: 0;
        }
        .fit-tip h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.3rem;
        }
        .fit-tip p {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }

        /* CTA Banner */
        .sg-cta {
          background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark, #1a2a4a) 100%);
          color: var(--bg-white);
          border-radius: var(--radius-lg, 16px);
          padding: 3rem;
          text-align: center;
          margin-top: 4rem;
        }
        .sg-cta h2 {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.8rem;
        }
        .sg-cta p {
          color: rgba(253,251,247,0.85);
          margin-bottom: 2rem;
          font-size: 1rem;
        }
      ` }} />

      {/* Breadcrumb */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link href="/">Home</Link></li>
            <li className="breadcrumb-active">Size Guide</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="sg-hero">
        <h1>Size Guide</h1>
        <p>Find your perfect fit before you buy. Our detailed size charts cover Men, Women, and Kids across all international standards.</p>
        <div className="sg-hero-badges">
          <span className="sg-badge">🇬🇧 UK Sizes</span>
          <span className="sg-badge">🇺🇸 US Sizes</span>
          <span className="sg-badge">🇪🇺 EU Sizes</span>
          <span className="sg-badge">🇮🇳 India Sizes</span>
        </div>
      </section>

      {/* Measure Banner */}
      <div className="measure-banner">
        📏 Tip: For the most accurate fit, measure your feet in the evening as feet tend to swell slightly throughout the day.
      </div>

      {/* Main Content */}
      <main>
        {/* --- SECTION 1: Size Charts --- */}
        <section className="sg-section" style={{ backgroundColor: 'var(--bg-white)' }}>
          <div className="container">
            <h2 className="sg-section-title">Men's Size Chart</h2>
            <p className="sg-section-subtitle">All SlideEase men's footwear follows standard UK sizing. Compare below to find your exact size.</p>
            <div className="sg-table-wrapper">
              <table className="sg-table">
                <thead>
                  <tr>
                    <th>India</th>
                    <th>UK</th>
                    <th>EU</th>
                    <th>US</th>
                    <th>Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {mensSizes.map((s, i) => (
                    <tr key={i}>
                      <td>{s.india}</td>
                      <td>{s.uk}</td>
                      <td>{s.eu}</td>
                      <td>{s.us}</td>
                      <td>{s.cm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="sg-section-title">Women's Size Chart</h2>
            <p className="sg-section-subtitle">All SlideEase women's footwear follows standard UK sizing. Compare below to find your exact size.</p>
            <div className="sg-table-wrapper">
              <table className="sg-table">
                <thead>
                  <tr>
                    <th>India</th>
                    <th>UK</th>
                    <th>EU</th>
                    <th>US</th>
                    <th>Foot Length (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {womensSizes.map((s, i) => (
                    <tr key={i}>
                      <td>{s.india}</td>
                      <td>{s.uk}</td>
                      <td>{s.eu}</td>
                      <td>{s.us}</td>
                      <td>{s.cm} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="sg-section-title">Kids' Size Chart</h2>
            <p className="sg-section-subtitle">Kids' sizes are approximate — foot growth varies by child. Always measure before ordering.</p>
            <div className="sg-table-wrapper">
              <table className="sg-table">
                <thead>
                  <tr>
                    <th>India</th>
                    <th>UK</th>
                    <th>EU</th>
                    <th>US</th>
                    <th>Foot Length (cm)</th>
                    <th>Age (Approx)</th>
                  </tr>
                </thead>
                <tbody>
                  {kidsSizes.map((s, i) => (
                    <tr key={i}>
                      <td>{s.india}</td>
                      <td>{s.uk}</td>
                      <td>{s.eu}</td>
                      <td>{s.us}</td>
                      <td>{s.cm} cm</td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: How to Measure --- */}
        <section className="sg-section" style={{ backgroundColor: 'var(--bg-light)' }}>
          <div className="container">
            <h2 className="sg-section-title" style={{ textAlign: 'center' }}>How to Measure Your Foot</h2>
            <p className="sg-section-subtitle" style={{ textAlign: 'center' }}>Follow these 3 simple steps to get an accurate measurement at home.</p>
            <div className="measure-grid">
              <div className="measure-step">
                <span className="measure-icon">📄</span>
                <h3>Step 1 — Prepare</h3>
                <p>Place a blank sheet of A4 paper on a hard flat surface. Wear the socks you'd normally wear with your shoes for maximum accuracy.</p>
              </div>
              <div className="measure-step">
                <span className="measure-icon">🦶</span>
                <h3>Step 2 — Trace</h3>
                <p>Stand on the paper with your full weight. Hold a pencil vertically and trace the full outline of your foot, keeping the pen close to your foot at all times.</p>
              </div>
              <div className="measure-step">
                <span className="measure-icon">📏</span>
                <h3>Step 3 — Measure</h3>
                <p>Use a ruler to measure the longest distance from your heel to the tip of your longest toe (usually the big toe or second toe). Note this length in centimetres.</p>
              </div>
            </div>
            <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                <strong>Between sizes?</strong> Always size up. A slightly larger shoe will be more comfortable than one that's too tight. You can also use our insole padding for a snugger fit.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: Fit Tips --- */}
        <section className="sg-section" style={{ backgroundColor: 'var(--bg-white)' }}>
          <div className="container">
            <h2 className="sg-section-title">Fit Tips by Category</h2>
            <p className="sg-section-subtitle">Different footwear styles fit differently. Here's what to keep in mind.</p>
            <div className="fit-tips-grid">
              <div className="fit-tip">
                <span className="fit-tip-icon">👟</span>
                <div>
                  <h4>Sneakers &amp; Casual Shoes</h4>
                  <p>These typically run true to size. If you have wide feet, consider going half a size up for extra comfort, especially for closed-toe styles.</p>
                </div>
              </div>
              <div className="fit-tip">
                <span className="fit-tip-icon">🥿</span>
                <div>
                  <h4>Flats &amp; Juttis</h4>
                  <p>Traditional juttis can feel snug initially as they're made with firm material. They will loosen and mould to your foot shape within 2–3 wears.</p>
                </div>
              </div>
              <div className="fit-tip">
                <span className="fit-tip-icon">👡</span>
                <div>
                  <h4>Heels &amp; Wedges</h4>
                  <p>For heeled styles, size up by half if you're between sizes. Your foot slides forward slightly when elevated, needing a bit more room at the toe box.</p>
                </div>
              </div>
              <div className="fit-tip">
                <span className="fit-tip-icon">🩴</span>
                <div>
                  <h4>Sandals &amp; Slides</h4>
                  <p>Open-toe styles should have about 1cm of space behind your heel. The widest part of your foot should align with the widest part of the sandal footbed.</p>
                </div>
              </div>
              <div className="fit-tip">
                <span className="fit-tip-icon">🥾</span>
                <div>
                  <h4>Loafers &amp; Moccasins</h4>
                  <p>Loafers are generally true to size but may feel slightly snug initially if made of genuine or vegan leather. They will stretch to a comfortable fit after break-in.</p>
                </div>
              </div>
              <div className="fit-tip">
                <span className="fit-tip-icon">👶</span>
                <div>
                  <h4>Kids' Footwear</h4>
                  <p>Always leave 1–1.5cm of growing room at the front. Check your child's foot every 3–4 months as kids' feet grow quickly, especially between ages 5–11.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA --- */}
        <section style={{ padding: '0 0 5rem' }}>
          <div className="container">
            <div className="sg-cta">
              <h2>Still Not Sure About Your Size?</h2>
              <p>Our customer care team is happy to help you pick the right size before you place your order.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/contact" className="btn btn-accent" style={{ padding: '0.9rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
                  Contact Us
                </Link>
                <Link href="/shop" className="btn" style={{ padding: '0.9rem 2rem', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.4)', color: 'var(--bg-white)', backgroundColor: 'transparent', textDecoration: 'none', fontWeight: 700 }}>
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
