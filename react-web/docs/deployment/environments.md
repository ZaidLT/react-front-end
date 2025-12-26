# Environment Configuration

## Overview

The Eeva React Web application supports multiple environments with different configurations for development, staging, and production. This document outlines the environment setup, configuration management, and best practices.

## Environment Structure

### Current Environments

#### Development
- **Purpose**: Local development and testing
- **URL**: `http://localhost:3001`
- **Backend**: Local proxy to production API
- **Database**: Shared with production (read-only for safety)
- **Authentication**: Full OAuth and email/password support

#### Production
- **Purpose**: Live application for end users
- **URL**: `https://react-web-eeva.vercel.app`
- **Backend**: `https://node-backend-eeva.vercel.app`
- **Database**: Production database
- **Authentication**: Full authentication with all providers

#### Staging (Planned)
- **Purpose**: Pre-production testing and validation
- **URL**: `https://staging-react-web-eeva.vercel.app` (to be configured)
- **Backend**: Staging backend API
- **Database**: Staging database with production-like data
- **Authentication**: Limited to test accounts

## Environment Variables

### Development Environment
```bash
# .env.local (for local development)
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Debug settings
DEBUG=next:*
NEXT_DEBUG=true

# Optional: Override default port
PORT=3001

# Development-specific features
NEXT_PUBLIC_ENABLE_DEBUG_TOOLS=true
NEXT_PUBLIC_MOCK_API=false
```

### Production Environment
```bash
# Vercel environment variables (set in dashboard)
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://node-backend-eeva.vercel.app/api

# Security
VERCEL_PROTECTION_BYPASS=0a2eba8c751892e035f6b96605600fae

# AI Services
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Performance
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Feature flags
NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_ENABLE_OFFLINE_MODE=false
```

### Staging Environment (Future)
```bash
# Staging environment variables
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_API_URL=https://staging-backend-eeva.vercel.app/api

# Staging-specific settings
NEXT_PUBLIC_ENABLE_DEBUG_TOOLS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_MOCK_EXTERNAL_SERVICES=true

# AI Services
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Authentication
NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://staging-react-web-eeva.vercel.app/oauth-callback
```

## Configuration Management

### Environment Detection
```typescript
// src/util/environment.ts
export const getEnvironment = () => {
  return process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
};

export const isDevelopment = () => getEnvironment() === 'development';
export const isProduction = () => getEnvironment() === 'production';
export const isStaging = () => getEnvironment() === 'staging';

// Environment-specific configuration
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  environment: getEnvironment(),
  enableDebugTools: process.env.NEXT_PUBLIC_ENABLE_DEBUG_TOOLS === 'true',
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
};
```

### Feature Flags
```typescript
// src/util/featureFlags.ts
interface FeatureFlags {
  enablePWA: boolean;
  enableOfflineMode: boolean;
  enableAdvancedSearch: boolean;
  enableBetaFeatures: boolean;
}

export const getFeatureFlags = (): FeatureFlags => {
  return {
    enablePWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    enableOfflineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    enableAdvancedSearch: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH === 'true',
    enableBetaFeatures: isDevelopment() || isStaging(),
  };
};

// Usage in components
const { enableBetaFeatures } = getFeatureFlags();
if (enableBetaFeatures) {
  // Show beta features
}
```

## API Configuration

### Environment-specific API Settings
```typescript
// src/services/config.ts
interface APIConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  enableMocking: boolean;
}

export const getAPIConfig = (): APIConfig => {
  const environment = getEnvironment();
  
  const configs: Record<string, APIConfig> = {
    development: {
      baseURL: '/api',
      timeout: 10000,
      retryAttempts: 3,
      enableMocking: process.env.NEXT_PUBLIC_MOCK_API === 'true',
    },
    staging: {
      baseURL: '/api',
      timeout: 8000,
      retryAttempts: 2,
      enableMocking: false,
    },
    production: {
      baseURL: '/api',
      timeout: 5000,
      retryAttempts: 1,
      enableMocking: false,
    },
  };
  
  return configs[environment] || configs.development;
};
```

### Backend Integration
```typescript
// src/services/apiClient.ts
import axios from 'axios';
import { getAPIConfig } from './config';

const apiConfig = getAPIConfig();

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Environment-specific interceptors
if (isDevelopment()) {
  apiClient.interceptors.request.use((config) => {
    console.log('API Request:', config);
    return config;
  });
  
  apiClient.interceptors.response.use(
    (response) => {
      console.log('API Response:', response);
      return response;
    },
    (error) => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );
}
```

## Authentication Configuration

### OAuth Configuration
```typescript
// src/util/authConfig.ts
interface OAuthConfig {
  googleClientId: string;
  appleClientId: string;
  redirectUrl: string;
}

export const getOAuthConfig = (): OAuthConfig => {
  const environment = getEnvironment();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  const configs: Record<string, OAuthConfig> = {
    development: {
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV || '',
      appleClientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID_DEV || '',
      redirectUrl: `${baseUrl}/oauth-callback`,
    },
    staging: {
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_STAGING || '',
      appleClientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID_STAGING || '',
      redirectUrl: 'https://staging-react-web-eeva.vercel.app/oauth-callback',
    },
    production: {
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD || '',
      appleClientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID_PROD || '',
      redirectUrl: 'https://react-web-eeva.vercel.app/oauth-callback',
    },
  };
  
  return configs[environment] || configs.development;
};
```

