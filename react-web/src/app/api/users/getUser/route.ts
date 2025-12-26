/**
 * Get User API Route
 *
 * This route handles fetching the current user data based on the authentication token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(request: NextRequest) {
  console.log('Get User route called');

  try {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    try {
      console.log('Forwarding request to backend API: /users/getUser');
      const response = await fetch(`${API_BASE_URL}/users/getUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          'Authorization': authHeader
        }
      });

      if (!response.ok) {
        console.error(`Error fetching user data: ${response.status} ${response.statusText}`);

        // Try to get the error message from the response
        let errorMessage = 'Failed to fetch user data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parsing errors
        }

        // Return appropriate error based on status code
        if (response.status === 401) {
          return NextResponse.json(
            { success: false, error: 'Your session has expired. Please login again.' },
            { status: 401 }
          );
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: response.status }
        );
      }

      // Parse the response
      const data = await response.json();

      // Log the response for debugging
      console.log('User data response received successfully');
      console.log('Raw user data:', JSON.stringify(data, null, 2));

      // Extract user data from the response
      let userId = '';
      let accountId = '';
      let firstName = '';
      let lastName = '';
      let email = '';
      let avatarImagePath = '';

      // Check if user data is in the top level or nested in a user object
      if (data.user) {
        console.log('User data found in nested user object');
        userId = data.user.id || data.user.userId || data.user.UniqueId || '';
        accountId = data.user.accountId || data.user.Account_uniqueId || '';
        firstName = data.user.firstName || data.user.FirstName || '';
        lastName = data.user.lastName || data.user.LastName || '';
        email = data.user.emailAddress || data.user.email || data.user.EmailAddress || '';
        avatarImagePath = data.user.avatarImagePath || '';
      } else {
        console.log('Looking for user data in top level properties');
        userId = data.userId || data.id || data.UniqueId || '';
        accountId = data.accountId || data.Account_uniqueId || '';
        firstName = data.firstName || data.FirstName || '';
        lastName = data.lastName || data.LastName || '';
        email = data.email || data.emailAddress || data.EmailAddress || '';
        avatarImagePath = data.avatarImagePath || '';
      }

      // Create a user object with the extracted data
      const userObject = {
        id: userId,
        accountId: accountId,
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        avatarImagePath: avatarImagePath
      };

      console.log('Extracted user data:', userObject);

      // Format the response
      const formattedResponse = {
        success: true,
        user: userObject
      };

      // Return the formatted user data
      return NextResponse.json(formattedResponse);
    } catch (fetchError) {
      console.error('Fetch error during user data fetch:', fetchError);

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
    console.error('Get user error:', error);

    // Return a generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process user data request' },
      { status: 500 }
    );
  }
}
