import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const sc = cookieStore.get('slidex_session');
    if (!sc) return null;
    const s = verifySession(sc.value);
    return s?.role === 'admin' ? s : null;
  } catch {
    return null;
  }
}

// Seed known storefront assets if media collection is initially empty
const STOREFRONT_INITIAL_ASSETS = [
  {
    name: 'Hero Slide 1 - Heritage Ascent',
    url: 'https://res.cloudinary.com/yttzcohv/image/upload/v1791835951/slideease/products/1791835950187-yooooooooooooo.jpg',
    publicId: 'slideease/products/1791835950187-yooooooooooooo',
    size: 245000,
    format: 'jpg',
    folder: 'slideease/hero',
    uploadedAt: new Date('2026-10-12'),
  },
  {
    name: 'Hero Slide 2 - Women Guild Ikat',
    url: 'https://res.cloudinary.com/yttzcohv/image/upload/v1791907205/slideease/products/1791907203066-hero2.jpg',
    publicId: 'slideease/products/1791907203066-hero2',
    size: 280000,
    format: 'jpg',
    folder: 'slideease/hero',
    uploadedAt: new Date('2026-10-13'),
  },
  {
    name: 'Hero Slide 3 - Men Edit Formal',
    url: 'https://res.cloudinary.com/yttzcohv/image/upload/v1791907239/slideease/products/1791907237029-hero3.jpg',
    publicId: 'slideease/products/1791907237029-hero3',
    size: 310000,
    format: 'jpg',
    folder: 'slideease/hero',
    uploadedAt: new Date('2026-10-13'),
  },
  {
    name: 'Golden Mandala Heels - Royal Gold',
    url: 'https://res.cloudinary.com/yttzcohv/image/upload/v1791907205/slideease/products/1791907203066-hero2.jpg',
    publicId: 'slideease/products/mandala-gold',
    size: 320000,
    format: 'jpg',
    folder: 'slideease/products',
    uploadedAt: new Date('2026-10-15'),
  },
  {
    name: 'Golden Mandala Heels - Warm Tan',
    url: 'https://res.cloudinary.com/yttzcohv/image/upload/v1791835951/slideease/products/1791835950187-yooooooooooooo.jpg',
    publicId: 'slideease/products/mandala-tan',
    size: 295000,
    format: 'jpg',
    folder: 'slideease/products',
    uploadedAt: new Date('2026-10-15'),
  },
  {
    name: 'SlideEase Signature Slides',
    url: '/assets/slides.png',
    publicId: 'local/slides',
    size: 150000,
    format: 'png',
    folder: 'slideease/assets',
    uploadedAt: new Date('2026-10-01'),
  },
  {
    name: 'SlideEase Artisan Loafers',
    url: '/assets/loafers.png',
    publicId: 'local/loafers',
    size: 165000,
    format: 'png',
    folder: 'slideease/assets',
    uploadedAt: new Date('2026-10-01'),
  },
  {
    name: 'SlideEase Heritage Mojris',
    url: '/assets/mojris.png',
    publicId: 'local/mojris',
    size: 172000,
    format: 'png',
    folder: 'slideease/assets',
    uploadedAt: new Date('2026-10-01'),
  },
  {
    name: 'SlideEase Strappy Sandals',
    url: '/assets/sandals.png',
    publicId: 'local/sandals',
    size: 158000,
    format: 'png',
    folder: 'slideease/assets',
    uploadedAt: new Date('2026-10-01'),
  },
];

// GET: Retrieve list of all uploaded media assets from MongoDB
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const db = await getDb();
    let assets = await db.collection('media')
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();

    // Auto-seed if collection is empty
    if (assets.length === 0) {
      await db.collection('media').insertMany(STOREFRONT_INITIAL_ASSETS);
      assets = await db.collection('media').find({}).sort({ uploadedAt: -1 }).toArray();
    }

    const formatted = assets.map((a) => ({
      id: a._id ? a._id.toString() : a.publicId,
      name: a.name || 'Image Asset',
      url: a.url,
      publicId: a.publicId,
      size: a.size || 0,
      format: a.format || 'jpg',
      uploadedAt: a.uploadedAt || new Date(),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error('[Admin Media GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upload an image file directly to Cloudinary and register in MongoDB
export async function POST(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || 'media-asset.jpg';

    // Upload directly to Cloudinary CDN
    const uploadRes = await uploadBufferToCloudinary(buffer, {
      folder: 'slideease/media',
      fileName,
      tags: ['slideease', 'media-library'],
    });

    // Save record to MongoDB media collection
    const mediaDoc = {
      name: fileName,
      url: uploadRes.secure_url,
      publicId: uploadRes.public_id,
      size: uploadRes.bytes || buffer.length,
      format: uploadRes.format || 'jpg',
      width: uploadRes.width,
      height: uploadRes.height,
      folder: 'slideease/media',
      uploadedAt: new Date(),
      uploadedBy: admin.email || 'admin',
      source: 'media_library',
    };

    const db = await getDb();
    const insertResult = await db.collection('media').insertOne(mediaDoc);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to Cloudinary CDN!',
      data: {
        id: insertResult.insertedId.toString(),
        name: fileName,
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        size: uploadRes.bytes || buffer.length,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[Admin Media POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an uploaded image from Cloudinary and MongoDB
export async function DELETE(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const url = searchParams.get('url');
    const publicId = searchParams.get('publicId');

    if (!name && !url && !publicId) {
      return NextResponse.json({ success: false, error: 'Identifier parameter (name, url, or publicId) is required.' }, { status: 400 });
    }

    const db = await getDb();
    const query = {
      $or: [
        ...(name ? [{ name }, { name: { $regex: name, $options: 'i' } }] : []),
        ...(url ? [{ url }] : []),
        ...(publicId ? [{ publicId }] : []),
      ],
    };

    const targetDoc = await db.collection('media').findOne(query);

    if (targetDoc) {
      // If it has a real Cloudinary public_id, remove from Cloudinary
      if (targetDoc.publicId && !targetDoc.publicId.startsWith('local/')) {
        try {
          await deleteFromCloudinary(targetDoc.publicId);
        } catch (cErr) {
          console.warn('Cloudinary delete warning:', cErr.message);
        }
      }
      // Remove from MongoDB
      await db.collection('media').deleteOne({ _id: targetDoc._id });
      return NextResponse.json({ success: true, message: 'File deleted successfully from media library.' });
    }

    return NextResponse.json({ success: false, error: 'Asset not found in database.' }, { status: 404 });
  } catch (error) {
    console.error('[Admin Media DELETE Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
