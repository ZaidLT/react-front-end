/**
 * OAuth Apple API Route
 *
 * This route handles the initiation of Apple OAuth login by forwarding the request
 * to the backend API and returning the OAuth URL to redirect to.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('OAuth Apple route called');
  
  try {
    // Parse the request body
    const body = await request.json();
    
    // Log the request for debugging
    console.log('OAuth Apple request body:', body);
    
    // Forward the request to the backend API using the alternative endpoint format
    const response = await fetch(`${API_BASE_URL}/auth/oauth/apple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
      },
      body: JSON.stringify(body),
    });
    
    // Check if the response is OK
    if (!response.ok) {
      console.error(`OAuth Apple error: ${response.status} ${response.statusText}`);
      
      // Try to get the error message from the response
      let errorMessage = 'Failed to initiate Apple OAuth login';
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
    console.log('OAuth Apple response:', data);
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('OAuth Apple error:', error);
    
    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to initiate Apple OAuth login' },
      { status: 500 }
    );
  }
}
