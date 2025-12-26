/**
 * File Users API Route
 *
 * This route handles fetching file-user relationships from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  console.log(`Fetching file-users for id: ${id}, account: ${accountId}`);

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/file-users/${id}`);
    if (accountId) {
      url.searchParams.append('accountId', accountId);
    }

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
      console.error(`Error fetching file-users: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch file-users' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 'unknown'} file-users for id ${id}`);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in file-users API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
