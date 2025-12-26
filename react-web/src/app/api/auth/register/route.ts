/**
 * Register API Route
 *
 * This route handles user registration by forwarding the request
 * to the backend API and returning the registration result.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('Register route called');
  
  try {
    // Parse the request body
    const body = await request.json();
    
    // Log the request for debugging (omit password for security)
    const { password, ...logSafeBody } = body; // eslint-disable-line @typescript-eslint/no-unused-vars
    console.log('Register request body:', logSafeBody);
    
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
      },
      body: JSON.stringify(body),
    });
    
    // Check if the response is OK
    if (!response.ok) {
      console.error(`Register error: ${response.status} ${response.statusText}`);
      
      // Try to get the error message from the response
      let errorMessage = 'Failed to register';
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
    console.log('Register response:', data);
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Register error:', error);
    
    // Return a generic error response
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
