import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_BLOGS } from '@/lib/blog-defaults';
import { isConnectionError } from '@/lib/dbFallback';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
    }

    const db = await getDb();
    const blog = await db.collection('blogs').findOne({ slug, status: 'published' });

    if (!blog) {
      // Check default fallback
      const fallback = DEFAULT_BLOGS.find(b => b.slug === slug && b.status === 'published');
      if (fallback) {
        return NextResponse.json({ success: true, data: fallback });
      }
      return NextResponse.json({ success: false, error: 'Blog article not found or not published' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    if (isConnectionError(error)) {
      const { slug } = await params;
      const fallback = DEFAULT_BLOGS.find(b => b.slug === slug && b.status === 'published');
      if (fallback) {
        return NextResponse.json({ success: true, data: fallback, isFallback: true });
      }
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
