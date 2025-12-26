import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

const BYPASS_HEADER = 'x-vercel-protection-bypass';
const BYPASS_VALUE = PROTECTION_BYPASS_HEADER;

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data for file uploads
      // Since backend POST /contacts doesn't support files, we need a two-step process:
      // 1. Create contact without image (JSON)
      // 2. Update contact with image (multipart)

      const formData = await request.formData();

      // Extract the image file
      const avatarFile = formData.get('avatarImages') as File | null;

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

      // Step 1: Create contact without image using JSON
      const contactData: any = {
        accountId,
        userId,
        firstName,
      };

      // Add optional fields
      const optionalFields = [
        'lastName', 'displayName', 'emailAddress', 'secondaryEmailAddress', 'tertiaryEmailAddress',
        'address', 'secondaryAddress', 'tertiaryAddress', 'city', 'state', 'zipCode', 'country',
        'phoneNumber', 'secondaryPhoneNumber', 'tertiaryPhoneNumber', 'notes', 'birthday',
        'type', 'relationship', 'mobileDeviceContactId', 'invitedUserId', 'relevantNotes'
      ];

      for (const field of optionalFields) {
        const value = formData.get(field);
        if (value && value !== '') {
          contactData[field] = value;
        }
      }

      // Ensure lastName is not undefined
      if (!contactData.lastName) {
        contactData.lastName = '';
      }

      // Create the contact first
      const createResponse = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          [BYPASS_HEADER]: BYPASS_VALUE,
        },
        body: JSON.stringify(contactData),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Backend API error during contact creation:', createResponse.status, errorText);
        return NextResponse.json(
          { error: 'Failed to create contact', details: errorText },
          { status: createResponse.status }
        );
      }

      const createdContact = await createResponse.json();
      const contactId = createdContact.contact?.id;

      if (!contactId) {
        console.error('No contact ID returned from creation');
        return NextResponse.json(
          { error: 'Contact created but no ID returned' },
          { status: 500 }
        );
      }

      // Step 2: If there's an image, update the contact with the image
      if (avatarFile) {
        const updateFormData = new FormData();

        // Add all the contact data to the update form
        updateFormData.append('id', contactId);
        updateFormData.append('accountId', accountId);
        updateFormData.append('userId', userId);
        updateFormData.append('firstName', firstName);

        // Add optional fields to update form
        for (const field of optionalFields) {
          const value = formData.get(field);
          if (value && value !== '') {
            updateFormData.append(field, value as string);
          }
        }

        // Ensure lastName is included
        if (!updateFormData.has('lastName')) {
          updateFormData.append('lastName', '');
        }

        // Add the image file
        updateFormData.append('files', avatarFile, avatarFile.name);

        // Update the contact with the image
        const updateResponse = await fetch(`${API_BASE_URL}/contacts`, {
          method: 'PUT',
          headers: {
            'Authorization': authHeader,
            [BYPASS_HEADER]: BYPASS_VALUE,
            // Don't set Content-Type for FormData - let fetch set it with boundary
          },
          body: updateFormData,
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Backend API error during contact update with image:', updateResponse.status, errorText);
          // Return the created contact even if image upload failed
          console.warn('Contact created successfully but image upload failed');
          return NextResponse.json(createdContact);
        } else {
          // Return the updated contact with image
          const updatedContact = await updateResponse.json();
          return NextResponse.json(updatedContact);
        }
      }

      // Return the created contact (no image provided)
      return NextResponse.json(createdContact);
    } else {
      // Handle JSON request (existing functionality)
      const body = await request.json();

      // The request body now contains correct lowercase field names that match the backend schema
      // We can use it directly with minimal validation
      const transformedBody: any = {
        ...body, // Use the body as-is since it now has correct field names
      };

      // Validate required fields
      if (!transformedBody.accountId || !transformedBody.userId || !transformedBody.firstName) {
        return NextResponse.json(
          { error: 'Missing required fields: accountId, userId, and firstName are required' },
          { status: 400 }
        );
      }

      // Ensure lastName is not undefined (set to empty string if not provided)
      if (!transformedBody.lastName) {
        transformedBody.lastName = '';
      }

      // Forward the request to the backend API
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
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
          { error: 'Failed to create contact', details: errorText },
          { status: response.status }
        );
      }
    }
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
