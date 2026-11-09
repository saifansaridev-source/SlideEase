import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Primary credentials from process.env with verified fallback for production resilience
const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'yttzcohv',
  api_key: process.env.CLOUDINARY_API_KEY || '239516544775188',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'KHuKkjtz71yb-aMGQXzJxPB5WMM',
  secure: true,
};

// Ensure Cloudinary is initialized
cloudinary.config(CLOUDINARY_CONFIG);

export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CONFIG.cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || CLOUDINARY_CONFIG.api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || CLOUDINARY_CONFIG.api_secret,
    secure: true,
  });
  return cloudinary;
}

/**
 * Upload an image buffer directly to Cloudinary CDN
 * @param {Buffer} buffer
 * @param {Object} options { folder, fileName, tags }
 * @returns {Promise<{ url: string, secure_url: string, public_id: string, format: string, width: number, height: number, bytes: number }>}
 */
export function uploadBufferToCloudinary(buffer, options = {}) {
  const c = getCloudinary();
  const folder = options.folder || 'slideease/products';
  const rawName = options.fileName ? path.parse(options.fileName).name : 'asset';
  const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const publicId = `${Date.now()}-${cleanName}`;

  return new Promise((resolve, reject) => {
    const uploadStream = c.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        tags: options.tags || ['slideease'],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            secure_url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary CDN by public_id
 * @param {string} publicId
 * @returns {Promise<any>}
 */
export function deleteFromCloudinary(publicId) {
  const c = getCloudinary();
  return new Promise((resolve, reject) => {
    c.uploader.destroy(publicId, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

export function isCloudinaryConfigured() {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CONFIG.cloud_name) &&
    (process.env.CLOUDINARY_API_KEY || CLOUDINARY_CONFIG.api_key) &&
    (process.env.CLOUDINARY_API_SECRET || CLOUDINARY_CONFIG.api_secret)
  );
}

