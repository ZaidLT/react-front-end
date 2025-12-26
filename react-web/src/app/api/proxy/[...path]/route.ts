/**
 * API Proxy Route
 *
 * This route proxies requests to the backend API, adding necessary headers
 * and handling CORS issues in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, PROTECTION_BYPASS_HEADER, logApiConfig } from 'config/api';

// Log API configuration on startup
logApiConfig();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<any> }
) {
  const resolvedParams = await params;
  return await handleRequest(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<any> }
) {
  const resolvedParams = await params;
  return await handleRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<any> }
) {
  const resolvedParams = await params;
  return await handleRequest(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<any> }
) {
  const resolvedParams = await params;
  return await handleRequest(request, resolvedParams.path, 'DELETE');
}

export async function OPTIONS() {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vercel-protection-bypass',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function handleRequest(
  request: NextRequest,
  pathParts: string[],
  method: string
) {
  // Construct the target URL
  const path = pathParts.join('/');
  const url = new URL(request.url);
  // Remove 'proxy' from the path if it's the first segment
  const cleanPath = path.startsWith('proxy/') ? path.substring(6) : path;

  // Skip proxying for routes that have local handlers
  // This allows our local API routes to take precedence
  if (cleanPath.startsWith('contacts/')) {
    const contactIdMatch = cleanPath.match(/^contacts\/([a-f0-9-]+)$/);
    if (contactIdMatch) {
      console.log(`Skipping proxy for local contacts route: ${cleanPath} (${method})`);
      // Return 404 directly instead of throwing an error to avoid error logging
      return new NextResponse('Not Found', { status: 404 });
    }
  }

  // Handle files/account routes specially - forward to backend with required query shape
  if (cleanPath.startsWith('files/account/')) {
    const accountIdMatch = cleanPath.match(/^files\/account\/([a-f0-9-]+)$/);
    if (accountIdMatch) {
      const accountId = accountIdMatch[1];

      const backendUrl = new URL(`${API_BASE_URL}/files/account/${accountId}`);
      const userId = url.searchParams.get('userId');
      const includeDeleted = url.searchParams.get('includeDeleted') ?? 'false';
      const includeOnly = url.searchParams.get('includeOnlyThisWeeksItems');

      if (userId) backendUrl.searchParams.append('userId', userId);
      backendUrl.searchParams.append('includeDeleted', includeDeleted);
      if (includeOnly !== null) backendUrl.searchParams.append('includeOnlyThisWeeksItems', includeOnly);

      const targetUrl = backendUrl.toString();


      const response = await fetch(targetUrl, {
        method: method,
        headers: {
          'x-vercel-protection-bypass': PROTECTION_BYPASS_HEADER,
          ...(request.headers.get('Authorization')
            ? { 'Authorization': request.headers.get('Authorization') as string }
            : {})
        },
      });

      const text = await response.text();

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch account files' },
          { status: response.status }
        );
      }

      try {
        const data = JSON.parse(text);
        return NextResponse.json(data);
      } catch {
        return new NextResponse(text, {
          status: response.status,
          headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' }
        });
      }
    }
  }

  // Only skip proxying for tasks routes that have local handlers
  // Events and Notes will use the proxy
  if (cleanPath.startsWith('tasks/')) {
    return NextResponse.json(
      { error: 'Route should be handled by local handler' },
      { status: 404 }
    );
  }

  const targetUrl = `${API_BASE_URL}/${cleanPath}${url.search}`;





  // Special debugging for reset password endpoint
  if (cleanPath.includes('reset-password-with-code')) {
    console.log('\n=== RESET PASSWORD PROXY DEBUG ===');
    console.log('Target URL:', targetUrl);
    console.log('Method:', method);
    console.log('Clean Path:', cleanPath);
    console.log('=====================================\n');
  }

  // Prepare headers
  const headers = new Headers();



  // Copy relevant headers from the original request
  // Omit host header which can cause issues
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  // Add the protection bypass header
  headers.set('x-vercel-protection-bypass', PROTECTION_BYPASS_HEADER);

  // Add local accountId as a custom header for backend authorization
  const accountId = request.cookies.get('account_id')?.value;
  if (accountId) {
    headers.set('x-local-account-id', accountId);

  }

  // Check for Authorization header specifically
  const authHeader = request.headers.get('Authorization');
  if (authHeader) {
    // Ensure it's set correctly (in case it was missed or overwritten)
    headers.set('Authorization', authHeader);
  }



  try {
    // Forward the request to the backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let requestBody;
    let requestBodyText = '';
    if (method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') {
      try {
        requestBody = await request.blob();
        // For reset password debugging, also capture the text
        if (cleanPath.includes('reset-password-with-code')) {
          requestBodyText = await requestBody.text();
          console.log('\n=== RESET PASSWORD REQUEST BODY ===');
          console.log('Raw body:', requestBodyText);
          try {
            const parsedBody = JSON.parse(requestBodyText);
            console.log('Parsed body:', JSON.stringify(parsedBody, null, 2));
          } catch {
            console.log('Could not parse body as JSON');
          }
          console.log('==================================\n');
          // Recreate the blob since we consumed it
          requestBody = new Blob([requestBodyText], { type: request.headers.get('content-type') || 'application/json' });
        }


      } catch (blobError) {
        console.warn('Could not read request body as blob:', blobError);
        // Try to read as text if blob fails
        try {
          const text = await request.text();
          requestBodyText = text;
          requestBody = new Blob([text], { type: request.headers.get('content-type') || 'text/plain' });
        } catch (textError) {
          console.error('Failed to read request body:', textError);
        }
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
      // Add these options to help with connection issues
      cache: 'no-store',
      keepalive: true,
    };

    // Only include body for methods that should have one
    if (requestBody !== undefined) {
      fetchOptions.body = requestBody;
    }

    const response = await fetch(targetUrl, fetchOptions);

    clearTimeout(timeoutId);

    // Get the content type to determine how to handle the response
    const contentType = response.headers.get('content-type') || '';

    let responseData;

    // Handle different content types appropriately
    if (contentType.includes('application/json')) {
      try {
        // For JSON responses, parse and re-stringify to ensure proper encoding
        const jsonData = await response.json();

        // Debug logging for tasks API responses
        if (cleanPath.includes('tasks/user/')) {
          console.log('\n=== TASKS API RESPONSE DEBUG ===');
          console.log('Target URL:', targetUrl);
          console.log('Response Status:', response.status);
          console.log('Response Data Type:', Array.isArray(jsonData) ? 'Array' : typeof jsonData);
          console.log('Response Data Length:', Array.isArray(jsonData) ? jsonData.length : 'N/A');

          if (Array.isArray(jsonData)) {
            console.log('First 3 tasks:', JSON.stringify(jsonData.slice(0, 3), null, 2));

            // Count completed vs incomplete tasks
            const completedTasks = jsonData.filter((task: any) => task.completed === true);
            const incompleteTasks = jsonData.filter((task: any) => task.completed === false);

            console.log('Completed tasks count:', completedTasks.length);
            console.log('Incomplete tasks count:', incompleteTasks.length);

            if (completedTasks.length > 0) {
              console.log('Sample completed tasks:', JSON.stringify(completedTasks.slice(0, 2), null, 2));
            }

            // Check for different field names that might indicate completion
            const taskFields = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
            console.log('Available task fields:', taskFields);
          } else {
            console.log('Full response data:', JSON.stringify(jsonData, null, 2));
          }
          console.log('================================\n');
        }

        responseData = JSON.stringify(jsonData);

        // Create a new response with the JSON data
        const newResponse = new NextResponse(responseData, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return newResponse;
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        // Fall through to text handling if JSON parsing fails
      }
    }

    // For non-JSON responses or if JSON parsing failed
    try {
      const text = await response.text();


      // Create a new response with the text data
      const newResponse = new NextResponse(text, {
        status: response.status,
        statusText: response.statusText,
      });

      // Copy relevant headers from the original response
      response.headers.forEach((value, key) => {
        // Skip content-encoding as we're not compressing the response
        if (key.toLowerCase() !== 'content-encoding') {
          newResponse.headers.set(key, value);
        }
      });


      return newResponse;
    } catch (e) {
      console.error('Error handling text response:', e);
      // If text handling fails, return a simple error response
      return new NextResponse('Error processing response', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
  } catch (error) {
    console.error('API proxy error:', error);

    // Provide more detailed error information
    let errorMessage = 'Failed to proxy request';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;

      // Check for timeout
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out after 10 seconds';
        statusCode = 504; // Gateway Timeout
      }

      // Check for network errors
      if ('cause' in error && error.cause) {
        const cause = error.cause as any;
        if (cause.code) {
          errorMessage += ` (${cause.code})`;

          // Connection refused or reset
          if (['ECONNREFUSED', 'ECONNRESET'].includes(cause.code)) {
            statusCode = 502; // Bad Gateway
          }
        }
      }
    }

    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
