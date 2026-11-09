import { NextResponse } from 'next/server';
import { uploadBufferToCloudinary } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB per image
const MAX_PHOTOS = 4;

export async function POST(request) {
  try {
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
          error: `File size exceeds 8MB limit (${(f.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller photo.`
        }, { status: 400 });
      }
    }

    const uploadedUrls = [];

    for (const file of allFiles) {
      if (!file || typeof file === 'string' || !file.arrayBuffer) continue;
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = file.name || 'return-photo.jpg';

      const uploadRes = await uploadBufferToCloudinary(buffer, {
        folder: 'slideease/returns',
        fileName,
        tags: ['slideease', 'returns'],
      });

      uploadedUrls.push(uploadRes.secure_url);
    }

    return NextResponse.json({
      success: true,
      storage: 'cloudinary',
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
      message: `Successfully uploaded ${uploadedUrls.length} evidence photo(s).`
    });
  } catch (error) {
    console.error('[Return Evidence Upload Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Evidence upload failed.' }, { status: 500 });
  }
}
