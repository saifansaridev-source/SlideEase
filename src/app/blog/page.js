import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Blog & Fashion Guides | SlideEase Footwear',
  description: 'Read SlideEase Footwear blog. Get expert tips on vegan footwear care, latest summer styles, ethical fashion guides, and traditional heritage styling.',
};

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
      category: 'Footwear Care',
      date: 'July 5, 2026 • 5 min read',
      title: 'How to Care for Vegan Leather Shoes',
      desc: 'Unlike animal hide, high-grade synthetic vegan leather requires specific cleaning methods. Learn how to maintain the shine, prevent creases, and clean stains without damaging the texture.'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80',
      category: 'Latest Trends',
      date: 'June 28, 2026 • 4 min read',
      title: 'Top Footwear Trends for the Festive Season',
      desc: 'Traditional Indian weaves are making a huge comeback this season. Discover how to pair mirror-work juttis and velvet loafers with contemporary ethnic and fusion wear.'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80',
      category: 'Buying Guides',
      date: 'June 15, 2026 • 6 min read',
      title: 'Finding Your Perfect Cushion: Memory Foam vs Cork',
      desc: 'Confused between contoured cork soles and double-padded memory foam insoles? Our detailed ergonomic guide explains which base matches your walking posture and arches.'
    }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-hero {
          background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600&auto=format&fit=crop&q=80') center center;
          background-size: cover;
          color: var(--bg-white);
          text-align: center;
          padding: 6rem 1.5rem;
          border-bottom: 4px solid var(--accent-color);
        }
        .blog-hero h1 {
          font-family: var(--font-heading);
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }
        .blog-hero p {
          font-size: 1.1rem;
          color: rgba(253, 251, 247, 0.9);
          max-width: 600px;
          margin: 0 auto;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
          margin-top: 4rem;
          margin-bottom: 4rem;
        }
        @media screen and (max-width: 1024px) {
          .blog-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media screen and (max-width: 640px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
        }
        .blog-card {
          background-color: var(--bg-white);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: var(--transition-smooth);
        }
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }
        .blog-card-img-wrapper {
          position: relative;
          aspect-ratio: 1.6;
          overflow: hidden;
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
          background-color: var(--accent-color);
          color: var(--bg-white);
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .blog-card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .blog-date {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
        }
        .blog-card-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.8rem;
          line-height: 1.4;
        }
        .blog-card-desc {
          font-size: 0.88rem;
          color: var(--text-dark);
          line-height: 1.6;
          margin-bottom: 1.2rem;
          flex: 1;
        }
        .blog-read-more {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-color);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          transition: var(--transition-smooth);
        }
        .blog-read-more:hover {
          color: var(--primary-color);
        }
      ` }} />

      {/* Blog Hero Banner */}
      <section className="blog-hero">
        <h1>The SlideEase Journal</h1>
        <p>Your ultimate destination for premium footwear trends, sustainable fashion insights, and expert leather & fabric care guides.</p>
      </section>

      {/* Blog Main Section */}
      <main className="container section-padding">
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-card-img-wrapper">
                <img src={post.image} alt={post.title} />
                <span className="blog-category">{post.category}</span>
              </div>
              <div className="blog-card-content">
                <span className="blog-date">{post.date}</span>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-desc">{post.desc}</p>
                <Link href="/blog" className="blog-read-more">Read Full Guide →</Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
