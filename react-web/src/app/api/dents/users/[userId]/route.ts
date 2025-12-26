import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://node-backend-eeva.vercel.app/api';
const BYPASS_HEADER = process.env.NEXT_PUBLIC_VERCEL_PROTECTION_BYPASS || '0a2eba8c751892e035f6b96605600fae';

/**
 * GET /api/dents/users/[userId]
 * 
 * Proxy endpoint for fetching DENTS (Documents, Events, Notes, Tasks) data for a specific user.
 * This endpoint forwards requests to the backend DENTS API.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const accountId = searchParams.get('accountId');
    const requestingUserId = searchParams.get('userId');
    const contentTypes = searchParams.get('contentTypes');
    const includeDeleted = searchParams.get('includeDeleted');

    // Validate required parameters
    if (!accountId || !requestingUserId) {
      return NextResponse.json(
        { error: 'Missing required parameters: accountId and userId' },
        { status: 400 }
      );
    }

    // Build query string for backend API
    const backendParams = new URLSearchParams({
      accountId,
      userId: requestingUserId,
    });

    if (contentTypes) {
      backendParams.append('contentTypes', contentTypes);
    }

    if (includeDeleted) {
      backendParams.append('includeDeleted', includeDeleted);
    }

    // Forward request to backend API
    const backendUrl = `${API_BASE_URL}/dents/users/${userId}?${backendParams.toString()}`;
    
    // Get authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': BYPASS_HEADER,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Backend API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in user DENTS proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
