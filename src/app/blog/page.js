import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/mongodb';
import { DEFAULT_BLOGS } from '@/lib/blog-defaults';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Blog & Fashion Guides | SlideEase Footwear',
  description: 'Read SlideEase Footwear blog. Get expert tips on vegan footwear care, latest summer styles, ethical fashion guides, and traditional heritage styling.',
};

async function getPublishedBlogs() {
  try {
    const db = await getDb();
    const count = await db.collection('blogs').countDocuments();
    if (count === 0) {
      await db.collection('blogs').insertMany(DEFAULT_BLOGS);
    }
    const docs = await db.collection('blogs')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .toArray();
    if (docs && docs.length > 0) return docs;
  } catch (err) {
    console.warn('Could not fetch blogs from DB, using fallback:', err.message);
  }
  return DEFAULT_BLOGS.filter(b => b.status === 'published');
}

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return (
    <>
      <Header />

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-hero {
          background: linear-gradient(rgba(11, 72, 93, 0.75), rgba(7, 48, 62, 0.9)), url('https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80') center center;
          background-size: cover;
          color: var(--bg-white);
          text-align: center;
          padding: 6rem 1.5rem;
          border-bottom: 4px solid var(--accent-color);
        }
        .blog-hero h1 {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 5vw, 3.2rem);
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }
        .blog-hero p {
          font-size: 1.1rem;
          color: rgba(253, 251, 247, 0.9);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
          margin-top: 3.5rem;
          margin-bottom: 5rem;
        }
        @media (max-width: 1024px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }
        @media (max-width: 680px) {
          .blog-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        .blog-card {
          background: var(--bg-white);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
        }
        .blog-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
        .blog-card-img-wrapper {
          position: relative;
          height: 240px;
          overflow: hidden;
          background-color: #f1ede4;
        }
        .blog-card-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .blog-card:hover .blog-card-img-wrapper img {
          transform: scale(1.05);
        }
        .blog-category {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: var(--primary-color);
          color: var(--bg-white);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.35rem 0.85rem;
          border-radius: 50px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .blog-card-content {
          padding: 1.8rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .blog-date {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
        }
        .blog-card-title {
          font-family: var(--font-heading);
          font-size: 1.3rem;
          color: var(--primary-color);
          margin-bottom: 0.85rem;
          line-height: 1.35;
          font-weight: 700;
        }
        .blog-card-desc {
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-read-more {
          color: var(--accent-color);
          font-weight: 700;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          text-decoration: none;
          transition: gap 0.2s ease;
        }
        .blog-read-more:hover {
          gap: 0.7rem;
        }
      `}} />

      {/* Blog Hero Banner */}
      <section className="blog-hero">
        <div className="container">
          <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
            ✦ The SlideEase Journal
          </span>
          <h1>Fashion, Heritage &amp; Footwear Care</h1>
          <p>
            Explore artisan styling tips, sustainable material deep-dives, ergonomic buying guides, and behind-the-scenes stories from our workshop.
          </p>
        </div>
      </section>

      {/* Blog Main Section */}
      <main className="container" style={{ padding: '0 1.5rem' }}>
        {blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📖</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-color)' }}>No Articles Published Yet</h3>
            <p>Our editorial team is busy crafting new footwear stories and guides. Check back soon!</p>
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.map((post) => {
              const formattedDate = post.createdAt 
                ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent';

              return (
                <article key={post.slug || post.id} className="blog-card">
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="blog-card-img-wrapper">
                      <img src={post.coverImage || post.image || '/og_image.png'} alt={post.title} />
                      <span className="blog-category">{post.category || 'Footwear'}</span>
                    </div>
                  </Link>

                  <div className="blog-card-content">
                    <span className="blog-date">{formattedDate} • {post.readTime || '5 min read'}</span>
                    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h2 className="blog-card-title">{post.title}</h2>
                    </Link>
                    <p className="blog-card-desc">{post.excerpt || post.desc || ''}</p>
                    <Link href={`/blog/${post.slug}`} className="blog-read-more">
                      Read Full Guide →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
