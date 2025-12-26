/**
 * Test API Route
 *
 * This route is used to test that the API routes are working correctly.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('Test API route called');
  
  return NextResponse.json({
    success: true,
    message: 'API routes are working correctly',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  console.log('Test API POST route called');
  
  try {
    // Parse the request body
    const body = await request.json();
    
    // Log the request body
    console.log('Test API request body:', body);
    
    // Return a response
    return NextResponse.json({
      success: true,
      message: 'API POST route is working correctly',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test API error:', error);
    
    // Return an error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request' 
      },
      { status: 500 }
    );
  }
}
