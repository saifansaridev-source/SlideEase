import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary if credentials exist in environment
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function uploadToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'slideease/products',
        resource_type: 'image',
        public_id: `${Date.now()}-${path.parse(fileName).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

async function requireAdmin() {
  const cookieStore = await cookies();
  const sc = cookieStore.get('slidex_session');
  if (!sc) return null;
  const s = verifySession(sc.value);
  return s?.role === 'admin' ? s : null;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access.' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files');
    const singleFile = formData.get('file');

    const allFiles = [...files];
    if (singleFile && !allFiles.includes(singleFile)) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ success: false, error: 'No image files received in upload request' }, { status: 400 });
    }

    // Validate MIME types and file sizes
    for (const f of allFiles) {
      if (!f || typeof f === 'string') continue;
      if (f.type && !ALLOWED_MIME_TYPES.includes(f.type)) {
        return NextResponse.json({
          success: false,
          error: `Invalid file type "${f.type}". Only JPEG, PNG, WebP, GIF, and SVG images are permitted.`
        }, { status: 400 });
      }
      if (f.size && f.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          success: false,
          error: `File size exceeds 10MB limit (${Math.round(f.size / 1024 / 1024)}MB).`
        }, { status: 400 });
      }
    }

    const uploadedUrls = [];

    // 1. CLOUDINARY UPLOAD PATH (Production CDN)
    if (hasCloudinary) {
      for (const file of allFiles) {
        if (!file || typeof file === 'string' || !file.arrayBuffer) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const secureUrl = await uploadToCloudinary(buffer, file.name || 'product.jpg');
        uploadedUrls.push(secureUrl);
      }

      return NextResponse.json({
        success: true,
        storage: 'cloudinary',
        message: `Successfully uploaded ${uploadedUrls.length} image(s) to Cloudinary CDN`,
        urls: uploadedUrls,
        url: uploadedUrls[0] || null
      });
    }

    // 2. LOCAL DISK FALLBACK (Until Cloudinary credentials are provided in .env.local)
    console.warn(
      '⚠️ [SlideEase Upload] Cloudinary credentials missing in .env.local. Falling back to local disk. ' +
      'Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'
    );

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of allFiles) {
      if (!file || typeof file === 'string' || !file.arrayBuffer) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'image.jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeName}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/products/${fileName}`);
    }

    return NextResponse.json({
      success: true,
      storage: 'local_disk_fallback',
      warning: 'Uploaded to local disk. Set up Cloudinary in .env.local to persist images across Hostinger redeployments.',
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`,
      urls: uploadedUrls,
      url: uploadedUrls[0] || null
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
