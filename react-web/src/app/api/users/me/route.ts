/**
 * Current User API Route
 *
 * This route handles fetching the current user data based on the authentication token.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';
import { extractUserMetadata, hasUserMetadata } from '../../../../util/jwtUtils';

// Parse JWT token to get payload
const parseJwt = (token: string): any => {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    try {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

export async function GET(request: NextRequest) {
  console.log('Current user route called');

  try {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Invalid authorization header format' },
        { status: 401 }
      );
    }

    // Forward the request to the backend API
    try {
      // Check if token contains the new user_metadata structure
      if (hasUserMetadata(token)) {
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
          console.log('Using user_metadata from token for /users/me');
        }

        const userMetadata = extractUserMetadata(token);
        if (!userMetadata) {
          return NextResponse.json(
            { success: false, error: 'Invalid token: could not extract user metadata' },
            { status: 401 }
          );
        }

        if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
          console.log(`Extracted user metadata from token: userId=${userMetadata.userId}, accountId=${userMetadata.accountId}`);
        }

        // With user_metadata, we can potentially skip the backend call and return the data directly
        // However, for now, we'll still call the backend to get complete user data
        // but we have the userId and accountId readily available from the token

        // Call the backend with the extracted user information
        const response = await fetch(`${API_BASE_URL}/users/getUser`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
            'Authorization': authHeader
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Backend response for user with metadata:', data);
          return NextResponse.json(data);
        } else {
          console.error('Backend request failed for user with metadata:', response.status, response.statusText);
          return NextResponse.json(
            { success: false, error: 'Failed to fetch user data from backend' },
            { status: response.status }
          );
        }
      } else {
        // Fallback to legacy token processing
        if (process.env.NEXT_PUBLIC_AUTH_DEBUG_MODE === 'true') {
          console.log('Using legacy token format for /users/me');
        }

        // Extract user ID from the token
        const tokenPayload = parseJwt(token);
        console.log('Token payload:', tokenPayload);

        if (!tokenPayload || (!tokenPayload.userId && !tokenPayload.sub)) {
          return NextResponse.json(
            { success: false, error: 'Invalid token: could not extract user ID' },
            { status: 401 }
          );
        }

        // Get the user ID from the token
        const userId = tokenPayload.userId || tokenPayload.sub;
        const accountId = tokenPayload.accountId || '';

        console.log(`Extracted user ID from token (legacy): ${userId}, account ID: ${accountId}`);
      }

      // Call the appropriate backend endpoint to get user data
      const response = await fetch(`${API_BASE_URL}/users/getUser`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          'Authorization': authHeader
        }
      });

      if (!response.ok) {
        console.error(`Error fetching current user: ${response.status} ${response.statusText}`);

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

      // Log the response for debugging (omit sensitive data)
      console.log('Current user response received successfully');

      // Return the user data
      return NextResponse.json(data);
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
    console.error('Current user error:', error);

    // Return a generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process user data request' },
      { status: 500 }
    );
  }
}
