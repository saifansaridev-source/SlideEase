import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

// Cloudinary configuration
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

function uploadReturnEvidenceToCloudinary(buffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'slideease/returns',
        resource_type: 'image',
        public_id: `ret-${Date.now()}-${path.parse(fileName).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per image
const MAX_PHOTOS = 4;

export async function POST(request) {
  try {
    // Authenticate customer session or guest request
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');
    const session = sessionCookie ? verifySession(sessionCookie.value) : null;

    const formData = await request.formData();
    const files = formData.getAll('photos');
    const singleFile = formData.get('photo') || formData.get('file');

    const allFiles = [...files];
    if (singleFile && !allFiles.includes(singleFile)) {
      allFiles.push(singleFile);
    }

    if (allFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No evidence photographs received.' },
        { status: 400 }
      );
    }

    if (allFiles.length > MAX_PHOTOS) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_PHOTOS} photographs allowed per return request.` },
        { status: 400 }
      );
    }

    // Validate MIME types and file sizes
    for (const f of allFiles) {
      if (!f || typeof f === 'string') continue;
      if (f.type && !ALLOWED_MIME_TYPES.includes(f.type.toLowerCase())) {
        return NextResponse.json({
          success: false,
          error: `Invalid file format "${f.type}". Only JPG, PNG, and WebP images are accepted.`
        }, { status: 400 });
      }
      if (f.size && f.size > MAX_FILE_SIZE) {
        return NextResponse.json({
          success: false,
          error: `File size exceeds 5MB limit (${(f.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller photo.`
        }, { status: 400 });
      }
    }

    const uploadedUrls = [];

    // 1. Cloudinary upload path (Production CDN)
    if (hasCloudinary) {
      for (const file of allFiles) {
        if (!file || typeof file === 'string' || !file.arrayBuffer) continue;
        const buffer = Buffer.from(await file.arrayBuffer());
        const secureUrl = await uploadReturnEvidenceToCloudinary(buffer, file.name || 'return-photo.jpg');
        uploadedUrls.push(secureUrl);
      }

      return NextResponse.json({
        success: true,
        storage: 'cloudinary',
        urls: uploadedUrls,
        message: `Successfully uploaded ${uploadedUrls.length} evidence photo(s).`
      });
    }

    // 2. Local disk fallback
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'returns');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const file of allFiles) {
      if (!file || typeof file === 'string' || !file.arrayBuffer) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : 'evidence.jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${safeName}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/returns/${fileName}`);
    }

    return NextResponse.json({
      success: true,
      storage: 'local_disk',
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} evidence photo(s).`
    });
  } catch (error) {
    console.error('Return evidence upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
