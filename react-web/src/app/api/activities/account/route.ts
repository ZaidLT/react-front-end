/**
 * Activities API Route for Account
 *
 * This route handles fetching activities for an account from the backend API.
 * Uses query string format: /api/activities/account?accountId={accountId}
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const currentUserDateTime = searchParams.get('CurrentUserDateTime');
  const numberOfActivities = searchParams.get('NumberOfActivities') || '40';

  console.log(`Fetching activities for account: ${accountId}, dateTime: ${currentUserDateTime}, limit: ${numberOfActivities}`);

  if (!accountId) {
    return NextResponse.json(
      { error: 'accountId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/activities/account`);
    url.searchParams.append('accountId', accountId);
    
    if (currentUserDateTime) {
      url.searchParams.append('CurrentUserDateTime', currentUserDateTime);
    }
    
    if (numberOfActivities) {
      url.searchParams.append('NumberOfActivities', numberOfActivities);
    }

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
      console.error(`Error fetching activities: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 'unknown'} activities for account ${accountId}`);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in activities API route:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
