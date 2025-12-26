# Next.js Migration Status

## Current Status

The migration to Next.js has been completed for development mode. We've fixed the issues with browser-specific APIs by adding checks for browser environment before using them.

## What Works

- Next.js development server (`pnpm dev`)
- Client-side routing with Next.js
- CSS and asset handling
- Browser-specific APIs with environment checks

## Resolved Issues

1. **Browser-Specific APIs**: We've fixed the issues with browser-specific APIs like `navigator` by adding checks for the browser environment before using them:
   - Fixed `navigator.language` in LanguageContext.tsx
   - Fixed `navigator.mediaDevices` in LabelScannerModal.tsx
   - Fixed `navigator.clipboard` in UserDetailsInfo.tsx

2. **Routing**: We've fixed the routing issues by:
   - Creating Next.js page files in the `src/pages` directory for all routes
   - Updating the App.tsx file to use Next.js's routing system instead of React Router
   - Adding the 'use client' directive to client-side components
   - Using proper TypeScript typing for all Next.js components (NextPage, AppProps)

## Current Setup

We're using Next.js with API routes to handle CORS issues and proxy requests to the backend server:

```bash
# Development
pnpm dev

# Production
pnpm start
```

## React Router Compatibility

To handle components that use React Router hooks like `useNavigate`, we've created Next.js-compatible versions of these components:

1. **NextLoginPage.tsx**: A version of LoginPage that uses Next.js's `useRouter` instead of React Router's `useNavigate`
2. **NextRegisterPage.tsx**: A version of RegisterPage that uses Next.js's `useRouter` instead of React Router's `useNavigate`

These components are used in the Next.js pages to ensure compatibility with Next.js's routing system.

## API Configuration

We've updated the API configuration in the authService.ts file to use a Next.js API route to proxy requests:

```typescript
// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';
```

This ensures that API requests are sent through a Next.js API route that handles CORS issues and forwards the requests to the backend server.

## Hardcoded URLs and Browser APIs

We've fixed issues with hardcoded URLs and browser APIs:

1. **Removed Proxy Setting**: Removed the proxy setting from package.json to prevent redirection to localhost:3000
2. **Updated Server Port**: Updated the server.js file to use port 3001 instead of 3000
3. **Fixed EmptyStateCard**: Updated the EmptyStateCard component to safely access window.location.pathname
4. **Added Client Directives**: Added 'use client' directives to components that use browser APIs

## Next.js API Route Proxy

To handle CORS issues when making API requests from localhost to the backend server, we've added a Next.js API route proxy:

1. **Created API Route**: Added a catch-all API route at `src/pages/api/[...path].ts` that proxies requests to the backend server
2. **Updated API Configuration**: Updated the authService.ts file to use the Next.js API route
3. **Simplified Headers**: Removed the Vercel protection bypass header from client-side requests (it's now added in the API route)

## Next Steps

To complete the migration, we need to:

1. **Refactor Browser-Specific Code**: Identify and refactor components that use browser-specific APIs to check for the browser environment before using these APIs. For example:

```javascript
// Before
const userAgent = navigator.userAgent;

// After
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
```

2. **Implement Proper API Routes**: Create proper Next.js API routes for OAuth authentication and other backend interactions.

3. **Fix Context Providers**: Update context providers to be compatible with server-side rendering.

4. **Enable Static Site Generation**: Once the above issues are fixed, enable static site generation for improved performance.

## Development Workflow

For now, use the following workflow:

1. **Development**: Run `pnpm dev` to start the Next.js development server.

2. **Production**: Run `pnpm start` to start the Next.js development server in production mode.

3. **Testing**: Run `pnpm test` to run the test suite.

## Deployment

For deployment, we recommend:

1. Setting up a CI/CD pipeline that runs `pnpm start` on the server.

2. Using a process manager like PM2 to keep the server running.

3. Setting up a reverse proxy (like Nginx) to handle HTTPS and other web server tasks.

## Future Improvements

Once the migration is complete, we can take advantage of Next.js features like:

- Server Components
- API Routes
- Middleware
- Image Optimization
- Internationalization

## Files Changed

1. **Added Next.js Configuration**:
   - `next.config.js`
   - `next-env.d.ts`

2. **Added Pages Directory**:
   - `src/pages/_app.js`
   - `src/pages/_document.js`
   - `src/pages/index.js`

3. **Updated Package Scripts**:
   - Modified `package.json` to use Next.js commands

4. **Updated CSS Imports**:
   - Moved global CSS imports to `_app.js`
   - Removed CSS imports from `App.tsx`

5. **Added Client-Side Directive**:
   - Added `'use client'` to context providers

## Conclusion

The migration to Next.js is in progress but not yet complete. For now, we're using a development-only approach to ensure the application continues to function while we work on resolving the issues with static site generation and server-side rendering.
