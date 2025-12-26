/**
 * Accounts API Route
 *
 * This route handles account operations including fetching and updating account details.
 * Updated to support the full API reference document specification.
 *
 * API Reference: https://node-backend-dev-eeva.vercel.app
 * Backend Endpoint: https://node-backend-dev-eeva.vercel.app/api/accounts
 *
 * Supported Operations:
 * - GET: Get account details (requires accountId query parameter)
 * - PUT: Update account details (requires accountId in body)
 *
 * Headers:
 * - x-vercel-protection-bypass: Required for backend access
 * - Authorization: Bearer token from client
 * - Content-Type: application/json
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  console.log(`Fetching account: ${accountId}`);

  if (!accountId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: accountId' },
      { status: 400 }
    );
  }

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/accounts/${accountId}`, {
      method: 'GET',
      headers: {
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Account fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Updating account with data:', body);

    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'PUT',
      headers: {
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Account update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
