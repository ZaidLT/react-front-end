/**
 * Refresh Token API Route
 *
 * This route handles refreshing authentication tokens by forwarding the request
 * to the backend API and returning new tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('Refresh token route called');

  try {
    // Parse the request body
    const body = await request.json();

    // Log the request for debugging (omit sensitive data)
    console.log('Refresh token request received');

    // Make sure we have the required fields
    if (!body.refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.error(`Error refreshing token: ${response.status} ${response.statusText}`);

        // Try to get the error message from the response
        let errorMessage = 'Failed to refresh token';
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

      // Log the response for debugging (omit sensitive data)
      console.log('Refresh token response received successfully');

      // Log the raw response data for debugging
      console.log('Raw refresh token response data:', JSON.stringify(data, null, 2));

      // Extract user data from the response
      let userId = '';
      let accountId = '';
      let firstName = '';
      let lastName = '';
      let email = '';

      // Check if user data is in the top level or nested in a user object
      if (data.user) {
        console.log('User data found in nested user object');
        userId = data.user.id || data.user.userId || data.user.UniqueId || '';
        accountId = data.user.accountId || data.user.Account_uniqueId || '';
        firstName = data.user.firstName || data.user.FirstName || '';
        lastName = data.user.lastName || data.user.LastName || '';
        email = data.user.emailAddress || data.user.email || data.user.EmailAddress || '';
      } else {
        console.log('Looking for user data in top level properties');
        userId = data.userId || data.id || data.UniqueId || '';
        accountId = data.accountId || data.Account_uniqueId || '';
        firstName = data.firstName || data.FirstName || '';
        lastName = data.lastName || data.LastName || '';
        email = data.email || data.emailAddress || data.EmailAddress || '';
      }

      // If we still don't have user data, try to extract it from the token
      if (!userId && (data.accessToken || data.token || data.auth_token)) {
        console.log('Attempting to extract user data from token');
        try {
          const token = data.accessToken || data.token || data.auth_token;
          const tokenParts = token.split('.');

          if (tokenParts.length === 3) {
            const base64Url = tokenParts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );

            const payload = JSON.parse(jsonPayload);
            console.log('Token payload:', payload);

            userId = payload.userId || payload.sub || payload.id || userId;
            accountId = payload.accountId || payload.account_id || accountId;
            firstName = payload.firstName || payload.given_name || firstName;
            lastName = payload.lastName || payload.family_name || lastName;
            email = payload.email || payload.emailAddress || email;
          }
        } catch (error) {
          console.error('Error extracting user data from token:', error);
        }
      }

      // Create a user object with the extracted data
      const userObject = {
        id: userId,
        accountId: accountId,
        firstName: firstName,
        lastName: lastName,
        emailAddress: email
      };

      console.log('Extracted user data:', userObject);

      // Make sure the response has the expected format
      const formattedResponse = {
        success: true,
        accessToken: data.accessToken || data.token || data.auth_token,
        refreshToken: data.refreshToken || data.refresh_token || body.refreshToken,
        userId: userId,
        accountId: accountId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        user: userObject
      };

      // Return the formatted response
      return NextResponse.json(formattedResponse);
    } catch (fetchError) {
      console.error('Fetch error during token refresh:', fetchError);

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
    console.error('Refresh token error:', error);

    // Return a generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process token refresh request' },
      { status: 500 }
    );
  }
}
