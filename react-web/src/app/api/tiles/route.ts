/**
 * Tiles API Route
 *
 * This route handles creating, updating, and deleting tiles in the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('Creating new tile');

  try {
    const body = await request.json();

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/tiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Error creating tile: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to create tile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating tile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log('Updating tile');

  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data for file uploads
      console.log('Processing multipart form data for tile update');

      const formData = await request.formData();

      // Log form data contents
      console.log('Form data entries:');
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'object' && value !== null && 'name' in value && 'size' in value && 'type' in value) {
          console.log(`${key}: File - ${(value as any).name} (${(value as any).size} bytes, ${(value as any).type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Forward the FormData to the backend API
      const response = await fetch(`${API_BASE_URL}/tiles`, {
        method: 'PUT',
        headers: {
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          // Forward the authorization header if present
          ...(request.headers.get('Authorization')
            ? { 'Authorization': request.headers.get('Authorization') as string }
            : {})
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        console.error(`Error updating tile with files: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        return NextResponse.json(
          { error: 'Failed to update tile with files', details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('Tile updated successfully with files:', data);
      return NextResponse.json(data);
    } else {
      // Handle JSON requests (existing logic)
      const body = await request.json();

      // Forward the request to the backend API
      const response = await fetch(`${API_BASE_URL}/tiles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          // Forward the authorization header if present
          ...(request.headers.get('Authorization')
            ? { 'Authorization': request.headers.get('Authorization') as string }
            : {})
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error(`Error updating tile: ${response.status} ${response.statusText}`);
        return NextResponse.json(
          { error: 'Failed to update tile' },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error updating tile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log('Deleting tile');

  try {
    const body = await request.json();

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/tiles`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Error deleting tile: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to delete tile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting tile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
