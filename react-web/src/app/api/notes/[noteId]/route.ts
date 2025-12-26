/**
 * Individual Note API Route
 *
 * This route handles fetching and updating individual notes from the backend API.
 * Updated to support the full API reference document specification (June 2025).
 *
 * API Reference: https://node-backend-dev-eeva.vercel.app
 * Backend Endpoint: https://node-backend-dev-eeva.vercel.app/api/notes/{noteId}
 *
 * Supported Operations:
 * - GET: Get individual note (requires accountId query parameter)
 * - PUT: Update individual note (requires accountId query parameter)
 * - DELETE: Delete individual note (requires accountId and userId query parameters)
 *
 * Headers:
 * - x-vercel-protection-bypass: Required for backend access
 * - Authorization: Bearer token from client
 * - Content-Type: application/json or multipart/form-data (for file uploads)
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const noteId = (await params).noteId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  console.log(`Fetching note: ${noteId}, account: ${accountId}`);

  if (!accountId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: accountId' },
      { status: 400 }
    );
  }

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/notes/${noteId}`);
    url.searchParams.append('accountId', accountId);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
    });

    if (!response.ok) {
      console.error(`Error fetching note: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch note' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in note fetch API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const noteId = (await params).noteId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');



  if (!accountId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: accountId' },
      { status: 400 }
    );
  }

  try {
    // Check if this is a multipart request (for file uploads)
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    let body: any;
    let requestBody: string | FormData;

    if (isMultipart) {
      // Handle multipart/form-data for file uploads
      body = await request.formData();
      requestBody = body;
      console.log('Note update request (multipart):', Array.from(body.entries()));
    } else {
      // Handle JSON requests
      body = await request.json();
      requestBody = JSON.stringify(body);
      console.log('Note update request body:', body);
    }

    // Validate title length if provided (1-256 characters)
    const title = isMultipart ? body.get('title') : body.title;
    if (title && (title.length < 1 || title.length > 256)) {
      return NextResponse.json(
        { 
          error: 'Invalid title length', 
          details: 'Title must be between 1 and 256 characters' 
        },
        { status: 400 }
      );
    }

    // Validate text length if provided (1-2000 characters)
    const text = isMultipart ? body.get('text') : body.text;
    if (text && (text.length < 1 || text.length > 2000)) {
      return NextResponse.json(
        { 
          error: 'Invalid text length', 
          details: 'Text must be between 1 and 2000 characters' 
        },
        { status: 400 }
      );
    }

    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/notes/${noteId}`);
    url.searchParams.append('accountId', accountId);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {}),
        // Only set Content-Type for JSON requests, let fetch handle multipart
        ...(!isMultipart ? { 'Content-Type': 'application/json' } : {})
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error updating note: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to update note', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully updated note:', data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in note update API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const noteId = (await params).noteId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const userId = searchParams.get('userId');

  console.log(`Deleting note: ${noteId}, account: ${accountId}, user: ${userId}`);

  if (!accountId || !userId) {
    return NextResponse.json(
      { error: 'Missing required query parameters: accountId and userId' },
      { status: 400 }
    );
  }

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/notes/${noteId}`);
    url.searchParams.append('accountId', accountId);
    url.searchParams.append('userId', userId);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error deleting note: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to delete note', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully deleted note:', data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in note deletion API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
