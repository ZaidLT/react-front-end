/**
 * Notes API Route
 *
 * This route handles creating, updating, and deleting notes in the backend API.
 * Updated to support the full API reference document specification (June 2025).
 *
 * API Reference: https://node-backend-dev-eeva.vercel.app
 * Backend Endpoint: https://node-backend-dev-eeva.vercel.app/api/notes
 *
 * Supported Operations:
 * - POST: Create new note (requires userId, accountId, title, text)
 * - PUT: Update existing note (requires id, accountId, userId)
 * - DELETE: Delete note (requires id, accountId, userId)
 *
 * Validation (API Reference Compliant):
 * - Required fields validation for all operations
 * - Title length validation (1-256 characters)
 * - Text length validation (1-2000 characters)
 * - Proper error responses with details
 *
 * Headers:
 * - x-vercel-protection-bypass: Required for backend access
 * - Authorization: Bearer token from client
 * - Content-Type: application/json or multipart/form-data (for file uploads)
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {

  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: accountId' },
        { status: 400 }
      );
    }

    // Check if this is a multipart request (for file uploads)
    const contentType = request.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    let body: any;
    let requestBody: string | FormData;

    if (isMultipart) {
      // Handle multipart/form-data for file uploads
      body = await request.formData();
      requestBody = body;
      console.log('Note creation request (multipart):', Array.from(body.entries()));
    } else {
      // Handle JSON requests
      body = await request.json();
      requestBody = JSON.stringify(body);
      console.log('Note creation request body:', body);
    }

    // Validate required fields according to API documentation
    const requiredFields = ['userId', 'accountId', 'title', 'text'];
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      const value = isMultipart ? body.get(field) : body[field];
      if (!value) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: `Required fields: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
    }

    // Validate title length (1-256 characters)
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

    // Validate text length (1-2000 characters)
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
    const url = new URL(`${API_BASE_URL}/notes`);
    url.searchParams.append('accountId', accountId);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
      method: 'POST',
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
      console.error(`Error creating note: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to create note', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error in note creation API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {

  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: accountId' },
        { status: 400 }
      );
    }

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

    // Validate required fields for update
    const requiredFields = ['id', 'accountId', 'userId'];
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      const value = isMultipart ? body.get(field) : body[field];
      if (!value) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      console.error('Missing required fields for update:', missingFields);
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: `Required fields for update: ${missingFields.join(', ')}`,
          missingFields 
        },
        { status: 400 }
      );
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
    const url = new URL(`${API_BASE_URL}/notes`);
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
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in note update API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {

  try {
    const body = await request.json();
    console.log('Note deletion request body:', body);

    // Validate required fields for deletion
    const requiredFields = ['id', 'accountId', 'userId'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      console.error('Missing required fields for deletion:', missingFields);
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: `Required fields for deletion: ${missingFields.join(', ')}`,
          missingFields
        },
        { status: 400 }
      );
    }

    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/notes/${body.id}`);
    url.searchParams.append('accountId', body.accountId);
    url.searchParams.append('userId', body.userId);

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
