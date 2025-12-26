/**
 * Individual File API Route
 *
 * This route handles operations on individual files by ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const fileId = (await params).fileId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  console.log(`Fetching file: ${fileId}, account: ${accountId}`);

  try {
    // Build the URL
    let apiUrl = `${API_BASE_URL}/files/${fileId}`;
    if (accountId) {
      apiUrl += `?accountId=${accountId}`;
    }

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
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
      console.error(`Error fetching file: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch file' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const fileId = (await params).fileId;

  console.log(`Updating file: ${fileId}`);

  try {
    // Parse the request body
    const body = await request.json();
    console.log('Update request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.accountId || body.accountId === '') {
      console.error('Missing or empty accountId in request body');
      return NextResponse.json(
        { error: 'Missing accountId' },
        { status: 400 }
      );
    }

    if (!body.userId || body.userId === '') {
      console.error('Missing or empty userId in request body');
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Build the URL
    const apiUrl = `${API_BASE_URL}/files/${fileId}`;
    console.log(`Proxy PUT request to: ${apiUrl}`);

    // Forward the request to the backend API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
    };

    // Forward the authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('Request headers:', headers);

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error updating file: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to update file', details: errorText },
        { status: response.status }
      );
    }

    // Return the updated file data
    const data = await response.json();
    console.log('File updated successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const fileId = (await params).fileId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  console.log(`Deleting file: ${fileId}, account: ${accountId}`);

  try {
    // Build the URL
    let apiUrl = `${API_BASE_URL}/files/${fileId}`;
    if (accountId) {
      apiUrl += `?accountId=${accountId}`;
    }

    console.log(`Proxy DELETE request to: ${apiUrl}`);

    // Forward the request to the backend API
    const headers: Record<string, string> = {
      'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
    };

    // Forward the authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    console.log('Request headers:', headers);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
    });

    console.log(`Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error deleting file: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to delete file', details: errorText },
        { status: response.status }
      );
    }

    // For successful deletion, return a success response
    console.log('File deleted successfully');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
