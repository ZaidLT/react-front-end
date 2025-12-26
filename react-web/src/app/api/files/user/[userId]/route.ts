/**
 * Files by User API Route
 *
 * This route handles fetching files for a specific user.
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

  console.log(`Fetching files for user: ${userId}, account: ${accountId}, includeOnlyThisWeeksItems: ${includeOnlyThisWeeksItems}`);

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/files/user/${userId}`);
    if (accountId) {
      url.searchParams.append('accountId', accountId);
    }
    if (includeOnlyThisWeeksItems) {
      url.searchParams.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems);
    }

    const apiUrl = url.toString();

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
      console.error(`Error fetching files for user: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch files for user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching files for user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