## Database Configuration

### Environment-specific Database Settings
```typescript
// Backend configuration (for reference)
interface DatabaseConfig {
  host: string;
  database: string;
  ssl: boolean;
  poolSize: number;
}

// Development
const developmentDB: DatabaseConfig = {
  host: 'localhost',
  database: 'eeva_dev',
  ssl: false,
  poolSize: 5,
};

// Staging
const stagingDB: DatabaseConfig = {
  host: 'staging-db.vercel.app',
  database: 'eeva_staging',
  ssl: true,
  poolSize: 10,
};

// Production
const productionDB: DatabaseConfig = {
  host: 'production-db.vercel.app',
  database: 'eeva_production',
  ssl: true,
  poolSize: 20,
};
```

## Logging and Monitoring

### Environment-specific Logging
```typescript
// src/util/logger.ts
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

class Logger {
  private level: string;
  
  constructor() {
    this.level = this.getLogLevel();
  }
  
  private getLogLevel(): string {
    if (isProduction()) return 'error';
    if (isStaging()) return 'warn';
    return 'debug'; // development
  }
  
  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args);
    // Send to error tracking service in production
    if (isProduction()) {
      // errorTracker.captureException(new Error(message));
    }
  }
  
  warn(message: string, ...args: any[]) {
    if (['warn', 'info', 'debug'].includes(this.level)) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: any[]) {
    if (['info', 'debug'].includes(this.level)) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }
  
  debug(message: string, ...args: any[]) {
    if (this.level === 'debug') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
```

## Security Configuration

### Environment-specific Security Settings
```typescript
// src/util/security.ts
interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  allowedOrigins: string[];
  cookieSecure: boolean;
}

export const getSecurityConfig = (): SecurityConfig => {
  const environment = getEnvironment();
  
  const configs: Record<string, SecurityConfig> = {
    development: {
      enableCSP: false,
      enableHSTS: false,
      allowedOrigins: ['http://localhost:3001', 'http://localhost:3000'],
      cookieSecure: false,
    },
    staging: {
      enableCSP: true,
      enableHSTS: true,
      allowedOrigins: ['https://staging-react-web-eeva.vercel.app'],
      cookieSecure: true,
    },
    production: {
      enableCSP: true,
      enableHSTS: true,
      allowedOrigins: ['https://react-web-eeva.vercel.app'],
      cookieSecure: true,
    },
  };
  
  return configs[environment] || configs.development;
};
```

## Performance Configuration

### Environment-specific Performance Settings
```typescript
// src/util/performance.ts
interface PerformanceConfig {
  enableServiceWorker: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  enableLazyLoading: boolean;
  bundleAnalysis: boolean;
}

export const getPerformanceConfig = (): PerformanceConfig => {
  const environment = getEnvironment();
  
  const configs: Record<string, PerformanceConfig> = {
    development: {
      enableServiceWorker: false,
      enableCaching: false,
      cacheTimeout: 0,
      enableLazyLoading: false,
      bundleAnalysis: true,
    },
    staging: {
      enableServiceWorker: true,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      enableLazyLoading: true,
      bundleAnalysis: true,
    },
    production: {
      enableServiceWorker: true,
      enableCaching: true,
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
      enableLazyLoading: true,
      bundleAnalysis: false,
    },
  };
  
  return configs[environment] || configs.development;
};
```

## Environment Setup Checklist

### Development Setup
- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Development server running (`pnpm debug`)

### Staging Setup (Future)
- [ ] Staging backend deployed
- [ ] Staging database configured
- [ ] Environment variables set in Vercel
- [ ] OAuth providers configured for staging
- [ ] SSL certificate configured
- [ ] Monitoring and logging configured

### Production Setup
- [ ] Production backend deployed
- [ ] Production database configured
- [ ] Environment variables set in Vercel
- [ ] OAuth providers configured for production
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate configured
- [ ] Monitoring and error tracking configured
- [ ] Performance monitoring enabled

## Troubleshooting

### Common Environment Issues

#### Environment Variable Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_ENVIRONMENT
echo $NEXT_PUBLIC_API_URL

# Verify in browser console
console.log(process.env.NEXT_PUBLIC_ENVIRONMENT);
```

#### API Configuration Issues
```bash
# Test API connectivity
curl https://react-web-eeva.vercel.app/api/health

# Check proxy configuration
# Verify next.config.js rewrites
```

#### Authentication Issues
```bash
# Check OAuth configuration
# Verify redirect URLs match environment
# Test authentication flow in each environment
```

---

*For deployment procedures, see [Deployment Guide](./deployment.md).*
