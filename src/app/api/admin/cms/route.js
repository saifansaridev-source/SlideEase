import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_CMS_PAGES } from '@/lib/cms-defaults';
import { normalizePageSlug } from '@/lib/cms';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MANAGED_SLUGS = ['faq', 'about', 'shipping-returns', 'features', 'privacy', 'terms', 'cookie'];

function sanitizeHtml(html) {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
    .replace(/javascript\s*:/gi, '');
}

// GET: Fetch all CMS pages (or a single page by slug)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get('slug');

    const db = await getDb();

    if (rawSlug) {
      const slug = normalizePageSlug(rawSlug);
      const page = await db.collection('cms_pages').findOne({ slug });
      if (page) {
        const { _id, ...rest } = page;
        return NextResponse.json({ success: true, data: { ...rest, hasOverride: true } });
      }

      // Fallback to default page content
      const defaultPage = DEFAULT_CMS_PAGES[slug];
      if (defaultPage) {
        return NextResponse.json({ success: true, data: { ...defaultPage, hasOverride: false } });
      }

      return NextResponse.json({ success: false, error: 'Page not found.' }, { status: 404 });
    }

    const dbPages = await db.collection('cms_pages')
      .find({})
      .sort({ slug: 1 })
      .toArray();

    const dbPagesMap = new Map();
    dbPages.forEach(p => {
      const { _id, ...rest } = p;
      dbPagesMap.set(p.slug, { ...rest, hasOverride: true });
    });

    // Merge with defaults so all 7 pages always exist
    const mergedPages = MANAGED_SLUGS.map(slug => {
      if (dbPagesMap.has(slug)) {
        return dbPagesMap.get(slug);
      }
      return {
        ...(DEFAULT_CMS_PAGES[slug] || { slug, title: slug, content: '', published: true }),
        hasOverride: false,
      };
    });

    return NextResponse.json({ success: true, data: mergedPages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create or update (upsert) a CMS page by slug
export async function POST(request) {
  try {
    const { slug: rawSlug, title, content, metaTitle, metaDesc, published } = await request.json();

    if (!rawSlug || !title || content === undefined) {
      return NextResponse.json(
        { success: false, error: 'slug, title and content are required.' },
        { status: 400 }
      );
    }

    const slug = normalizePageSlug(rawSlug);
    const sanitizedContent = sanitizeHtml(content);

    const db = await getDb();

    await db.collection('cms_pages').updateOne(
      { slug },
      {
        $set: {
          slug,
          title: String(title).trim(),
          content: sanitizedContent,
          metaTitle: (metaTitle || title).trim(),
          metaDesc: (metaDesc || '').trim(),
          published: published !== false,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: `CMS page "${slug}" saved successfully.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a CMS page override by slug (restores to code-rendered page)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get('slug');

    if (!rawSlug) {
      return NextResponse.json({ success: false, error: 'slug parameter is required.' }, { status: 400 });
    }

    const slug = normalizePageSlug(rawSlug);
    const db = await getDb();

    await db.collection('cms_pages').deleteOne({ slug });
    return NextResponse.json({ success: true, message: `CMS page "${slug}" reset to default.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

