import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// GET: Retrieve list of all uploaded images
export async function GET() {
  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    
    const files = await fs.readdir(UPLOADS_DIR);
    
    const assets = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = await fs.stat(filePath);
        return {
          name: filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          uploadedAt: stats.mtime,
        };
      })
    );
    
    // Sort by uploaded date (newest first)
    assets.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    
    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upload an image file
export async function POST(request) {
  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Sanitize name and generate unique timestamp prefix
    const timestamp = Date.now();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}-${cleanFilename}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    // Save file locally
    await fs.writeFile(filePath, buffer);
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully!',
      data: {
        name: uniqueFilename,
        url: `/uploads/${uniqueFilename}`,
        size: file.size,
        uploadedAt: new Date(),
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an uploaded image from server
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json({ success: false, error: 'Filename parameter is required' }, { status: 400 });
    }
    
    // Sanitize filename to prevent directory traversal attacks
    const safeName = path.basename(name);
    const filePath = path.join(UPLOADS_DIR, safeName);
    
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return NextResponse.json({ success: true, message: 'File deleted successfully!' });
    } catch {
      return NextResponse.json({ success: false, error: 'File not found on server' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
