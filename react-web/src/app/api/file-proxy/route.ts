import { NextRequest, NextResponse } from 'next/server';

/**
 * File Proxy API Route
 *
 * This endpoint proxies file requests from Google Cloud Storage and Azure Blob Storage
 * to avoid CORS issues when viewing files in the browser.
 *
 * Why this is needed:
 * - GCS/Azure signed URLs bypass authentication but NOT CORS restrictions
 * - Browser-based file viewers (PDF.js, images, etc.) require CORS headers
 * - GCS bucket does not have CORS configuration for our domains
 *
 * How it works:
 * - Browser requests file from same-origin endpoint (/api/file-proxy)
 * - This server-side route fetches file from GCS/Azure (no CORS on server)
 * - Returns file with CORS headers enabled for browser
 *
 * Supported file types:
 * - PDFs (primary use case)
 * - Images (if CORS issues arise)
 * - Other document types
 *
 * Future improvement:
 * Configure CORS on GCS bucket to enable direct access (see PDF_VIEWER_CORS_MIGRATION.md)
 *
 * Usage: /api/file-proxy?url=<encoded-file-url>
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    // Validate URL parameter
    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Validate that URL is from allowed origins (security measure)
    const allowedOrigins = [
      'storage.googleapis.com',
      'eevadevblob.blob.core.windows.net',
    ];

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(fileUrl);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if the URL hostname is in the allowed list
    if (!allowedOrigins.some(origin => parsedUrl.hostname.includes(origin))) {
      return NextResponse.json(
        { error: 'URL not from allowed origin' },
        { status: 403 }
      );
    }

    // Fetch the file from the original source
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        // Forward relevant headers if needed
        'User-Agent': request.headers.get('user-agent') || 'Next.js File Proxy',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch file from source' },
        { status: response.status }
      );
    }

    // Get the file data as ArrayBuffer
    const fileBuffer = await response.arrayBuffer();

    // Detect content type from response or default to octet-stream
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // Return the file with proper headers and CORS enabled
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in file proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}
