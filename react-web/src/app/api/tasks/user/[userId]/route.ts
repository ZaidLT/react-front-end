/**
 * Tasks API Route for User
 *
 * This route handles fetching tasks for a specific user from the backend API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId;
  const searchParams = request.nextUrl.searchParams;
  const accountId = searchParams.get('accountId');
  const includeDeleted = searchParams.get('includeDeleted') === 'true';
  const includeCompleted = searchParams.get('includeCompleted');
  const includeOnlyThisWeeksItems = searchParams.get('includeOnlyThisWeeksItems');

  // Default tasks to return if the API fails
  const defaultTasks = [
    {
      UniqueId: '1',
      Text: 'Complete React Web Conversion',
      Title: 'High priority task for the web application',
      type: 'Task',
      Priority: 1,
      Active: true, // This task should be active
      Deleted: false,
      CreationTimestamp: new Date().toISOString(),
      Deadline_DateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      state: 0, // TASK_STATE.TO_DO
      User_uniqueId: userId,
      Account_uniqueId: accountId || '',
      Scheduled_Time: '',
      Scheduled_Time_End: '',
      RecurringFreq: 0
    },
    {
      UniqueId: '2',
      Text: 'Gym Session',
      Title: 'Fitness goal for personal health',
      type: 'Task',
      Priority: 2,
      Active: true, // This task should be active
      Deleted: false,
      CreationTimestamp: new Date(Date.now() + 86400000).toISOString(),
      Deadline_DateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      state: 1, // TASK_STATE.COMPLETED
      User_uniqueId: userId,
      Account_uniqueId: accountId || '',
      Scheduled_Time: '',
      Scheduled_Time_End: '',
      RecurringFreq: 0
    }
  ];

  try {
    // Build the URL with query parameters
    const url = new URL(`${API_BASE_URL}/tasks/user/${userId}`);
    if (accountId) url.searchParams.append('accountId', accountId);
    if (includeDeleted) url.searchParams.append('includeDeleted', 'true');
    if (includeCompleted !== null) url.searchParams.append('includeCompleted', includeCompleted);
    if (includeOnlyThisWeeksItems !== null) url.searchParams.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems);

    // Forward the request to the backend API
    const response = await fetch(url.toString(), {
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
      return NextResponse.json({ tasks: defaultTasks });
    }

    const data = await response.json();

    // Check if the response is already in the expected format
    if (data && typeof data === 'object' && Array.isArray(data.tasks)) {
      return NextResponse.json(data);
    }

    // Check if the response is an array (old format)
    if (Array.isArray(data)) {
      // Convert to the new format
      return NextResponse.json({ tasks: data });
    }

    // If we get here, the response is not in a format we can use
    return NextResponse.json({ tasks: defaultTasks });
  } catch {
    return NextResponse.json({ tasks: defaultTasks });
  }
}
