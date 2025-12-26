/**
 * Users API Route
 *
 * This route handles creating new users in the hive.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('Create User route called');

  try {
    // Check for authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    console.log('Create user request body:', body);

    // Validate required fields (email is now optional for passive members)
    if (!body.accountId || !body.firstName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: accountId, firstName' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          'Authorization': authHeader
        },
        body: JSON.stringify(body)
      });

      const responseData = await response.json();
      console.log('Backend response status:', response.status);
      console.log('Backend response data:', responseData);

      if (!response.ok) {
        console.error('Backend API error:', responseData);

        // Log detailed validation errors if available
        if (responseData.details && responseData.details.validationErrors) {
          console.error('Validation errors:', JSON.stringify(responseData.details.validationErrors, null, 2));
        }

        return NextResponse.json(
          {
            success: false,
            error: responseData.message || 'Failed to create user',
            details: responseData
          },
          { status: response.status }
        );
      }

      // Return the created user data
      return NextResponse.json({
        success: true,
        data: responseData
      });

    } catch (backendError: any) {
      console.error('Error calling backend API:', backendError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to communicate with backend service',
          details: backendError.message
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error in create user route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
