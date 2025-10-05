import { NextResponse } from 'next/server';

export function middleware(request) {
  // Only run for upload API route
  if (request.nextUrl.pathname.startsWith('/api/upload')) {
    // Check content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Only form-data uploads allowed' },
        { status: 400 }
      );
    }

    // Optional: Add file size limit (e.g., 5MB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }
  }
  return NextResponse.next();
}

// Only run middleware for specific paths
export const config = {
  matcher: '/api/upload',
};