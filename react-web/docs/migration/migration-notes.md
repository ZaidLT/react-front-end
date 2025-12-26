# Next.js Migration Notes

## Current Status

The migration to Next.js has been partially completed. Due to the complexity of the existing codebase and its reliance on browser-specific APIs, we've encountered challenges with static site generation and server-side rendering.

## What Works

- Next.js development server (`pnpm dev`)
- Client-side routing with Next.js
- API proxying to the backend
- Font loading and asset handling

## Known Issues

1. **Static Site Generation**: The build process fails during static site generation because some components use browser-specific APIs like `navigator` that aren't available during server-side rendering.

2. **Context Providers**: The context providers (LanguageProvider, AuthProvider) are designed for client-side rendering and cause errors during server-side rendering.

3. **OAuth Authentication**: The OAuth flow requires API routes, which don't work with static exports.

## Workarounds

### Development Mode

For now, we recommend using development mode for both development and production:

```bash
# Development
pnpm dev

# Production (also uses dev mode)
pnpm start
```

### Express Server

We've included an Express server (`server.js`) that can serve the static files and proxy API requests:

```bash
# Build the static files (when it works)
pnpm build:next

# Start the Express server
pnpm start:server
```

### Custom Document and App

We've added custom `_document.js` and `_app.js` files in the `pages` directory to handle the basic HTML structure and context providers.

## Next Steps

To complete the migration, we need to:

1. **Refactor Browser-Specific Code**: Identify and refactor components that use browser-specific APIs to check for the browser environment before using these APIs.

2. **Implement Proper API Routes**: Create proper Next.js API routes for OAuth authentication and other backend interactions.

3. **Fix Context Providers**: Update context providers to be compatible with server-side rendering.

4. **Implement Proper Static Site Generation**: Once the above issues are fixed, enable static site generation for improved performance.

## Development Workflow

For now, use the following workflow:

1. **Development**: Run `pnpm dev` to start the Next.js development server.

2. **Production**: Run `pnpm start` to start the Next.js development server in production mode.

3. **Testing**: Run `pnpm test` to run the test suite.

## Deployment

For deployment, we recommend:

1. Setting up a CI/CD pipeline that runs `pnpm dev` or `pnpm start` on the server.

2. Using a process manager like PM2 to keep the server running.

3. Setting up a reverse proxy (like Nginx) to handle HTTPS and other web server tasks.

## Future Improvements

Once the migration is complete, we can take advantage of Next.js features like:

- Server Components
- API Routes
- Middleware
- Image Optimization
- Internationalization
