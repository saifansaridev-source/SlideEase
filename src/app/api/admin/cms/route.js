import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const PAGES = ['faq', 'about', 'blog', 'shipping-returns', 'privacy', 'terms', 'cookie'];

// GET: Fetch all CMS pages (or a single page by slug)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    const db = await getDb();

    if (slug) {
      const page = await db.collection('cms_pages').findOne({ slug });
      if (!page) {
        return NextResponse.json({ success: false, error: 'Page not found.' }, { status: 404 });
      }
      const { _id, ...rest } = page;
      return NextResponse.json({ success: true, data: rest });
    }

    const pages = await db.collection('cms_pages')
      .find({})
      .sort({ slug: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create or update (upsert) a CMS page by slug
export async function POST(request) {
  try {
    const { slug, title, content, metaTitle, metaDesc, published } = await request.json();

    if (!slug || !title || content === undefined) {
      return NextResponse.json(
        { success: false, error: 'slug, title and content are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    await db.collection('cms_pages').updateOne(
      { slug },
      {
        $set: {
          slug,
          title,
          content,
          metaTitle: metaTitle || title,
          metaDesc: metaDesc || '',
          published: published !== false,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: `CMS page "${slug}" saved.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a CMS page override by slug (restores to code-rendered page)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug parameter is required.' }, { status: 400 });
    }

    const db = await getDb();

    await db.collection('cms_pages').deleteOne({ slug });
    return NextResponse.json({ success: true, message: `CMS page "${slug}" reset to default.` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
