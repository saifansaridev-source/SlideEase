import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

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

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized administrative access. Please log in as an administrator.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    const singleFile = formData.get('file');

    const allFiles = [...files];
    if (singleFile && !allFiles.includes(singleFile)) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No image files received in upload request.' },
        { status: 400 }
      );
    }

    // Validate MIME types and file sizes
    for (const f of allFiles) {
      if (!f || typeof f === 'string') continue;
      if (f.type && !ALLOWED_MIME_TYPES.includes(f.type.toLowerCase())) {
        return NextResponse.json({
          success: false,
          error: `Invalid file type "${f.type}". Only JPG, PNG, WebP, GIF, SVG, and AVIF images are permitted.`
        }, { status: 400 });
      }
      if (f.size && f.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          success: false,
          error: `File size exceeds 15MB limit (${(f.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller image.`
        }, { status: 400 });
      }
    }

    const uploadedUrls = [];
    const mediaDocs = [];

    for (const file of allFiles) {
      if (!file || typeof file === 'string' || !file.arrayBuffer) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name || 'product-image.jpg';

      const uploadRes = await uploadBufferToCloudinary(buffer, {
        folder: 'slideease/products',
        fileName,
        tags: ['slideease', 'products'],
      });

      uploadedUrls.push(uploadRes.secure_url);
      mediaDocs.push({
        name: fileName,
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        size: uploadRes.bytes || buffer.length,
        format: uploadRes.format || 'jpg',
        width: uploadRes.width,
        height: uploadRes.height,
        folder: 'slideease/products',
        uploadedAt: new Date(),
        uploadedBy: admin.email || 'admin',
        source: 'admin_upload',
      });
    }

    // Persist records into MongoDB media library
    if (mediaDocs.length > 0) {
      try {
        const db = await getDb();
        await db.collection('media').insertMany(mediaDocs);
      } catch (dbErr) {
        console.warn('Could not insert media record into MongoDB:', dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      storage: 'cloudinary',
      message: `Successfully uploaded ${uploadedUrls.length} image(s) to Cloudinary CDN`,
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
      assets: mediaDocs,
    });
  } catch (error) {
    console.error('[Admin Upload API Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed. Please try again.' },
      { status: 500 }
    );
  }
}
