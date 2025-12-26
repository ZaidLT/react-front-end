# API Configuration

This document explains how the React Web application is configured to use different API endpoints based on the deployment environment.

## Overview

The application automatically selects the appropriate API endpoint based on the Vercel environment:

- **Production** (main branch): `https://api.eeva.app/api`
- **Development/Preview** (all other branches): `https://dev.api.eeva.app/api`

## Implementation

### Configuration File

The API configuration is centralized in `src/config/api.ts`:

```typescript
export function getApiBaseUrl(): string {
  const isProduction = process.env.VERCEL_ENV === 'production';
  
  if (isProduction) {
    return 'https://api.eeva.app/api';
  } else {
    return 'https://dev.api.eeva.app/api';
  }
}
```

### Environment Detection

The configuration uses Vercel's built-in environment variables:

- `VERCEL_ENV`: Set to `'production'` for main branch deployments, other values for preview/development
- No manual configuration required

### Usage in API Routes

All API route files import the configuration:

```typescript
import { API_BASE_URL, PROTECTION_BYPASS_HEADER } from 'config/api';
```

## Testing

You can test the current API configuration by visiting:
- `/api/test-api-config` - Returns current configuration details

## Migration

All existing API routes have been updated to use the centralized configuration. The following files were modified:

**Core API Routes:**
- `src/app/api/proxy/[...path]/route.ts`
- `src/app/api/search/route.ts`

**Authentication Routes:**
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/login/oauth/callback/route.ts`
- `src/app/api/auth/login/oauth/initiate/route.ts`
- `src/app/api/auth/oauth/callback/route.ts`
- `src/app/api/auth/oauth/google/route.ts`
- `src/app/api/auth/oauth/apple/route.ts`

**Task Routes:**
- `src/app/api/tasks/route.ts`
- `src/app/api/tasks/[taskId]/route.ts`
- `src/app/api/tasks/[taskId]/complete/route.ts`
- `src/app/api/tasks/account/[userId]/route.ts`
- `src/app/api/tasks/user/[userId]/route.ts`

**Note Routes:**
- `src/app/api/notes/route.ts`
- `src/app/api/notes/[noteId]/route.ts`
- `src/app/api/notes/account/[userId]/route.ts`
- `src/app/api/notes/user/[userId]/route.ts`

**Event Routes:**
- `src/app/api/events/route.ts`
- `src/app/api/events/[eventId]/route.ts`
- `src/app/api/events/account/[userId]/route.ts`
- `src/app/api/events/user/[userId]/route.ts`
- `src/app/api/event-times/account/[userId]/route.ts`

**File Routes:**
- `src/app/api/files/route.ts`
- `src/app/api/files/[fileId]/route.ts`
- `src/app/api/files/account/[accountId]/route.ts`
- `src/app/api/files/user/[userId]/route.ts`
- `src/app/api/file-events/account/[accountId]/route.ts`
- `src/app/api/file-users/[id]/route.ts`

**User & Account Routes:**
- `src/app/api/users/route.ts`
- `src/app/api/users/me/route.ts`
- `src/app/api/users/all-data/[accountId]/[userId]/route.ts`
- `src/app/api/accounts/route.ts`
- `src/app/api/accounts/delete/route.ts`

**Contact Routes:**
- `src/app/api/contacts/create/route.ts`
- `src/app/api/contacts/[id]/route.ts`
- `src/app/api/contacts/[id]/update/route.ts`
- `src/app/api/contacts/account/[userId]/route.ts`
- `src/app/api/contacts/user/[userId]/route.ts`

**Tile Routes:**
- `src/app/api/tiles/route.ts`
- `src/app/api/tiles/[tileId]/route.ts`
- `src/app/api/tiles/user/[userId]/route.ts`
- `src/app/api/tiles/defaultApplianceTiles/[userId]/route.ts`
- `src/app/api/tiles/defaultSpaceTiles/[userId]/route.ts`
- `src/app/api/tiles/defaultUtilityTiles/[userId]/route.ts`

**Provider Routes:**
- `src/app/api/providers/route.ts`
- `src/app/api/providers/[id]/route.ts`
- `src/app/api/providers/user/[userId]/route.ts`

**Other Routes:**
- `src/app/api/activities/account/route.ts`

## Deployment

No additional configuration is needed for deployment. The environment detection happens automatically based on Vercel's environment variables.

### Production Deployment
- Deployed from `main` branch
- Uses `https://api.eeva.app/api`

### Development/Preview Deployment
- Deployed from any other branch
- Uses `https://dev.api.eeva.app/api`

## Troubleshooting

If you need to debug the API configuration:

1. Check the test endpoint: `/api/test-api-config`
2. Look for console logs from `logApiConfig()` in the API proxy route
3. Verify the `VERCEL_ENV` environment variable value
