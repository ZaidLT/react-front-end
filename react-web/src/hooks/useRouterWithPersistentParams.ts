'use client';

import { useRouter as useNextRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { buildUrlWithPersistentParams } from '../util/navigationHelpers';

/**
 * Custom router hook that automatically preserves mobile and token parameters
 * This replaces the need to manually use pushWithPersistentParams everywhere
 */
export const useRouterWithPersistentParams = () => {
  const router = useNextRouter();
  const searchParams = useSearchParams();

  const push = useCallback((url: string, options?: { scroll?: boolean }) => {
    const urlWithParams = buildUrlWithPersistentParams(url, searchParams);
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🔗 Auto-preserving params in router.push:', {
        originalUrl: url,
        finalUrl: urlWithParams,
        preservedParams: {
          mobile: searchParams.get('mobile'),
          token: searchParams.get('token'),
          lang: searchParams.get('lang'),
        }
      });
    }
    
    return router.push(urlWithParams, options);
  }, [router, searchParams]);

  const replace = useCallback((url: string, options?: { scroll?: boolean }) => {
    const urlWithParams = buildUrlWithPersistentParams(url, searchParams);
    
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🔄 Auto-preserving params in router.replace:', {
        originalUrl: url,
        finalUrl: urlWithParams,
        preservedParams: {
          mobile: searchParams.get('mobile'),
          token: searchParams.get('token'),
          lang: searchParams.get('lang'),
        }
      });
    }
    
    return router.replace(urlWithParams, options);
  }, [router, searchParams]);

  // Return all router methods, with push/replace overridden
  return {
    ...router,
    push,
    replace,
  };
};

/**
 * Drop-in replacement for useRouter that automatically preserves parameters
 * Just change: import { useRouter } from 'next/navigation'
 * To: import { useRouter } from '../hooks/useRouterWithPersistentParams'
 */
export const useRouter = useRouterWithPersistentParams;
