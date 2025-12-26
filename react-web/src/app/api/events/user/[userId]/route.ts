/**
 * Events API Route for User
 *
 * This route handles fetching events for a specific user from the backend API.
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
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const pageSize = searchParams.get('page_size');
  const pageIndex = searchParams.get('page_index');

  console.log(`Fetching events for user: ${userId}, account: ${accountId}, includeOnlyThisWeeksItems: ${includeOnlyThisWeeksItems}`);


  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/events/user/${userId}`);
    if (accountId) url.searchParams.append('accountId', accountId);
    if (includeOnlyThisWeeksItems) url.searchParams.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems);
    if (start) url.searchParams.append('start', start);
    if (end) url.searchParams.append('end', end);
    if (pageSize) url.searchParams.append('page_size', pageSize);
    if (pageIndex) url.searchParams.append('page_index', pageIndex);

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
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorJson = await response.json();
        return NextResponse.json(errorJson, { status: response.status });
      } else {
        const errorText = await response.text();
        return new NextResponse(errorText, {
          status: response.status,
          headers: { 'Content-Type': contentType || 'text/plain' }
        });
      }
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' }
      });
    }
  } catch (error: any) {
    const message = error?.message || 'Proxy error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
