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
    console.log('Update contact route called for ID:', resolvedParams.id);

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data for file uploads
      const formData = await request.formData();

      // Create a new FormData object to forward to the backend
      const backendFormData = new FormData();

      // Copy all form fields to the backend FormData
      for (const [key, value] of formData.entries()) {
        if (key === 'avatarImages' && value instanceof File) {
          // Handle avatar image file
          backendFormData.append('files', value, value.name);
        } else {
          // Handle regular form fields
          backendFormData.append(key, value as string);
        }
      }

      // Ensure ID is set from the URL parameter
      backendFormData.set('id', resolvedParams.id);

      // Validate required fields
      const accountId = formData.get('accountId') as string;
      const userId = formData.get('userId') as string;
      const firstName = formData.get('firstName') as string;

      if (!accountId || !userId || !firstName) {
        return NextResponse.json(
          { error: 'Missing required fields: accountId, userId, and firstName are required' },
          { status: 400 }
        );
      }

      // Forward the multipart request to the backend API
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          [BYPASS_HEADER]: BYPASS_VALUE,
          // Don't set Content-Type for FormData - let fetch set it with boundary
        },
        body: backendFormData,
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
    } else {
      // Handle JSON request (existing functionality)
      const body = await request.json();

      // The body now contains the correct lowercase field names that match the backend schema
      // We can pass it directly with minimal validation
      const transformedBody: any = {
        ...body, // Use the body as-is since it now has correct field names
        id: resolvedParams.id, // Ensure ID is set from the URL parameter
      };

      // Validate required fields
      if (!transformedBody.accountId || !transformedBody.userId || !transformedBody.firstName) {
        return NextResponse.json(
          { error: 'Missing required fields: accountId, userId, and firstName are required' },
          { status: 400 }
        );
      }

      // Forward the request to the backend API - use PUT method as per Swagger
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
          { error: 'Failed to update contact' },
          { status: response.status }
        );
      }
    }
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
