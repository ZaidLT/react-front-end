import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

const BYPASS_HEADER = 'x-vercel-protection-bypass';
const BYPASS_VALUE = PROTECTION_BYPASS_HEADER;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Get query parameters that might be needed
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const accountId = searchParams.get('accountId');

    // Build the URL with query parameters if provided
    const url = new URL(`${API_BASE_URL}/contacts/${resolvedParams.id}`);
    if (userId) url.searchParams.append('userId', userId);
    if (accountId) url.searchParams.append('accountId', accountId);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        [BYPASS_HEADER]: BYPASS_VALUE,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch contact', details: errorText },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Get contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Transform the request body to match the exact Swagger schema
    // Required fields according to Swagger: id, accountId, userId, firstName
    const transformedBody: any = {
      id: resolvedParams.id, // Include ID in body as required by Swagger
      accountId: body.Account_uniqueId,
      userId: body.User_uniqueId,
      firstName: body.FirstName || '',
    };

    // Optional fields - only include if they have valid values
    if (body.LastName && body.LastName.trim()) {
      transformedBody.lastName = body.LastName.trim();
    }

    if (body.DisplayName && body.DisplayName.trim()) {
      transformedBody.displayName = body.DisplayName.trim();
    }

    if (body.EmailAddress && body.EmailAddress.trim()) {
      transformedBody.emailAddress = body.EmailAddress.trim();
    }

    if (body.SecondaryEmailAddress && body.SecondaryEmailAddress.trim()) {
      transformedBody.secondaryEmailAddress = body.SecondaryEmailAddress.trim();
    }

    if (body.TertiaryEmailAddress && body.TertiaryEmailAddress.trim()) {
      transformedBody.tertiaryEmailAddress = body.TertiaryEmailAddress.trim();
    }

    if (body.Address && body.Address.trim()) {
      transformedBody.address = body.Address.trim();
    }

    if (body.SecondaryAddress && body.SecondaryAddress.trim()) {
      transformedBody.secondaryAddress = body.SecondaryAddress.trim();
    }

    if (body.TertiaryAddress && body.TertiaryAddress.trim()) {
      transformedBody.tertiaryAddress = body.TertiaryAddress.trim();
    }

    // Map phone number fields to match Swagger schema
    if (body.Cell_Phone_Number && body.Cell_Phone_Number.trim()) {
      transformedBody.phoneNumber = body.Cell_Phone_Number.trim();
    }

    if (body.Home_Phone_Number && body.Home_Phone_Number.trim()) {
      transformedBody.secondaryPhoneNumber = body.Home_Phone_Number.trim();
    }

    if (body.TertiaryPhoneNumber && body.TertiaryPhoneNumber.trim()) {
      transformedBody.tertiaryPhoneNumber = body.TertiaryPhoneNumber.trim();
    }

    // Map notes field
    if (body.Notes && body.Notes.trim()) {
      transformedBody.notes = body.Notes.trim();
    }

    // Map birthday field
    if (body.Birthday && body.Birthday.trim()) {
      transformedBody.birthday = body.Birthday.trim();
    }

    // Handle additional fields that might be present
    if (body.City && body.City.trim()) {
      transformedBody.city = body.City.trim();
    }

    if (body.State && body.State.trim()) {
      transformedBody.state = body.State.trim();
    }

    if (body.ZipCode && body.ZipCode.trim()) {
      transformedBody.zipCode = body.ZipCode.trim();
    }

    if (body.Country && body.Country.trim()) {
      transformedBody.country = body.Country.trim();
    }

    // Handle files array if present
    if (body.files && Array.isArray(body.files)) {
      transformedBody.files = body.files;
    }

    // Handle fileToDelete if present
    if (body.fileToDelete && body.fileToDelete.trim()) {
      transformedBody.fileToDelete = body.fileToDelete.trim();
    }

    // Forward the request to the backend API - use /contacts endpoint without ID in URL
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        [BYPASS_HEADER]: BYPASS_VALUE,
      },
      body: JSON.stringify(transformedBody),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to update contact', details: errorText },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
