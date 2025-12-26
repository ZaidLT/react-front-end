import { NextRequest, NextResponse } from 'next/server';
import { getCalendarMicroserviceUrl } from '../../../../../util/calendarConfig';

// Calendar microservice URL from environment
const CALENDAR_API_URL = getCalendarMicroserviceUrl();

/**
 * Proxy PATCH requests to calendar microservice for color updates
 * PATCH /api/calendars/{calendarId}/color
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  try {
    const { calendarId } = await params;

    if (!calendarId) {
      return NextResponse.json(
        { error: 'calendarId parameter is required' },
        { status: 400 }
      );
    }

    // Get color from request body
    const body = await request.json();
    const { color } = body;

    if (!color) {
      return NextResponse.json(
        { error: 'color is required in request body' },
        { status: 400 }
      );
    }

    // Validate hex color format
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(color)) {
      return NextResponse.json(
        { error: 'Invalid color format. Must be hex color (#RRGGBB)' },
        { status: 400 }
      );
    }

    // Get authorization header (middleware should have added it from cookies)
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Build microservice URL
    const microserviceUrl = `${CALENDAR_API_URL}/api/calendar/${calendarId}/color`;

    // Forward request to calendar microservice
    const response = await fetch(microserviceUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ color }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Calendar Color API Proxy] Microservice error:', errorText);

      return NextResponse.json(
        { error: 'Failed to update calendar color', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Calendar Color API Proxy] Error:', error.message);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
