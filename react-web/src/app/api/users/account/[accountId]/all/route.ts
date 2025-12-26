/**
 * Users by Account API Route
 *
 * This route handles fetching all users for a specific account from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const accountId = (await params).accountId;

  console.log(`Fetching users for account: ${accountId}`);

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
      const response = await fetch(`${API_BASE_URL}/users/account/${accountId}/all`, {
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

      // Log the response for debugging (omit sensitive data)
      console.log(`Successfully fetched ${Array.isArray(data) ? data.length : 'unknown'} users for account ${accountId}`);

      // Log detailed user data for debugging avatar images
      if (Array.isArray(data)) {
        console.log('=== DETAILED USER DATA FROM BACKEND ===');
        data.forEach((user, index) => {
          console.log(`User ${index + 1}:`, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.emailAddress,
            avatarImagePath: user.avatarImagePath,
            avatarImagePathType: typeof user.avatarImagePath,
            avatarImagePathLength: user.avatarImagePath ? user.avatarImagePath.length : 0,
            avatarImagePathStartsWith: user.avatarImagePath ? {
              http: user.avatarImagePath.startsWith('http'),
              https: user.avatarImagePath.startsWith('https'),
              gcp: user.avatarImagePath.startsWith('gcp/'),
              data: user.avatarImagePath.startsWith('data:'),
            } : null,
            // Show first 100 chars of avatar path for debugging
            avatarImagePathPreview: user.avatarImagePath ? user.avatarImagePath.substring(0, 100) + (user.avatarImagePath.length > 100 ? '...' : '') : null
          });
        });
        console.log('=== END DETAILED USER DATA ===');
      }

      // Return the users data
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Fetch error during users fetch:', fetchError);

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
    console.error('Users by account error:', error);

    // Return a generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process users request' },
      { status: 500 }
    );
  }
}
