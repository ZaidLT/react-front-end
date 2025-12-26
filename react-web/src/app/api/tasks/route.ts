/**
 * Tasks API Route
 *
 * This route handles creating, updating, and deleting tasks in the backend API.
 * Updated to support the full API reference document specification (June 2025).
 *
 * API Reference: https://node-backend-dev-eeva.vercel.app
 * Backend Endpoint: https://node-backend-eeva.vercel.app/api/tasks
 *
 * Supported Operations:
 * - POST: Create new task (requires userId, accountId, title)
 * - PUT: Update existing task (requires id, accountId, userId)
 * - DELETE: Delete task (requires id, accountId, userId)
 * - GET: Fetch tasks (requires accountId, userId query params)
 *
 * Validation (API Reference Compliant):
 * - Required fields validation for all operations
 * - Title length validation (1-256 characters)
 * - Proper error responses with details
 *
 * Headers:
 * - x-vercel-protection-bypass: Required for backend access
 * - Authorization: Bearer token from client
 * - Content-Type: application/json
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function POST(request: NextRequest) {
  console.log('Creating new task with API reference compliance');

  try {
    const body = await request.json();
    console.log('Task creation request body:', JSON.stringify(body, null, 2));

    // Validate required fields as per API reference
    if (!body.userId || !body.accountId || !body.title) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'userId, accountId, and title are required fields',
          received: {
            userId: !!body.userId,
            accountId: !!body.accountId,
            title: !!body.title
          }
        },
        { status: 400 }
      );
    }

    // Validate title length (1-256 characters as per API reference)
    if (body.title.length < 1 || body.title.length > 256) {
      return NextResponse.json(
        {
          error: 'Invalid title length',
          details: 'Title must be between 1 and 256 characters',
          titleLength: body.title.length
        },
        { status: 400 }
      );
    }

    // Get accountId from query params if provided (for backward compatibility)
    const { searchParams } = new URL(request.url);
    const queryAccountId = searchParams.get('accountId');
    console.log('Account ID from query params:', queryAccountId);

    // Use accountId from body, fallback to query params
    const finalAccountId = body.accountId || queryAccountId;

    // Handle property tiles: if tileId matches userId, generate proper property tile ID
    let processedBody = { ...body };
    console.log('🔍 Task API - Checking property tile detection - tileId:', body.tileId, 'userId:', body.userId, 'match:', body.tileId === body.userId);
    if (body.tileId && body.tileId === body.userId) {
      // This is a property tile, try to determine the property type from the task title or other context
      // For now, we'll use a default property type (35 = Mortgage) as a fallback
      // In a real implementation, you might want to pass the property type as a parameter
      const deterministicPropertyTileId = `${body.userId}-35`; // Default to Mortgage type
      processedBody.tileId = deterministicPropertyTileId;
      console.log('🔧 Property tile detected in API - Original tileId:', body.tileId, 'Generated tileId:', deterministicPropertyTileId);
    }

    // Build the URL with accountId query parameter (required by API)
    let apiUrl = `${API_BASE_URL}/tasks`;
    if (finalAccountId) {
      apiUrl += `?accountId=${finalAccountId}`;
    }

    // Forward the request to the backend API
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
      body: JSON.stringify(processedBody),
    });

    if (!response.ok) {
      console.error(`Error creating task: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to create task', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Task creation successful - Backend response received');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('Fetching tasks');

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');

    // Build the URL with query parameters
    let apiUrl = `${API_BASE_URL}/tasks`;
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId);
    if (userId) params.append('userId', userId);

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
      console.error(`Error fetching tasks: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch tasks' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log('Updating task with API reference compliance');

  try {
    const body = await request.json();
    console.log('Task update request body:', JSON.stringify(body, null, 2));

    // Validate required fields for updates as per API reference
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

    // Validate title length if provided
    if (body.title && (body.title.length < 1 || body.title.length > 256)) {
      return NextResponse.json(
        {
          error: 'Invalid title length',
          details: 'Title must be between 1 and 256 characters',
          titleLength: body.title.length
        },
        { status: 400 }
      );
    }

    // Build URL with task ID and accountId query parameter
    const apiUrl = `${API_BASE_URL}/tasks/${body.id}?accountId=${body.accountId}`;

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
      console.error(`Error updating task: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  console.log('Deleting task with API reference compliance');

  try {
    const body = await request.json();
    console.log('Task deletion request body:', JSON.stringify(body, null, 2));

    // Validate required fields for deletion as per API reference
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

    // Build URL with RESTful pattern: /tasks/{taskId}?accountId={accountId}&userId={userId}
    const apiUrl = `${API_BASE_URL}/tasks/${body.id}?accountId=${body.accountId}&userId=${body.userId}`;

    // Forward the request to the backend API using RESTful pattern
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
      // No body needed for RESTful DELETE - all data is in URL path and query params
    });

    if (!response.ok) {
      console.error(`Error deleting task: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
