/**
 * User Profile Update API Route
 *
 * This route handles updating user profile data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = (await params).id;

  try {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    let requestBody: FormData;

    if (contentType.includes('application/json')) {
      // Handle JSON requests from userService
      const jsonData = await request.json();

      // Convert JSON to FormData for backend compatibility
      requestBody = new FormData();
      Object.keys(jsonData).forEach(key => {
        if (jsonData[key] !== undefined && jsonData[key] !== null) {
          requestBody.append(key, String(jsonData[key]));
        }
      });
    } else {
      // Handle FormData requests (for file uploads)
      requestBody = await request.formData();
    }

    // Forward the request to the backend API with FormData
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          'Authorization': authHeader
          // Don't set Content-Type - let fetch handle it for FormData
        },
        body: requestBody
      });

      if (!response.ok) {
        console.error(`Error updating user: ${response.status} ${response.statusText}`);

        // Try to get the error message from the response
        let errorMessage = 'Failed to update user profile';
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

        if (response.status === 404) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: response.status }
        );
      }

      // Parse the response
      const data = await response.json();

      // Return the updated user data
      return NextResponse.json({
        success: true,
        user: data
      });
    } catch (fetchError) {
      console.error('Fetch error during user update:', fetchError);

      // Return a specific error for fetch failures
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to connect to the server. Please try again later.'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('User update error:', error);

    // Return a generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process user update request' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = (await params).id;

  console.log(`Fetching user profile: ${userId}`);

  try {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Get account ID from query parameters or extract from token
    const accountId = request.nextUrl.searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    try {
      const response = await fetch(`${API_BASE_URL}/users/${accountId}/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          'Authorization': authHeader
        }
      });

      if (!response.ok) {
        console.error(`Error fetching user: ${response.status} ${response.statusText}`);

        // Try to get the error message from the response
        let errorMessage = 'Failed to fetch user profile';
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

        if (response.status === 404) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
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
      console.log('User profile fetched successfully');

      // Return the user data
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Fetch error during user fetch:', fetchError);

      // Return a specific error for fetch failures
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to connect to the server. Please try again later.'
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('User fetch error:', error);

    // Return a generic error response
    return NextResponse.json(
      { success: false, error: 'Failed to process user fetch request' },
      { status: 500 }
    );
  }
}
