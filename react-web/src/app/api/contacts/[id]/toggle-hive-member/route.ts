import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

const BYPASS_HEADER = 'x-vercel-protection-bypass';
const BYPASS_VALUE = PROTECTION_BYPASS_HEADER;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const contactId = resolvedParams.id;
    
    console.log('Toggle hive member route called for contact ID:', contactId);
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();
    const { accountId, userId, enabled, activeFamilyMember } = body;

    if (!accountId || !userId || typeof enabled !== 'boolean') {
      return NextResponse.json({
        error: 'Missing required fields: accountId, userId, and enabled are required'
      }, { status: 400 });
    }

    // Default activeFamilyMember to true if not provided (for backward compatibility)
    const isActiveFamilyMember = activeFamilyMember !== undefined ? activeFamilyMember : true;

    console.log('Toggle hive member request:', { contactId, accountId, userId, enabled });

    // Make request to the backend API
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}/toggle-hive-member`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        [BYPASS_HEADER]: BYPASS_VALUE,
      },
      body: JSON.stringify({
        accountId,
        userId,
        enabled,
        activeFamilyMember: isActiveFamilyMember,
      }),
    });

    if (!response.ok) {
      console.error(`Toggle hive member API returned ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      // Try to parse error response
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: 'Failed to toggle hive member status' };
      }
      
      return NextResponse.json(
        { error: errorData.message || 'Failed to toggle hive member status' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Toggle hive member successful:', result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error toggling hive member:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
