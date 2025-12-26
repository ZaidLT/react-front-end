# Authentication System

## Overview

The Eeva React Web application uses a comprehensive authentication system that supports multiple authentication methods including email/password and OAuth providers (Google and Apple). The system is built around JWT tokens and integrates with a Node.js backend API.

## Authentication Methods

### 1. Email/Password Authentication
Traditional username/password authentication with secure password handling.

**Registration Flow:**
```typescript
const success = await register(email, password, firstName, lastName);
```

**Login Flow:**
```typescript
const success = await login(email, password);
```

### 2. OAuth Authentication
Support for Google and Apple OAuth providers.

**OAuth Initiation:**
```typescript
const authUrl = await initiateOAuthLogin('google' | 'apple');
// User is redirected to OAuth provider
```

**OAuth Callback Handling:**
```typescript
// Handled automatically in /oauth-callback page
// Extracts tokens from URL parameters and completes authentication
```

### 3. Password Recovery
Secure password reset flow with email verification.

**Request Reset:**
```typescript
const success = await forgotPassword(email);
```

**Reset with Code:**
```typescript
const success = await resetPassword(email, code, newPassword);
```

### 4. Mobile App Authentication
Seamless authentication for users accessing the web app through the mobile application.

**Mobile App URL Parameters:**
```
/home?token=JWT_TOKEN&userId=USER_ID&mobile=true
```

**Authentication Flow:**
1. **Primary Method**: UserId validation against the provided token
2. **Fallback Method**: Email-based user lookup from token payload
3. **Session Establishment**: Automatic token storage and user session setup

**Implementation Details:**
- The `AuthContext` automatically detects `token` and `userId` URL parameters
- Validates the userId against the token using `/api/users/validate-user` endpoint
- Falls back to email-based authentication if userId validation fails
- Supports user switching when different users access the same browser session
- Cleans up URL parameters after successful authentication

**API Endpoint:**
```typescript
POST /api/users/validate-user
{
  "userId": "user-id-from-mobile-app",
  "token": "jwt-token-from-mobile-app"
}

// Response on success:
{
  "success": true,
  "user": {
    "id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "accountId": "account-id"
  }
}

// Response on failure:
{
  "success": false,
  "error": "User ID not valid for the provided token"
}
```

## Authentication Context

The authentication state is managed through React Context (`AuthContext`) which provides:

### State Properties
- `user`: Current authenticated user information
- `isAuthenticated`: Boolean authentication status
- `isLoading`: Loading state for auth operations
- `error`: Current error message (if any)

### Methods
- `login(email, password)`: Authenticate with email/password
- `register(email, password, firstName, lastName)`: Create new account
- `logout()`: Sign out and clear tokens
- `forgotPassword(email)`: Request password reset
- `resetPassword(email, code, newPassword)`: Reset password with code
- `initiateOAuthLogin(provider)`: Start OAuth flow
- `updateUser(userData)`: Update user information
- `refreshUserData()`: Refresh user data from server
- `clearError()`: Clear current error state

## Token Management

### JWT Tokens
The system uses JWT (JSON Web Tokens) for authentication:

- **Access Token**: Short-lived token for API requests
- **Refresh Token**: Long-lived token for obtaining new access tokens

### Token Storage
Tokens are stored in browser localStorage:
```typescript
localStorage.setItem('auth_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);
```

### Token Validation
```typescript
import { isTokenExpired, extractUserFromToken } from '../util/jwtUtils';

// Check if token is expired
const expired = isTokenExpired(token);

// Extract user data from token
const userData = extractUserFromToken(token);
```

### Automatic Token Refresh
The system automatically refreshes tokens when they expire:
```typescript
// Automatic refresh handled in AuthContext
// Manual refresh available via refreshUserData()
```

## API Integration

### Base Configuration
```typescript
// Base URL for API - uses Next.js API route to proxy requests
const API_BASE_URL = '/api';

// Headers for authenticated requests
const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
```

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/request-password-reset-code` - Request password reset
- `POST /api/auth/reset-password-with-code` - Reset password with code
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/revoke-token` - Logout from device
- `POST /api/auth/revoke-all-tokens` - Logout from all devices

#### OAuth Endpoints
- `POST /api/auth/oauth/{provider}` - Initiate OAuth login
- `POST /api/auth/oauth/callback` - Handle OAuth callback

#### User Endpoints
- `GET /api/users/exists/{email}` - Check if user exists
- `GET /api/users/all-data/{accountId}/{userId}` - Get user data
- `PUT /api/users` - Update user information

## Route Protection

### Protected Routes
Routes that require authentication are protected using the authentication context:

