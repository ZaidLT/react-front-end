# Next.js Migration Documentation

This document outlines the changes made to migrate the Eeva React Web project from Create React App (CRA) with React Router to Next.js.

## Migration Overview

The migration involved the following key changes:

1. Installing Next.js and updating dependencies
2. Creating Next.js app directory structure
3. Converting React Router routes to Next.js pages
4. Implementing API routes for OAuth authentication
5. Updating context providers for Next.js compatibility
6. Configuring Next.js for the project

## Project Structure Changes

### Before Migration
```
src/
├── components/     # UI components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── pages/          # Page components used with React Router
├── services/       # API and other services
├── styles/         # CSS and styling files
├── util/           # Utility functions
└── assets/         # Static assets
```

### After Migration
```
src/
├── app/            # Next.js app directory
│   ├── api/        # API routes
│   ├── [route]/    # Page routes
│   ├── layout.tsx  # Root layout
│   └── page.tsx    # Root page
├── components/     # UI components (unchanged)
├── context/        # React context providers (updated for Next.js)
├── hooks/          # Custom React hooks (unchanged)
├── pages/          # Page components (now used by Next.js pages)
├── services/       # API and other services (updated for Next.js)
├── styles/         # CSS and styling files (unchanged)
├── util/           # Utility functions (unchanged)
└── assets/         # Static assets (unchanged)
```

## Key Files Created/Modified

### New Files
- `next.config.js` - Next.js configuration
- `next-env.d.ts` - TypeScript definitions for Next.js
- `src/app/layout.tsx` - Root layout component
- `src/app/page.tsx` - Root page component
- `src/app/[route]/page.tsx` - Route-specific page components
- `src/app/api/auth/oauth/*` - OAuth API routes

### Modified Files
- `package.json` - Updated dependencies and scripts
- `.gitignore` - Added Next.js specific entries
- `src/services/authService.ts` - Updated to use Next.js API routes
- `src/context/AuthContext.tsx` - Updated for Next.js compatibility

## Development Workflow Changes

### Before Migration
```bash
# Start development server
pnpm start

# Build for production
pnpm build
```

### After Migration
```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## OAuth Authentication Flow

The OAuth authentication flow has been updated to use Next.js API routes:

1. User clicks on OAuth login button
2. Frontend calls local Next.js API route (`/api/auth/oauth/[provider]`)
3. Next.js API route forwards request to backend API
4. Backend returns OAuth URL
5. User is redirected to OAuth provider
6. OAuth provider redirects back to callback URL
7. Next.js API route (`/api/auth/oauth/callback`) handles the callback
8. User is authenticated and redirected to the home page

## Benefits of the Migration

1. **Improved Performance**: Next.js provides server-side rendering and static site generation capabilities.
2. **Simplified Routing**: Next.js file-based routing is more intuitive than React Router configuration.
3. **API Routes**: Next.js API routes eliminate the need for a separate Express server for API endpoints.
4. **Better SEO**: Server-side rendering improves search engine optimization.
5. **Improved Developer Experience**: Next.js provides a more streamlined development workflow.

## Known Issues and Limitations

- Some components may need further updates to be fully compatible with Next.js.
- The migration preserves the existing project structure as much as possible, but a more optimal structure could be achieved with a complete restructuring.
- The OAuth flow may need further testing to ensure it works correctly in all scenarios.

## Future Improvements

- Implement server components where appropriate
- Optimize image loading with Next.js Image component
- Implement more robust error handling for API routes
- Add middleware for authentication and authorization
- Implement internationalization using Next.js i18n features
