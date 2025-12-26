import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    // Get request body
    const body = await request.json();
    const { accountId, userId, completionDate } = body;

    console.log(`Completing event: ${eventId}, account: ${accountId}, user: ${userId}`);

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: accountId and userId' },
        { status: 400 }
      );
    }

    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    const backendUrl = process.env.NODE_ENV === 'production'
      ? 'https://api.eeva.app/api'
      : 'https://dev.api.eeva.app/api';

    const apiUrl = `${backendUrl}/events/${eventId}/complete`;

    // Prepare request body
    const requestBody = {
      accountId,
      userId,
      ...(completionDate && { completionDate })
    };

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': '0a2eba8c751892e035f6b96605600fae'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error completing event:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to complete event: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Event completed successfully:', eventId);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error completing event:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
