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
    const { contacts } = body;

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Contacts array required' }, { status: 400 });
    }

    console.log(`Deleting ${contacts.length} contacts`);

    // Make request to the backend API
    const response = await fetch(`${API_BASE_URL}/contacts/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        [BYPASS_HEADER]: BYPASS_VALUE,
      },
      body: JSON.stringify({ contacts }),
    });

    if (!response.ok) {
      console.error(`Delete contacts API returned ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to delete contacts' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Contacts deleted successfully');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
