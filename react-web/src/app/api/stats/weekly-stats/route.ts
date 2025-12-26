/**
 * Weekly Stats API Route
 *
 * This route proxies weekly stats requests to the backend with proper authentication.
 * It handles the server-side auth token forwarding that the client-side direct call can't do.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Build the backend URL with all query parameters
    const backendUrl = `${API_BASE_URL}/stats/weekly-stats?${searchParams.toString()}`;

    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Weekly stats backend error:', response.status, errorText);

      return NextResponse.json(
        { error: `Backend API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Weekly stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
