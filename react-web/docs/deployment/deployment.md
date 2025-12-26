# Deployment Guide

## Overview

The Eeva React Web application is deployed using Vercel, which provides seamless integration with Next.js applications. This guide covers deployment processes, environment configuration, and operational considerations.

## Deployment Architecture

### Current Setup
- **Platform**: Vercel
- **Framework**: Next.js 15.3.2
- **Build Tool**: Next.js build system
- **CDN**: Vercel Edge Network
- **Domain**: Custom domain with SSL

### Environment Structure
```
Production:  https://react-web-eeva.vercel.app (main branch)
Development: Auto-deployed on feature branches
Staging:     To be configured
```

## Vercel Configuration

### Project Settings
```json
{
  "name": "eeva-web-ui",
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev"
}
```

### Build Configuration
The application uses Next.js build system with the following configuration:

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // SVG handling
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  
  // Asset optimization
  images: {
    domains: ['node-backend-eeva.vercel.app'],
  },
  
  // API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://node-backend-eeva.vercel.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
```

### Environment Variables
```bash
# Production Environment Variables (set in Vercel dashboard)
NEXT_PUBLIC_API_URL=https://node-backend-eeva.vercel.app/api
NEXT_PUBLIC_ENVIRONMENT=production
VERCEL_PROTECTION_BYPASS=0a2eba8c751892e035f6b96605600fae

# Development Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ENVIRONMENT=development
```

## Deployment Process

### Automatic Deployment
Vercel automatically deploys when code is pushed to connected branches:

```bash
# Production deployment (main branch)
git push origin main
# Triggers: Build → Test → Deploy to production

# Development deployment (feature branches)
git push origin feature/branch-name
# Triggers: Build → Test → Deploy to preview URL
```

### Manual Deployment
```bash
# Using Vercel CLI
npm install -g vercel
vercel login
vercel --prod  # Deploy to production
vercel         # Deploy to preview
```

### Build Process
1. **Install Dependencies**: `pnpm install`
2. **Copy Assets**: `pnpm copy-svg`
3. **Build Application**: `pnpm build`
4. **Optimize Assets**: Next.js optimization
5. **Deploy**: Upload to Vercel Edge Network

## Build Optimization

### Bundle Analysis
```bash
# Analyze bundle size
pnpm build
# Check .next/analyze for bundle composition

# Monitor bundle size
npx @next/bundle-analyzer
```

### Performance Optimizations
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Asset Compression**: Gzip and Brotli compression
- **CDN Caching**: Vercel Edge Network caching

### Build Artifacts
```
.next/
├── static/           # Static assets with hashes
├── server/           # Server-side code
├── cache/            # Build cache
└── standalone/       # Standalone deployment files
```

## Environment Configuration

### Production Environment
```bash
# Environment: Production
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_API_URL=https://node-backend-eeva.vercel.app/api

# Security
VERCEL_PROTECTION_BYPASS=0a2eba8c751892e035f6b96605600fae

# Analytics (if configured)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Development Environment
```bash
# Environment: Development
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Debug settings
DEBUG=next:*
NEXT_DEBUG=true
```

### Staging Environment (Future)
```bash
# Environment: Staging
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=staging
NEXT_PUBLIC_API_URL=https://staging-backend-eeva.vercel.app/api
```

## Domain Configuration

### Custom Domain Setup
1. **Add Domain in Vercel**: Dashboard → Project → Domains
2. **Configure DNS**: Point domain to Vercel
3. **SSL Certificate**: Automatically provisioned by Vercel

### Current Domains
- **Production**: `react-web-eeva.vercel.app`
- **Custom Domain**: To be configured
- **Preview URLs**: Auto-generated for feature branches

## Monitoring and Logging

### Vercel Analytics
- **Performance Metrics**: Core Web Vitals
- **Usage Analytics**: Page views and user interactions
- **Error Tracking**: Runtime errors and build failures

### Application Monitoring
```typescript
// Error boundary for production error tracking
export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error('Production Error:', error, errorInfo);
    
    // Send to error tracking service (future)
    // errorTracker.captureException(error, errorInfo);
  }
}
```

### Performance Monitoring
```typescript
// Web Vitals reporting
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send metrics to analytics service
  console.log('Web Vital:', metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## Security Considerations

### HTTPS Configuration
- **SSL/TLS**: Automatically configured by Vercel
- **HSTS**: HTTP Strict Transport Security enabled
- **Certificate Management**: Automatic renewal

### API Security
```typescript
// API proxy with security headers
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Proxy to backend with authentication
  const response = await fetch(`${BACKEND_URL}${req.url}`, {
    method: req.method,
    headers: {
      'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS,
      'Authorization': req.headers.authorization,
      'Content-Type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });
  
  return res.json(await response.json());
}
```

### Environment Security
- **Environment Variables**: Secure storage in Vercel
- **API Keys**: Never exposed to client-side code
- **CORS Configuration**: Properly configured for security

## Troubleshooting

### Common Build Issues

#### Build Failures
```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. TypeScript errors
# 2. Missing dependencies
# 3. Environment variable issues

# Local debugging
pnpm build
# Fix issues locally before pushing
```

#### Runtime Errors
```bash
# Check Vercel function logs
# Common issues:
# 1. API proxy configuration
# 2. Environment variable access
# 3. Client/server hydration mismatches
```

### Performance Issues
```bash
# Bundle size analysis
npx @next/bundle-analyzer

# Performance profiling
# Use React DevTools Profiler
# Monitor Core Web Vitals in production
```

### Deployment Rollback
```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy previous commit
git revert HEAD
git push origin main
```

## Maintenance

### Regular Tasks
- **Dependency Updates**: Monthly security updates
- **Performance Monitoring**: Weekly performance reviews
- **Error Monitoring**: Daily error log reviews
- **Backup Verification**: Ensure code is properly versioned

### Update Process
```bash
# Update dependencies
pnpm update

# Test locally
pnpm build
pnpm start

# Deploy to staging (when available)
git push origin staging

# Deploy to production
git push origin main
```

### Scaling Considerations
- **Vercel Pro**: For higher usage limits
- **Edge Functions**: For global performance
- **Database Scaling**: Backend considerations
- **CDN Optimization**: Asset delivery optimization

## Future Improvements

### Planned Enhancements
- **Staging Environment**: Dedicated staging deployment
- **Advanced Monitoring**: Error tracking and performance monitoring
- **CI/CD Pipeline**: Enhanced testing and deployment automation
- **Progressive Web App**: PWA capabilities for mobile experience

### Infrastructure Roadmap
- **Multi-region Deployment**: Global edge deployment
- **Advanced Caching**: Sophisticated caching strategies
- **Load Testing**: Performance testing under load
- **Disaster Recovery**: Backup and recovery procedures

---

*For environment-specific configuration details, see [Environment Configuration](./environments.md).*
