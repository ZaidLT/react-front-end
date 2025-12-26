/**
 * Notes API Route for Account
 *
 * This route handles fetching notes for a specific account from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const includeOnlyThisWeeksItems = searchParams.get('includeOnlyThisWeeksItems');

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/notes/account/${userId}`);
    if (accountId) {
      url.searchParams.append('accountId', accountId);
    }
    if (includeOnlyThisWeeksItems) {
      url.searchParams.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems);
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
      console.error(`Error fetching account notes: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch account notes' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in account notes API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
