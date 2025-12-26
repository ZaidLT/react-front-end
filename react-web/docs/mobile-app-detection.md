# Mobile App Detection Solution

## Overview

This document describes the comprehensive mobile app detection system implemented to solve issues where the `mobile=true` parameter might be lost during navigation, causing the header and tab bar to show when they shouldn't.

## Problem Statement

- Sometimes the `mobile=true` parameter gets lost during navigation
- This causes the header and tab bar to appear in mobile app contexts when they should be hidden
- Need a reliable backstop to detect when the browser is running inside a mobile app WebView

## Solution Components

### 1. Enhanced Mobile Detection Utility (`src/util/mobileTheme.ts`)

**New Functions:**
- `detectMobileAppWebView()`: Detects WKWebView (iOS) and Android WebView contexts
- `detectMobileApp()`: Comprehensive detection using both URL parameters and WebView detection
- Enhanced `setMobileTheme()` and `useMobileTheme()` with better logging

**WebView Detection Logic:**
```typescript
// iOS WKWebView Detection
const isWKWebView = /AppleWebKit/.test(userAgent) && 
                    !/Safari/.test(userAgent) && 
                    !/Chrome/.test(userAgent) &&
                    !/CriOS/.test(userAgent) &&
                    !/FxiOS/.test(userAgent);

// Android WebView Detection  
const isAndroidWebView = /Android/.test(userAgent) && 
                         /wv/.test(userAgent);

// Custom App User Agent (if implemented)
const isEevaApp = /EevaApp/.test(userAgent);
```

### 2. Mobile App Detection Hook (`src/hooks/useMobileAppDetection.ts`)

**Features:**
- Comprehensive mobile app detection with fallback methods
- Automatic theme setting
- Detection method tracking for debugging
- Lightweight `useIsMobileApp()` hook for simple boolean checks

**Usage:**
```typescript
const { isMobileApp, detectionMethod, isDetectedByUrl, isDetectedByWebView } = useMobileAppDetection();
// or
const isMobileApp = useIsMobileApp();
```

### 3. Navigation Helpers (`src/util/navigationHelpers.ts`)

**Functions:**
- `extractPersistentParams()`: Extracts mobile and token parameters
- `buildUrlWithPersistentParams()`: Builds URLs preserving parameters
- `pushWithPersistentParams()`: Enhanced router.push with parameter preservation
- `replaceWithPersistentParams()`: Enhanced router.replace with parameter preservation
- `createLinkHref()`: Creates Link hrefs with preserved parameters

**Usage:**
```typescript
// For router navigation
const { push } = useNavigationWithPersistentParams(searchParams);
push(router, '/some-page');

// For Link components
<Link href={createLinkHref('/some-page', searchParams)}>
```

### 4. Updated Navigation Components

**Updated Components:**
- `TabBar.tsx`: Uses comprehensive mobile detection and preserves parameters in links
- `TimelineItem.tsx`: Preserves parameters when navigating to task details
- `searchNavigation.ts`: All navigation functions now preserve mobile parameters

### 5. Existing Middleware Enhancement

The existing middleware (`src/middleware.ts`) already preserves `mobile` and `token` parameters across navigation, which works well with the new detection system.

## Detection Priority

1. **Primary**: URL parameter `mobile=true`
2. **Secondary**: WebView detection (WKWebView or Android WebView)
3. **Tertiary**: Custom app user agent (if implemented)

## Implementation Status

### ✅ Completed
- Enhanced mobile detection utilities
- Mobile app detection hook
- Navigation helpers
- Updated TabBar component
- Updated TimelineItem component
- Updated search navigation utilities
- Test page for debugging

### 🔄 Recommended Next Steps
1. Update remaining page components to use `useMobileAppDetection()`
2. Update remaining navigation calls to use navigation helpers
3. Consider setting a custom user agent in the mobile app
4. Test thoroughly in actual mobile app WebView

## Testing

### Test Page
Visit `/mobile-detection-test` to debug mobile app detection:
- Shows detection results and methods
- Displays browser information
- Provides test URLs with different parameters

### Test Scenarios
1. **Web Browser**: Should show "WEB BROWSER"
2. **Mobile App with mobile=true**: Should show "MOBILE APP" (detected by URL)
3. **Mobile App WebView without mobile=true**: Should show "MOBILE APP" (detected by WebView)
4. **Parameter loss recovery**: WebView detection should catch cases where mobile=true is lost

## Debug Mode

Set `NEXT_PUBLIC_DEBUG_MODE=true` to enable detailed logging:
- Mobile detection results
- Navigation parameter preservation
- Theme setting operations

## Browser Compatibility

**iOS WKWebView Detection:**
- Detects AppleWebKit without Safari/Chrome/CriOS/FxiOS
- Works with iOS 9+ WKWebView

**Android WebView Detection:**
- Detects Android user agent with "wv" flag
- Works with Android 4.4+ WebView

## Future Enhancements

1. **Custom User Agent**: Set a custom user agent in the mobile app (e.g., "EevaApp/1.0")
2. **Additional Context Checks**: Use window properties or injected JavaScript for more reliable detection
3. **Fallback Storage**: Store mobile app context in localStorage as additional fallback
4. **Analytics**: Track detection method usage to optimize the system

## Migration Guide

### For Existing Components

**Before:**
```typescript
const searchParams = useSearchParams();
const isMobileApp = searchParams.get('mobile') === 'true';
```

**After:**
```typescript
const { isMobileApp } = useMobileAppDetection();
// or for simple cases:
const isMobileApp = useIsMobileApp();
```

### For Navigation

**Before:**
```typescript
router.push('/some-page');
```

**After:**
```typescript
const { push } = useNavigationWithPersistentParams(searchParams);
push(router, '/some-page');
```

### For Links

**Before:**
```typescript
<Link href="/some-page">
```

**After:**
```typescript
<Link href={createLinkHref('/some-page', searchParams)}>
```
