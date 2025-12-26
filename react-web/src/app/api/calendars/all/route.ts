import { NextRequest, NextResponse } from 'next/server';
import { getCalendarMicroserviceUrl } from '../../../../util/calendarConfig';

// Calendar microservice URL from environment
const CALENDAR_API_URL = getCalendarMicroserviceUrl();

/**
 * Proxy GET requests to calendar microservice
 * GET /api/calendars/all?userId={userId}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
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
    const microserviceUrl = `${CALENDAR_API_URL}/api/calendar/all?userId=${userId}`;

    // Forward request to calendar microservice
    const response = await fetch(microserviceUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        { error: 'Failed to fetch calendars from microservice', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[Calendar API Proxy] Error:', error.message);

    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
