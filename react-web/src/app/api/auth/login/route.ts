/**
 * Login API Route
 *
 * This route handles user login by forwarding the request
 * to the backend API and returning the authentication tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('Login route called');

  try {
    // Parse the request body
    const body = await request.json();

    // Log the request for debugging (omit password for security)
    const { password, ...logSafeBody } = body; // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log('Login request body:', logSafeBody);

    // Make sure we have the required fields
    if (!body.emailAddress || !body.password) {
      return NextResponse.json(
        {
          emailAddress: body.emailAddress || '',
          loginSuccessful: false,
          error: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    try {
      // Create a properly formatted request body
      const requestBody = {
        emailAddress: body.emailAddress,
        password: body.password,
        provider: body.provider || 'email'
      };

      console.log('Sending login request to backend API:', `${API_BASE_URL}/auth/login`);
      console.log('Request body:', JSON.stringify(requestBody));

      let response;
      try {
        response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          },
          body: JSON.stringify(requestBody),
        });
      } catch (error) {
        console.error('Fetch error in login route:', error);
        throw error;
      }

      // Check if the response is OK
      if (!response.ok) {
        console.error(`Login error: ${response.status} ${response.statusText}`);

        // Try to get the error message from the response
        let errorMessage = 'Failed to login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Ignore JSON parsing errors
        }

        // Return an error response
        return NextResponse.json(
          {
            emailAddress: body.emailAddress,
            loginSuccessful: false,
            error: errorMessage
          },
          { status: response.status }
        );
      }

      // Parse the response
      const data = await response.json();

      // Log the response for debugging (omit sensitive data for security)
      const { token, refreshToken, ...logSafeData } = data; // eslint-disable-line @typescript-eslint/no-unused-vars
      console.log('Login response:', logSafeData);

      // Make sure the response has the expected format
      const formattedResponse = {
        emailAddress: body.emailAddress,
        loginSuccessful: true,
        token: data.token || data.auth_token || data.accessToken,
        refreshToken: data.refreshToken || data.refresh_token,
        userId: data.userId || (data.user && data.user.id) || '',
        accountId: data.accountId || (data.user && data.user.accountId) || '',
        firstName: data.firstName || (data.user && data.user.firstName) || '',
        lastName: data.lastName || (data.user && data.user.lastName) || '',
        user: data.user || {
          id: data.userId || '',
          accountId: data.accountId || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          emailAddress: body.emailAddress
        }
      };

      // Return the formatted response
      return NextResponse.json(formattedResponse);
    } catch (fetchError) {
      console.error('Fetch error during login:', fetchError);
      console.error('Error details:', JSON.stringify(fetchError, null, 2));

      // Return a specific error for fetch failures
      return NextResponse.json(
        {
          emailAddress: body.emailAddress,
          loginSuccessful: false,
          error: 'Unable to connect to the authentication server. Please try again later.'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    // Return a generic error response
    return NextResponse.json(
      {
        loginSuccessful: false,
        error: 'Failed to process login request'
      },
      { status: 500 }
    );
  }
}
