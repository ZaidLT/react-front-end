/**
 * OAuth Initiation API Route
 *
 * This route handles the initiation of OAuth login by forwarding the request
 * to the backend API and returning the OAuth URL to redirect to.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('OAuth initiate route called');
  
  try {
    // Parse the request body
    const body = await request.json();
    
    // Log the request for debugging
    console.log('OAuth initiate request body:', body);
    
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/login/oauth/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
      },
      body: JSON.stringify(body),
    });
    
    // Check if the response is OK
    if (!response.ok) {
      console.error(`OAuth initiate error: ${response.status} ${response.statusText}`);
      
      // Try to get the error message from the response
      let errorMessage = 'Failed to initiate OAuth login';
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
    console.log('OAuth initiate response:', data);
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('OAuth initiate error:', error);
    
    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to initiate OAuth login' },
      { status: 500 }
    );
  }
}
