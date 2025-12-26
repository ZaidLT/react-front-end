/**
 * Task Completion API Route
 *
 * This route handles completing tasks via the backend API.
 * Uses the specific completion endpoint: PUT /tasks/:id/complete
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const taskId = (await params).taskId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const userId = searchParams.get('userId');
  const completionDate = searchParams.get('completionDate');

  console.log(`Completing task: ${taskId}, account: ${accountId}, user: ${userId}`);

  try {
    // Validate required parameters
    if (!accountId || !userId) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          details: 'accountId and userId are required query parameters'
        },
        { status: 400 }
      );
    }

    // Build the completion URL with query parameters
    let apiUrl = `${API_BASE_URL}/tasks/${taskId}/complete?accountId=${accountId}&userId=${userId}`;
    if (completionDate) {
      apiUrl += `&completionDate=${encodeURIComponent(completionDate)}`;
    }

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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error completing task: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to complete task', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
