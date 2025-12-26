import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

const BYPASS_HEADER = 'x-vercel-protection-bypass';
const BYPASS_VALUE = PROTECTION_BYPASS_HEADER;

export async function DELETE(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { id, accountId, userId } = body;

    if (!id || !accountId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required fields: id, accountId, and userId are required' 
      }, { status: 400 });
    }

    console.log(`Deleting contact with id: ${id}`);

    // Make request to the backend API
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        [BYPASS_HEADER]: BYPASS_VALUE,
      },
      body: JSON.stringify({
        id,
        accountId,
        userId,
      }),
    });

    if (!response.ok) {
      console.error(`Delete contact API returned ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to delete contact' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Contact deleted successfully');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
