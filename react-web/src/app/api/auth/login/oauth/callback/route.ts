/**
 * OAuth Callback API Route
 *
 * This route handles the OAuth callback by forwarding the request
 * to the backend API and returning the authentication tokens.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('OAuth callback route called');
  
  try {
    // Parse the request body
    const body = await request.json();
    
    // Log the request for debugging
    console.log('OAuth callback request body:', body);
    
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/login/oauth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
      },
      body: JSON.stringify(body),
    });
    
    // Check if the response is OK
    if (!response.ok) {
      console.error(`OAuth callback error: ${response.status} ${response.statusText}`);
      
      // Try to get the error message from the response
      let errorMessage = 'Failed to complete OAuth authentication';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Ignore JSON parsing errors
      }
      
      // Return an error response
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }
    
    // Parse the response
    const data = await response.json();
    console.log('OAuth callback response:', data);
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to complete OAuth authentication' },
      { status: 500 }
    );
  }
}
