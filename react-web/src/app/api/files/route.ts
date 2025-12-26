/**
 * Files API Route
 *
 * This route handles creating, updating, and deleting files in the backend API.
 * Supports file upload via multipart/form-data and file metadata management.
 *
 * API Reference: https://node-backend-dev-eeva.vercel.app
 * Backend Endpoint: https://node-backend-eeva.vercel.app/api/files
 *
 * Supported Operations:
 * - POST: Create/upload new file (multipart/form-data with file and metadata)
 * - PUT: Update existing file metadata (requires id, accountId, userId)
 * - DELETE: Delete file (requires id, accountId, userId)
 * - GET: Fetch files (requires accountId, userId query params)
 *
 * Headers:
 * - x-vercel-protection-bypass: Required for backend access
 * - Authorization: Bearer token from client
 * - Content-Type: multipart/form-data for uploads, application/json for other operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('Creating/uploading new file');

  try {
    const contentType = request.headers.get('content-type');
    // Use env flag to control proxy debug (preferred)
    const debugProxy = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';

    // Handle both JSON (base64) and FormData uploads
    if (contentType?.includes('application/json')) {
      // Handle JSON payload with base64 file
      const body = await request.json();
      const { accountId, userId, filename, file, tileId, contactId, homeMembers, delegateUserId, associationType, associationId } = body;

      console.log('File upload request (JSON/base64):', {
        accountId,
        userId,
        filename,
        hasFile: !!file,
        fileType: typeof file,
        fileLength: file ? file.length : 0,
        filePreview: file ? file.substring(0, 50) + '...' : 'NO FILE DATA',
        tileId,
        contactId,
        homeMembers,
        delegateUserId
      });

      // Log the full request body structure
      console.log('📋 Full request body keys:', Object.keys(body));
      console.log('📋 Request body structure:', {
        ...body,
        file: file ? `[BASE64 DATA - ${file.length} characters]` : 'NO FILE DATA'
      });

      // Validate required fields
      if (!accountId || !userId || !filename || !file) {
        return NextResponse.json(
          {
            error: 'Missing required fields',
            details: 'accountId, userId, filename, and file (base64) are required fields',
            received: {
              accountId: !!accountId,
              userId: !!userId,
              filename: !!filename,
              file: !!file
            }
          },
          { status: 400 }
        );
      }

      // Build the URL with accountId query parameter
      const apiUrl = `${API_BASE_URL}/files?accountId=${accountId}`;

      if (debugProxy) {
        console.log('🔭 PROXY DEBUG (JSON Upload) → Backend URL:', apiUrl);
        console.log('🔭 PROXY DEBUG (JSON Upload) → Headers:', {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          ...(request.headers.get('Authorization') ? { 'Authorization': request.headers.get('Authorization') as string } : {})
        });
        console.log('🔭 PROXY DEBUG (JSON Upload) → Body:', {
          accountId,
          userId,
          filename,
          file: file ? `[BASE64 DATA - ${file.length} characters]` : 'NO FILE DATA',
          ...(tileId && { tileId }),
          ...(contactId && { contactId }),
          ...(homeMembers && { homeMembers }),
          ...(delegateUserId && { delegateUserId }),
          ...(associationType && { associationType }),
          ...(associationId && { associationId })
        });
      }

      // Send JSON payload to backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          // Forward the authorization header if present
          ...(request.headers.get('Authorization')
            ? { 'Authorization': request.headers.get('Authorization') as string }
            : {})
        },
        body: JSON.stringify({
          accountId,
          userId,
          filename,
          file,
          ...(tileId && { tileId }),
          ...(contactId && { contactId }),
          ...(homeMembers && { homeMembers }),
          ...(delegateUserId && { delegateUserId }),
          ...(associationType && { associationType }),
          ...(associationId && { associationId })
        }),
      });

      if (!response.ok) {
        console.error(`Error creating file: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        return NextResponse.json(
          { error: 'Failed to create file', details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('✅ File creation successful - Backend response received');

      // Enhanced logging for document API response
      console.log('📄 Backend API Response Details:');
      console.log('- Response status:', response.status);
      console.log('- Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('- Full backend response:', JSON.stringify(data, null, 2));

      // Check for file URL in backend response
      if (data.fileUrl || data.file_url || data.url || data.storageProviderId) {
        console.log('🔗 File-related data found in backend response:');
        console.log('- fileUrl:', data.fileUrl);
        console.log('- file_url:', data.file_url);
        console.log('- url:', data.url);
        console.log('- storageProviderId:', data.storageProviderId);
      } else {
        console.log('⚠️ No file URL found in backend response. Available keys:', Object.keys(data));
      }

      // Log any file-related properties from backend
      const fileProps = Object.keys(data).filter(key =>
        key.toLowerCase().includes('file') ||
        key.toLowerCase().includes('url') ||
        key.toLowerCase().includes('path') ||
        key.toLowerCase().includes('storage')
      );
      if (fileProps.length > 0) {
        console.log('📁 File-related properties in backend response:', fileProps.map(key => `${key}: ${data[key]}`));
      }

      return NextResponse.json(data);
    } else {
      // Handle multipart form data for file uploads (legacy support)
      const formData = await request.formData();

      // Extract metadata from form data
      const accountId = formData.get('accountId') as string;
      const userId = formData.get('userId') as string;
      const filename = formData.get('filename') as string;
      const file = formData.get('file') as File;
      const description = formData.get('description') as string | null;
      const tileId = formData.get('tileId') as string;
      const contactId = formData.get('contactId') as string;
      const homeMembersStr = formData.get('homeMembers') as string;
      const delegateUserId = formData.get('delegateUserId') as string;
      const associationType = formData.get('associationType') as string;
      const associationId = formData.get('associationId') as string;

      console.log('File upload request (FormData):', {
        accountId,
        userId,
        filename,
        fileSize: file?.size,
        fileType: file?.type,
        description,
        tileId,
        contactId,
        homeMembers: homeMembersStr,
        delegateUserId,
        associationType,
        associationId
      });



      // Validate required fields
      if (!accountId || !userId || !filename) {
        return NextResponse.json(
          {
            error: 'Missing required fields',
            details: 'accountId, userId, and filename are required fields',
            received: {
              accountId: !!accountId,
              userId: !!userId,
              filename: !!filename
            }
          },
          { status: 400 }
        );
      }

      // Build the URL with accountId query parameter
      const apiUrl = `${API_BASE_URL}/files?accountId=${accountId}`;

      // Create new FormData for backend request
      const backendFormData = new FormData();
      backendFormData.append('accountId', accountId);
      backendFormData.append('userId', userId);
      backendFormData.append('filename', filename);

      if (file) {
        backendFormData.append('file', file);
      }

      if (description && description.trim().length > 0) {
        backendFormData.append('description', description);
      }

      // Add attribution fields if provided
      if (tileId) {
        backendFormData.append('tileId', tileId);
      }

      if (contactId) {
        backendFormData.append('contactId', contactId);
      }

      if (homeMembersStr) {
        backendFormData.append('homeMembers', homeMembersStr);
      }

      if (delegateUserId) {
        backendFormData.append('delegateUserId', delegateUserId);
      }
      if (associationType) {
        backendFormData.append('associationType', associationType);
      }
      if (associationId) {
        backendFormData.append('associationId', associationId);
      }

      if (debugProxy) {
        const previewEntries: Record<string, string> = {};
        for (const [k, v] of backendFormData.entries()) {
          previewEntries[k] = k === 'file' ? '[BINARY FILE]' : String(v);
        }
        console.log('🔭 PROXY DEBUG (FormData Upload) → Backend URL:', apiUrl);
        console.log('🔭 PROXY DEBUG (FormData Upload) → Headers:', {
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          ...(request.headers.get('Authorization') ? { 'Authorization': request.headers.get('Authorization') as string } : {})
        });
        console.log('🔭 PROXY DEBUG (FormData Upload) → FormData entries:', previewEntries);
      }

      // Forward the request to the backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          // Forward the authorization header if present
          ...(request.headers.get('Authorization')
            ? { 'Authorization': request.headers.get('Authorization') as string }
            : {})
          // Note: Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: backendFormData,
      });

      if (!response.ok) {
        console.error(`Error creating file: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        return NextResponse.json(
          { error: 'Failed to create file', details: errorText },
          { status: response.status }
        );
      }

      const data = await response.json();
      console.log('✅ File creation successful - Backend response received (FormData)');

      // Enhanced logging for document API response (FormData path)
      console.log('📄 Backend API Response Details (FormData):');
      console.log('- Response status:', response.status);
      console.log('- Full backend response:', JSON.stringify(data, null, 2));

      // Check for file URL in backend response
      if (data.fileUrl || data.file_url || data.url || data.storageProviderId) {
        console.log('🔗 File-related data found in backend response (FormData):');
        console.log('- fileUrl:', data.fileUrl);
        console.log('- file_url:', data.file_url);
        console.log('- url:', data.url);
        console.log('- storageProviderId:', data.storageProviderId);
      } else {
        console.log('⚠️ No file URL found in backend response (FormData). Available keys:', Object.keys(data));
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error creating file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('Fetching files');

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');
    const includeOnlyThisWeeksItems = searchParams.get('includeOnlyThisWeeksItems');

    // Build the URL with query parameters
    let apiUrl = `${API_BASE_URL}/files`;
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId);
    if (userId) params.append('userId', userId);
    if (includeOnlyThisWeeksItems) params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems);

    if (params.toString()) {
      apiUrl += `?${params.toString()}`;
    }

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
    });

    if (!response.ok) {
      console.error(`Error fetching files: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch files' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log('Updating file metadata');

  try {
    const body = await request.json();
    console.log('File update request body:', JSON.stringify(body, null, 2));

    // Validate required fields for updates
    if (!body.id || !body.accountId || !body.userId) {
      return NextResponse.json(
        {
          error: 'Missing required fields for update',
          details: 'id, accountId, and userId are required fields for updates',
          received: {
            id: !!body.id,
            accountId: !!body.accountId,
            userId: !!body.userId
          }
        },
        { status: 400 }
      );
    }

    // Build URL with file ID and accountId query parameter
    const apiUrl = `${API_BASE_URL}/files/${body.id}?accountId=${body.accountId}`;

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Error updating file: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to update file' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log('Deleting file');

  try {
    const body = await request.json();
    console.log('File deletion request body:', JSON.stringify(body, null, 2));

    // Validate required fields for deletion
    if (!body.id || !body.accountId || !body.userId) {
      return NextResponse.json(
        {
          error: 'Missing required fields for deletion',
          details: 'id, accountId, and userId are required fields for deletion',
          received: {
            id: !!body.id,
            accountId: !!body.accountId,
            userId: !!body.userId
          }
        },
        { status: 400 }
      );
    }

    // Build URL with file ID and accountId query parameter
    const apiUrl = `${API_BASE_URL}/files/${body.id}?accountId=${body.accountId}`;

    // Forward the request to the backend API
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Error deleting file: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
