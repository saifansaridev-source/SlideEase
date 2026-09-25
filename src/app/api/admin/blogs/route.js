import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_BLOGS } from '@/lib/blog-defaults';
import { isConnectionError } from '@/lib/dbFallback';
import { ObjectId } from 'mongodb';

// Helper to slugify a title string
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

// Calculate approximate read time
function calculateReadTime(text) {
  if (!text) return '3 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// GET: Retrieve all blogs (both published and drafts for administrative view)
export async function GET() {
  try {
    const db = await getDb();
    const count = await db.collection('blogs').countDocuments();
    
    if (count === 0) {
      await db.collection('blogs').insertMany(DEFAULT_BLOGS);
    }
    
    const blogs = await db.collection('blogs').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock blogs fallback data.", error.message);
      return NextResponse.json({ success: true, data: DEFAULT_BLOGS, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new blog post
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, coverImage, category, excerpt, status, author, customSlug } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Blog title is required' }, { status: 400 });
    }
    
    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Blog content cannot be empty' }, { status: 400 });
    }

    const db = await getDb();
    
    // Generate base slug
    let baseSlug = customSlug ? slugify(customSlug) : slugify(title);
    if (!baseSlug) baseSlug = 'blog-' + Date.now();
    
    // Ensure slug is unique
    let finalSlug = baseSlug;
    let counter = 1;
    while (await db.collection('blogs').findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newId = 'blog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const readTime = calculateReadTime(content);

    const newBlog = {
      id: newId,
      title: title.trim(),
      slug: finalSlug,
      coverImage: coverImage?.trim() || '/og_image.png',
      category: category?.trim() || 'General',
      excerpt: excerpt?.trim() || title.trim(),
      content: content.trim(),
      author: author?.trim() || 'SlideEase Editorial Team',
      readTime,
      status: status === 'draft' ? 'draft' : 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('blogs').insertOne(newBlog);
    return NextResponse.json({ success: true, data: newBlog, message: 'Blog created successfully' });
  } catch (error) {
    console.error('Error creating blog:', error);
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing blog post
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, _id, title, content, coverImage, category, excerpt, status, author, customSlug } = body;
    const targetId = id || _id;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Blog ID is required for update' }, { status: 400 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Blog title is required' }, { status: 400 });
    }

    const db = await getDb();

    // Find the existing blog
    const query = ObjectId.isValid(targetId) 
      ? { $or: [{ _id: new ObjectId(targetId) }, { id: targetId }] }
      : { id: targetId };

    const existingBlog = await db.collection('blogs').findOne(query);
    if (!existingBlog) {
      return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
    }

    // Handle slug change if requested
    let finalSlug = existingBlog.slug;
    if (customSlug && slugify(customSlug) !== existingBlog.slug) {
      let candidateSlug = slugify(customSlug);
      let counter = 1;
      while (await db.collection('blogs').findOne({ slug: candidateSlug, _id: { $ne: existingBlog._id } })) {
        candidateSlug = `${slugify(customSlug)}-${counter}`;
        counter++;
      }
      finalSlug = candidateSlug;
    }

    const updateFields = {
      title: title.trim(),
      slug: finalSlug,
      coverImage: coverImage !== undefined ? coverImage.trim() : existingBlog.coverImage,
      category: category !== undefined ? category.trim() : existingBlog.category,
      excerpt: excerpt !== undefined ? excerpt.trim() : existingBlog.excerpt,
      content: content !== undefined ? content.trim() : existingBlog.content,
      author: author !== undefined ? author.trim() : existingBlog.author,
      readTime: content ? calculateReadTime(content) : existingBlog.readTime,
      status: status === 'draft' ? 'draft' : 'published',
      updatedAt: new Date().toISOString()
    };

    await db.collection('blogs').updateOne(
      { _id: existingBlog._id },
      { $set: updateFields }
    );

    return NextResponse.json({ 
      success: true, 
      data: { ...existingBlog, ...updateFields },
      message: 'Blog updated successfully' 
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a blog post
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Blog ID is required' }, { status: 400 });
    }

    const db = await getDb();

    const query = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { id: id }, { slug: id }] }
      : { $or: [{ id: id }, { slug: id }] };

    const result = await db.collection('blogs').deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB configuration."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
