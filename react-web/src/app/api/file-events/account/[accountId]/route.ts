/**
 * File Events API Route for Account
 *
 * This route handles fetching file-event relationships for an account from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const accountId = (await params).accountId;

  console.log(`Fetching file-events for account: ${accountId}`);

  try {
    // Build the URL
    const url = new URL(`${API_BASE_URL}/file-events/account/${accountId}`);

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
      console.error(`Error fetching file-events: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch file-events' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 'unknown'} file-events for account ${accountId}`);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in file-events API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