```typescript
// In page components
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (!isAuthenticated) return <Navigate to="/login" />;
```

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/forgot-password` - Password recovery
- `/oauth-callback` - OAuth callback handler

## Error Handling

### Authentication Errors
Common authentication errors and their handling:

```typescript
// Login errors
if (error === 'InvalidEmailAddress') {
  // Show invalid email message
}
if (error === 'InvalidCredentials') {
  // Show invalid credentials message
}

// Network errors
if (error.includes('Network')) {
  // Show network error message
}
```

### Error Recovery
- Automatic retry for network errors
- Clear error states after timeout
- User-friendly error messages

## Security Considerations

### Token Security
- Tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token expiration handling
- Secure token transmission over HTTPS

### Password Security
- Passwords are hashed on the backend
- Secure password reset flow with time-limited codes
- Password strength requirements (implemented on backend)

### OAuth Security
- Secure redirect URLs
- State parameter validation
- PKCE (Proof Key for Code Exchange) support

## Mobile App Integration

### URL Parameter Detection
The authentication system automatically detects and processes URL parameters when users access the web app through the mobile application:

```typescript
// AuthContext automatically handles these URL patterns:
// /any-page?token=JWT_TOKEN&userId=USER_ID&mobile=true
// /any-page?token=JWT_TOKEN&mobile=true (fallback to email-based auth)
```

### Authentication Flow Implementation

**1. URL Parameter Extraction:**
```typescript
const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get('token');
const urlUserId = urlParams.get('userId');
```

**2. UserId Validation (Primary Method):**
```typescript
if (urlUserId) {
  const validationResponse = await fetch('/api/users/validate-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: urlUserId, token: urlToken })
  });

  if (validationResponse.ok) {
    const { user } = await validationResponse.json();
    // Establish user session
  }
}
```

**3. Email-Based Fallback:**
```typescript
if (!userData) {
  // Extract email from token payload
  const tokenPayload = extractUserFromToken(urlToken);

  // Fetch user data using email
  const response = await fetch('/api/users/me', {
    headers: { 'Authorization': `Bearer ${urlToken}` }
  });
}
```

**4. Session Establishment:**
```typescript
// Store authentication tokens
localStorage.setItem('auth_token', urlToken);
localStorage.setItem('refresh_token', urlToken);

// Store user data
localStorage.setItem('user_data', JSON.stringify(userData));

// Update authentication state
setAuthState({
  user: userData,
  isAuthenticated: true,
  isLoading: false,
  error: null
});

// Clean up URL parameters
const newUrl = new URL(window.location.href);
newUrl.searchParams.delete('token');
newUrl.searchParams.delete('userId');
window.history.replaceState({}, '', newUrl.toString());
```

### User Switching Support
The system handles scenarios where different users access the same browser session:

```typescript
// Detect user switch
const currentUserEmail = getCurrentUser()?.email;
const newUserEmail = tokenUser.email;

if (currentUserEmail && currentUserEmail !== newUserEmail) {
  // Clear existing session
  clearAllStorage('User switch detected');

  // Reset authentication state
  setAuthState({ user: null, isAuthenticated: false, isLoading: true });

  // Establish new session
  authenticateNewUser(tokenUser);
}
```

### Testing Mobile App Authentication

**Test Page:** `/test-auth`

The test page provides tools to verify mobile app authentication:
- Test the userId validation API endpoint
- Simulate mobile app URL generation
- Monitor authentication state changes
- View detailed console logs

**Manual Testing:**
1. Navigate to: `/home?token=VALID_JWT&userId=VALID_USER_ID&mobile=true`
2. Check browser console for authentication logs
3. Verify user session is established correctly
4. Confirm URL parameters are cleaned up

## Development Guidelines

### Using Authentication in Components
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Making Authenticated API Calls
```typescript
import { getHeaders } from '../services/services';

const response = await axios.get('/api/protected-endpoint', {
  headers: getHeaders()
});
```

### Handling Authentication State Changes
```typescript
useEffect(() => {
  // React to authentication state changes
  if (isAuthenticated) {
    // User logged in
    fetchUserData();
  } else {
    // User logged out
    clearUserData();
  }
}, [isAuthenticated]);
```

## Testing Authentication

### Unit Tests
- Test authentication context state changes
- Test token validation utilities
- Test error handling scenarios

### Integration Tests
- Test complete authentication flows
- Test OAuth callback handling
- Test protected route access

### Manual Testing Checklist
- [ ] Email/password login and registration
- [ ] Google OAuth flow
- [ ] Apple OAuth flow (if available)
- [ ] Password reset flow
- [ ] Token refresh on expiration
- [ ] Logout functionality
- [ ] Protected route access

---

*For API endpoint details and backend integration, see [API Integration](./integration.md).*
