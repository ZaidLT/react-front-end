/**
 * Files API Route for Account
 *
 * This route handles fetching files for a specific account from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  // The dynamic segment is the accountId per backend contract
  const accountId = (await params).accountId;
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || undefined;
  const includeDeleted = searchParams.get('includeDeleted') ?? 'false';
  const includeOnlyThisWeeksItems = searchParams.get('includeOnlyThisWeeksItems') || undefined;

  try {
    // Get authorization header from the request (case-insensitive)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    // Build backend URL matching new guidance: /files/account/{accountId}
    let backendUrl = `${API_BASE_URL}/files/account/${encodeURIComponent(accountId)}`;
    const paramsQs = new URLSearchParams();

    // Required per backend shape: userId and includeDeleted
    if (userId) paramsQs.append('userId', userId);
    paramsQs.append('includeDeleted', includeDeleted);

    if (includeOnlyThisWeeksItems) paramsQs.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems);

    if (paramsQs.toString()) backendUrl += `?${paramsQs.toString()}`;



    // Forward the request to the backend API
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader
      },
    });

    const respText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch account files' },
        { status: response.status }
      );
    }

    // Try to parse JSON; if it fails, return text directly
    try {
      const data = JSON.parse(respText);
      return NextResponse.json(data);
    } catch (e) {
      return new NextResponse(respText, {
        status: response.status,
        headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' }
      });
    }
  } catch (error: any) {
    console.error('Error in account files API route:', error?.message || error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
