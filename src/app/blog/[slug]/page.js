import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { DEFAULT_BLOGS } from '@/lib/blog-defaults';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Helper to fetch blog by slug
async function getBlogBySlug(slug) {
  try {
    const db = await getDb();
    const blog = await db.collection('blogs').findOne({ slug, status: 'published' });
    if (blog) return blog;
  } catch (err) {
    console.warn('DB lookup failed, using fallback:', err.message);
  }
  // Check default seed data
  return DEFAULT_BLOGS.find(b => b.slug === slug && b.status === 'published') || null;
}

// Generate dynamic SEO metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Article Not Found | SlideEase Footwear',
      description: 'The requested blog article could not be found.',
    };
  }

  return {
    title: `${blog.title} | SlideEase Journal`,
    description: blog.excerpt || 'Read this article on SlideEase conscious vegan footwear journal.',
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: [blog.coverImage || '/og_image.png'],
    }
  };
}

// Simple Markdown-to-HTML parser for editorial articles
function renderFormattedContent(content) {
  if (!content) return null;

  // Split into paragraphs / blocks
  const blocks = content.split(/\n\s*\n/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      return <hr key={idx} style={{ margin: '2.5rem 0', border: 'none', borderTop: '1px solid var(--border-color)' }} />;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.75rem', 
          fontWeight: 700, 
          color: 'var(--primary-color)', 
          marginTop: '2.5rem', 
          marginBottom: '1rem',
          lineHeight: 1.3
        }}>
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      );
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.35rem', 
          fontWeight: 700, 
          color: 'var(--primary-color)', 
          marginTop: '2rem', 
          marginBottom: '0.8rem',
          lineHeight: 1.35
        }}>
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      );
    }

    // Heading 4
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} style={{ 
          fontSize: '1.1rem', 
          fontWeight: 700, 
          color: 'var(--text-dark)', 
          marginTop: '1.5rem', 
          marginBottom: '0.6rem' 
        }}>
          {trimmed.replace(/^####\s+/, '')}
        </h4>
      );
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={idx} style={{
          borderLeft: '4px solid var(--accent-color)',
          margin: '2rem 0',
          padding: '1rem 1.5rem',
          backgroundColor: 'rgba(217, 119, 6, 0.05)',
          borderRadius: '0 8px 8px 0',
          fontStyle: 'italic',
          color: 'var(--primary-color)',
          fontSize: '1.1rem',
          lineHeight: 1.6
        }}>
          {trimmed.replace(/^>\s+/, '').replace(/^"(.*)"$/, '$1')}
        </blockquote>
      );
    }

    // Bulleted list
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));
      return (
        <ul key={idx} style={{ paddingLeft: '1.5rem', margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.map((item, itemIdx) => {
            const rawText = item.replace(/^[\*\-]\s+/, '');
            return (
              <li key={itemIdx} style={{ lineHeight: 1.7, color: 'var(--text-dark)' }}>
                {renderInlineFormatting(rawText)}
              </li>
            );
          })}
        </ul>
      );
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
      return (
        <ol key={idx} style={{ paddingLeft: '1.5rem', margin: '1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {items.map((item, itemIdx) => {
            const rawText = item.replace(/^\d+\.\s+/, '');
            return (
              <li key={itemIdx} style={{ lineHeight: 1.7, color: 'var(--text-dark)' }}>
                {renderInlineFormatting(rawText)}
              </li>
            );
          })}
        </ol>
      );
    }

    // Standard Paragraph
    return (
      <p key={idx} style={{ 
        lineHeight: 1.85, 
        fontSize: '1.05rem', 
        color: '#334155', 
        marginBottom: '1.5rem' 
      }}>
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });
}

// Inline formatting helper for **bold** and *italic*
function renderInlineFormatting(text) {
  // Simple regex replacement for bold and italic
  const parts = [];
  let remaining = text;
  let keyIndex = 0;

  // Process bold: **text**
  const boldRegex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={keyIndex++} style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const formattedDate = blog.createdAt 
    ? new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Recent';

  return (
    <>
      <Header />

      <main style={{ backgroundColor: '#fcfbf7', minHeight: '80vh', padding: '3rem 1.25rem 6rem' }}>
        <article className="container" style={{ maxWidth: '840px', margin: '0 auto' }}>
          
          {/* Back Navigation Breadcrumb */}
          <div style={{ marginBottom: '2rem' }}>
            <Link 
              href="/blog" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.88rem', 
                color: 'var(--accent-color)', 
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              ← Back to Fashion Guides &amp; Blog
            </Link>
          </div>

          {/* Article Header */}
          <header style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span style={{ 
                backgroundColor: 'rgba(11, 72, 93, 0.08)', 
                color: 'var(--primary-color)', 
                fontSize: '0.78rem', 
                fontWeight: 700, 
                padding: '0.3rem 0.8rem', 
                borderRadius: '50px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                {blog.category || 'Footwear'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {formattedDate}
              </span>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {blog.readTime || '5 min read'}
              </span>
            </div>

            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 'clamp(2rem, 4vw, 2.75rem)', 
              fontWeight: 800, 
              color: 'var(--primary-color)', 
              lineHeight: 1.25,
              margin: '0 0 1.25rem 0'
            }}>
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p style={{ 
                fontSize: '1.2rem', 
                lineHeight: 1.6, 
                color: '#475569', 
                margin: 0,
                fontFamily: 'inherit'
              }}>
                {blog.excerpt}
              </p>
            )}

            {/* Author Byline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary-color)', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                {(blog.author || 'SlideEase').charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {blog.author || 'SlideEase Editorial Team'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Conscious Luxury Footwear Artisans
                </div>
              </div>
            </div>
          </header>

          {/* Featured Cover Image */}
          {blog.coverImage && (
            <div style={{ 
              width: '100%', 
              maxHeight: '480px', 
              borderRadius: '14px', 
              overflow: 'hidden', 
              marginBottom: '3rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              backgroundColor: '#eae6dd'
            }}>
              <img 
                src={blog.coverImage} 
                alt={blog.title} 
                style={{ width: '100%', height: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          )}

          {/* Main Body Content */}
          <div className="blog-article-content" style={{ 
            backgroundColor: '#ffffff', 
            padding: '2.5rem 2rem', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
          }}>
            {renderFormattedContent(blog.content)}
          </div>

          {/* Bottom Storefront Promo Card */}
          <div style={{ 
            marginTop: '3.5rem', 
            padding: '2.5rem 2rem', 
            backgroundColor: 'var(--primary-color)', 
            borderRadius: '14px', 
            color: '#ffffff', 
            textAlign: 'center' 
          }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: 700 }}>
              Handcrafted in India
            </span>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', margin: '0.6rem 0 1rem 0' }}>
              Experience the SlideEase Artisan Difference
            </h3>
            <p style={{ maxWidth: '540px', margin: '0 auto 1.8rem auto', color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Every pair blends ergonomic contouring with genuine cruelty-free vegan materials and heritage embroidery.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/shop" className="btn btn-accent" style={{ padding: '0.8rem 1.8rem', fontSize: '0.95rem' }}>
                Explore Collection →
              </Link>
              <Link href="/blog" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', padding: '0.8rem 1.8rem', fontSize: '0.95rem' }}>
                More Guides
              </Link>
            </div>
          </div>

        </article>
      </main>

      <Footer />
    </>
  );
}
