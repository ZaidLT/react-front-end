/**
 * Event Times API Route for Account
 *
 * This route handles fetching event times for a specific account from the backend API.
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

  if (!accountId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: accountId' },
      { status: 400 }
    );
  }

  try {
    // Get authorization header from the request (case-insensitive)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    // Add the local account ID header for backend processing
    const headers = new Headers();
    
    // Copy relevant headers from the original request
    const headersToForward = [
      'accept',
      'accept-encoding',
      'accept-language',
      'authorization',
      'connection',
      'cookie',
      'referer',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
      'sec-fetch-dest',
      'sec-fetch-mode',
      'sec-fetch-site',
      'sec-gpc',
      'user-agent',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-port',
      'x-forwarded-proto'
    ];

    headersToForward.forEach(headerName => {
      const headerValue = request.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    });

    // Add required headers for backend API
    headers.set('x-local-account-id', accountId);
    headers.set('x-vercel-protection-bypass', PROTECTION_BYPASS_HEADER);

    // Explicitly ensure authorization header is set
    headers.set('Authorization', authHeader);

    // Make the request to the backend API
    const backendUrl = `${API_BASE_URL}/event-times/account/${userId}?accountId=${encodeURIComponent(accountId)}`;
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Backend error response:', errorText);

      return NextResponse.json(
        { error: `Backend API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data from the backend
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error proxying request to backend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
