import { NextRequest, NextResponse } from 'next/server';

// Parameters that should be preserved across all navigations
const PERSISTENT_PARAMS = ['mobile', 'token'] as const;

/**
 * Server-side mobile app detection logging
 */
function logMobileAppDetection(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const mobile = searchParams.get('mobile');
  const token = searchParams.get('token');

  // Check for WebView indicators in user agent
  const isWKWebView = /AppleWebKit/.test(userAgent) &&
                      !/Safari/.test(userAgent) &&
                      !/Chrome/.test(userAgent) &&
                      !/CriOS/.test(userAgent) &&
                      !/FxiOS/.test(userAgent);

  const isAndroidWebView = /Android/.test(userAgent) && /wv/.test(userAgent);
  const isEevaApp = /EevaApp/.test(userAgent);

  const webViewDetected = isWKWebView || isAndroidWebView || isEevaApp;

  // Log mobile app requests (only in debug mode)
  if ((mobile === 'true' || token || webViewDetected) && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('🔍 [SERVER] Mobile App Detection:', {
      timestamp: new Date().toISOString(),
      pathname,
      mobile,
      hasToken: !!token,
      webViewDetected,
      detection: {
        isWKWebView,
        isAndroidWebView,
        isEevaApp
      },
      userAgent: userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    });
  }
}

// Routes where parameters should be preserved
const ROUTES_TO_PRESERVE = [
  '/home',
  '/life',
  '/time',
  '/people',
  '/my-hive',
  '/house-hive',
  '/property-info',
  '/property-detail',
  '/edit-property-detail',
  '/appliances',
  '/spaces',
  '/utilities',
  '/view-task',
  '/edit-task',
  '/view-event',
  '/edit-event',
  '/view-note',
  '/edit-note',
  '/create-task',
  '/create-event',
  '/create-note',
  '/create-doc',
  '/beeva-chat'
];

/**
 * Middleware function that runs before each request
 *
 * This middleware:
 * 1. Adds authorization headers to API requests
 * 2. Preserves URL parameters across page navigations
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Log mobile app detection for debugging
  logMobileAppDetection(request);

  // Handle API requests - add authorization headers
  if (pathname.startsWith('/api')) {
    return handleApiRequest(request);
  }

  // Handle parameter preservation for specific routes
  return handleParameterPreservation(request);
}

/**
 * Handle API requests by adding authorization headers
 */
function handleApiRequest(request: NextRequest) {

  // Skip authentication for login and register endpoints
  if (
    request.nextUrl.pathname.startsWith('/api/auth/login') ||
    request.nextUrl.pathname.startsWith('/api/auth/register')
  ) {
    return NextResponse.next();
  }

  // Check if Authorization header is already present (from client-side localStorage)
  const existingAuthHeader = request.headers.get('Authorization');

  // If we already have an Authorization header, just pass it through
  if (existingAuthHeader) {
    return NextResponse.next();
  }

  // Fallback: Get the auth token from cookies if no Authorization header
  const authToken = request.cookies.get('auth_token')?.value;

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add the authorization header if the token exists in cookies
  if (authToken) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  // Create a new request with the modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

/**
 * Handle parameter preservation for page navigations
 */
function handleParameterPreservation(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Check if this is a route we want to preserve parameters for
  const shouldPreserveParams = ROUTES_TO_PRESERVE.some(route =>
    pathname.startsWith(route)
  );

  if (!shouldPreserveParams) {
    return NextResponse.next();
  }

  // Get the referer to check if we're coming from a page that has persistent params
  const referer = request.headers.get('referer');
  if (!referer) {
    return NextResponse.next();
  }

  try {
    const refererUrl = new URL(referer);
    const refererParams = refererUrl.searchParams;

    // Check if the current request already has the persistent params
    const currentParams = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    // Add missing persistent parameters from referer
    PERSISTENT_PARAMS.forEach(param => {
      const refererValue = refererParams.get(param);
      const currentValue = currentParams.get(param);

      // If referer has the param but current request doesn't, add it
      if (refererValue && !currentValue) {
        currentParams.set(param, refererValue);
        hasChanges = true;
      }
    });

    // If we added parameters, redirect to the URL with parameters
    if (hasChanges) {
      const newUrl = new URL(request.url);
      newUrl.search = currentParams.toString();
      return NextResponse.redirect(newUrl);
    }
  } catch (error) {
    // If there's an error parsing the referer URL, just continue
    console.warn('Error parsing referer URL in middleware:', error);
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all API routes except auth endpoints that don't require authentication
    '/api/((?!auth/login|auth/register|auth/request-password-reset-code|auth/reset-password-with-code).*)',
    // Match all page routes for parameter preservation (excluding static files)
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
