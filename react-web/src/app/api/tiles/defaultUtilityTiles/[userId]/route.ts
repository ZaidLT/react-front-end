/**
 * Default Utility Tiles API Route for User
 *
 * This route handles fetching default utility tiles for a specific user from the backend API.
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

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  if (!accountId) {
    return NextResponse.json(
      { error: 'Account ID is required' },
      { status: 400 }
    );
  }

  try {
    // Check if the request has an authorization header
    const authHeader = request.headers.get('Authorization');

    // Make request to backend API
    const response = await fetch(
      `${API_BASE_URL}/tiles/defaultUtilityTiles/${userId}?accountId=${accountId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          // Add the Authorization header if present
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
      }
    );

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch utility tiles from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching utility tiles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();

    // Check if the request has an authorization header
    const authHeader = request.headers.get('Authorization');

    // Make request to backend API
    const response = await fetch(
      `${API_BASE_URL}/tiles/defaultUtilityTiles/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          // Add the Authorization header if present
          ...(authHeader ? { 'Authorization': authHeader } : {})
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to create utility tile in backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error creating utility tile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
