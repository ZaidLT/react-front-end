/**
 * Task API Route
 *
 * This route handles fetching a specific task from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const taskId = (await params).taskId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  console.log(`Fetching task: ${taskId}, account: ${accountId}`);

  try {
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}?accountId=${accountId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
    });

    if (!response.ok) {
      console.error(`Error fetching task: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch task' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const taskId = (await params).taskId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const userId = searchParams.get('userId');

  console.log(`Deleting task: ${taskId}, account: ${accountId}, user: ${userId}`);

  if (!accountId || !userId) {
    return NextResponse.json(
      { error: 'Missing required parameters: accountId and userId' },
      { status: 400 }
    );
  }

  try {
    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}?accountId=${accountId}&userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
        // Forward the authorization header if present
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') as string }
          : {})
      },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const taskId = (await params).taskId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');

  console.log(`Updating task: ${taskId}, account: ${accountId}`);

  try {
    const body = await request.json();

    // Ensure the task ID matches the URL parameter
    body.id = taskId;

    console.log('Updating task with data:', body);

    // Forward the request to the backend API using the Swagger-documented format
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}?accountId=${accountId}`, {
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
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to update task', details: errorText },
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
