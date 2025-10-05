import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  const data = await request.formData();
  const file = data.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
    return NextResponse.json(
      { error: 'Error creating upload directory' },
      { status: 500 }
    );
  }

  // Create unique filename
  const timestamp = Date.now();
  const ext = path.extname(file.name);
  const filename = `product_${timestamp}${ext}`;
  const filepath = path.join(uploadsDir, filename);

  try {
    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      { error: 'Error saving file' },
      { status: 500 }
    );
  }
}