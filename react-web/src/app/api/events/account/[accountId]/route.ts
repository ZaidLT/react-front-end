/**
 * Events API Route for Account
 *
 * Correctly proxies to backend: GET /events/account/{accountId}
 * Required query for auth: userId
 * Optional: includeOnlyThisWeeksItems, start, end, page_size, page_index
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const accountId = (await params).accountId;
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const includeOnlyThisWeeksItems = searchParams.get('includeOnlyThisWeeksItems');
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  const pageSize = searchParams.get('page_size');
  const pageIndex = searchParams.get('page_index');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const url = new URL(`${API_BASE_URL}/events/account/${accountId}`);
    url.searchParams.append('userId', userId);
    if (includeOnlyThisWeeksItems) url.searchParams.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems);
    if (start) url.searchParams.append('start', start);
    if (end) url.searchParams.append('end', end);
    if (pageSize) url.searchParams.append('page_size', pageSize);
    if (pageIndex) url.searchParams.append('page_index', pageIndex);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        ...(request.headers.get('Authorization')
          ? { Authorization: request.headers.get('Authorization') as string }
          : {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Account events proxy failed: ${response.status} ${response.statusText} :: ${text}`);
      return NextResponse.json(
        { error: 'Failed to fetch account events' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in account events API route:', error?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

