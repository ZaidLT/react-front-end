/**
 * Providers API Route
 * 
 * Handles CRUD operations for providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Account ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Proxy request to backend
    const backendUrl = `${API_BASE_URL}/providers/user/${userId}?accountId=${accountId}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', response.status, errorData);

      // Try to parse the backend error response, otherwise pass through as text
      let backendError;
      try {
        backendError = JSON.parse(errorData);
      } catch {
        backendError = { error: errorData };
      }

      return NextResponse.json(backendError, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Proxy request to backend
    const backendUrl = `${API_BASE_URL}/providers`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', response.status, errorData);

      // Try to parse the backend error response, otherwise pass through as text
      let backendError;
      try {
        backendError = JSON.parse(errorData);
      } catch {
        backendError = { error: errorData };
      }

      return NextResponse.json(backendError, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Proxy request to backend
    const backendUrl = `${API_BASE_URL}/providers`;

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', response.status, errorData);

      // Try to parse the backend error response, otherwise pass through as text
      let backendError;
      try {
        backendError = JSON.parse(errorData);
      } catch {
        backendError = { error: errorData };
      }

      return NextResponse.json(backendError, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in providers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, accountId, userId } = body;

    if (!id || !accountId || !userId) {
      return NextResponse.json(
        { error: 'ID, Account ID, and User ID are required' },
        { status: 400 }
      );
    }

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/providers`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
      },
      body: JSON.stringify({ id, accountId, userId }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', response.status, errorData);

      // Try to parse the backend error response, otherwise pass through as text
      let backendError;
      try {
        backendError = JSON.parse(errorData);
      } catch {
        backendError = { error: errorData };
      }

      return NextResponse.json(backendError, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in providers DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
