import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://node-backend-eeva.vercel.app/api';
const VERCEL_PROTECTION_BYPASS = process.env.VERCEL_PROTECTION_BYPASS || '0a2eba8c751892e035f6b96605600fae';

/**
 * GET /api/dents/contacts/[contactId]
 * 
 * Proxy endpoint for fetching DENTS (Documents, Events, Notes, Tasks) data for a specific contact.
 * This endpoint forwards requests to the backend DENTS API.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const { contactId } = params;
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');
    const contentTypes = searchParams.get('contentTypes');
    const includeDeleted = searchParams.get('includeDeleted');
    
    // Validate required parameters
    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: accountId and userId are required' },
        { status: 400 }
      );
    }
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }
    
    // Build the backend API URL (note: using "contacts" plural)
    const backendUrl = new URL(`${API_BASE_URL}/dents/contacts/${contactId}`);
    backendUrl.searchParams.set('accountId', accountId);
    backendUrl.searchParams.set('userId', userId);
    
    if (contentTypes) {
      backendUrl.searchParams.set('contentTypes', contentTypes);
    }
    
    if (includeDeleted) {
      backendUrl.searchParams.set('includeDeleted', includeDeleted);
    }
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_API] Proxying request to:', backendUrl.toString());
    }
    
    // Forward the request to the backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': VERCEL_PROTECTION_BYPASS,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DENTS_API] Backend request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url: backendUrl.toString()
      });
      
      return NextResponse.json(
        { 
          error: `Backend request failed: ${response.status} ${response.statusText}`,
          details: errorText 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_API] Successfully fetched contact dents:', {
        contactId,
        counts: data.counts,
        entityType: data.entityType
      });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('[DENTS_API] Error in contact dents proxy:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
