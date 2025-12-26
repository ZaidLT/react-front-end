/**
 * User All Data API Route
 *
 * This route handles fetching comprehensive user data from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string; userId: string }> }
) {
  const { accountId, userId } = await params;

  console.log(`Fetching all data for user: ${userId}, account: ${accountId}`);

  try {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    console.log('Authorization header found, forwarding request to backend API');

    // Forward the request to the backend API
    try {
      const response = await fetch(`${API_BASE_URL}/users/all-data/${accountId}/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          'Authorization': authHeader
        },
      });

      console.log(`Backend API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend API error: ${response.status} - ${errorText}`);
        
        return NextResponse.json(
          { 
            success: false, 
            error: `Backend API error: ${response.status}`,
            details: errorText
          },
          { status: response.status }
        );
      }

      // Parse the response
      const data = await response.json();

      // Log the response for debugging
      console.log(`Successfully fetched all data for user ${userId}`);


      // Return the user data
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Fetch error during user all data fetch:', fetchError);

      // Return a specific error for fetch failures
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to connect to the authentication server. Please try again later.'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('User all data error:', error);

    // Return a generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process user all data request' },
      { status: 500 }
    );
  }
}
