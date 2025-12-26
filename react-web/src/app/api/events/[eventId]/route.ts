/**
 * Individual Event API Route
 *
 * This route handles fetching and updating individual events from the backend API.
 * Updated to support the full API reference document specification (June 2025).
 *
 * API Reference: https://node-backend-dev-eeva.vercel.app
 * Backend Endpoint: https://node-backend-dev-eeva.vercel.app/api/events/{eventId}
 *
 * Supported Operations:
 * - GET: Get individual event (requires accountId query parameter)
 * - PUT: Update individual event (requires accountId query parameter)
 * - DELETE: Delete individual event (requires accountId and userId query parameters)
 *
 * Headers:
 * - x-vercel-protection-bypass: Required for backend access
 * - Authorization: Bearer token from client
 * - Content-Type: application/json
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const eventId = (await params).eventId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');



  if (!accountId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: accountId' },
      { status: 400 }
    );
  }

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/events/${eventId}`);
    url.searchParams.append('accountId', accountId);

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
      console.error(`Error fetching event: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch event' },
        { status: response.status }
      );
    }

    const data = await response.json();


    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in event fetch API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const eventId = (await params).eventId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');



  if (!accountId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: accountId' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    console.log('Event update request body:', body);

    // Validate title length if provided (1-256 characters)
    if (body.title && (body.title.length < 1 || body.title.length > 256)) {
      return NextResponse.json(
        { 
          error: 'Invalid title length', 
          details: 'Title must be between 1 and 256 characters' 
        },
        { status: 400 }
      );
    }

    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/events/${eventId}`);
    url.searchParams.append('accountId', accountId);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error updating event: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to update event', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully updated event:', data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in event update API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const eventId = (await params).eventId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const userId = searchParams.get('userId');

  console.log('🗑️ DELETE /api/events/[eventId] - Event deletion request');
  console.log(`🔍 Event ID: ${eventId}`);
  console.log(`🔍 Account ID: ${accountId}`);
  console.log(`🔍 User ID: ${userId}`);
  console.log('🔍 All search params:', Object.fromEntries(searchParams.entries()));

  if (!accountId || !userId) {
    return NextResponse.json(
      { error: 'Missing required query parameters: accountId and userId' },
      { status: 400 }
    );
  }

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/events/${eventId}`);
    url.searchParams.append('accountId', accountId);
    url.searchParams.append('userId', userId);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
      method: 'DELETE',
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
      const errorText = await response.text();
      console.error(`Error deleting event: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to delete event', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully deleted event:', data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in event deletion API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
