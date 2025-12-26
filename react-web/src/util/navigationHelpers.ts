'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Parameters that should be preserved across navigation
 */
const PERSISTENT_PARAMS = ['mobile', 'token'] as const;

/**
 * Extracts persistent parameters from current URL search params
 */
export const extractPersistentParams = (searchParams: URLSearchParams): Record<string, string> => {
  const params: Record<string, string> = {};
  
  PERSISTENT_PARAMS.forEach(param => {
    const value = searchParams.get(param);
    if (value) {
      params[param] = value;
    }
  });
  
  return params;
};

/**
 * Builds a URL with persistent parameters preserved
 */
export const buildUrlWithPersistentParams = (
  basePath: string,
  currentSearchParams: URLSearchParams,
  additionalParams?: Record<string, string>
): string => {
  const persistentParams = extractPersistentParams(currentSearchParams);
  const allParams = { ...persistentParams, ...additionalParams };

  // Parse the basePath to separate path and existing query params
  const [pathOnly, existingQuery] = basePath.split('?');

  // Start with existing query params if they exist
  const queryParams = new URLSearchParams(existingQuery || '');

  // Add persistent and additional params
  Object.entries(allParams).forEach(([key, value]) => {
    if (value) {
      queryParams.set(key, value);
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${pathOnly}?${queryString}` : pathOnly;
};

/**
 * Enhanced router.push that preserves mobile app parameters
 */
export const pushWithPersistentParams = (
  router: AppRouterInstance,
  path: string,
  currentSearchParams: URLSearchParams,
  additionalParams?: Record<string, string>
) => {
  const urlWithParams = buildUrlWithPersistentParams(path, currentSearchParams, additionalParams);
  
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('🔗 Navigation with persistent params:', {
      originalPath: path,
      finalUrl: urlWithParams,
      persistentParams: extractPersistentParams(currentSearchParams),
      additionalParams
    });
  }
  
  router.push(urlWithParams);
};

/**
 * Enhanced router.replace that preserves mobile app parameters
 */
export const replaceWithPersistentParams = (
  router: AppRouterInstance,
  path: string,
  currentSearchParams: URLSearchParams,
  additionalParams?: Record<string, string>
) => {
  const urlWithParams = buildUrlWithPersistentParams(path, currentSearchParams, additionalParams);
  
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('🔄 Replace with persistent params:', {
      originalPath: path,
      finalUrl: urlWithParams,
      persistentParams: extractPersistentParams(currentSearchParams),
      additionalParams
    });
  }
  
  router.replace(urlWithParams);
};

/**
 * Hook for navigation with persistent parameters
 */
export const useNavigationWithPersistentParams = (searchParams: URLSearchParams) => {
  return {
    buildUrl: (path: string, additionalParams?: Record<string, string>) => 
      buildUrlWithPersistentParams(path, searchParams, additionalParams),
    
    push: (router: AppRouterInstance, path: string, additionalParams?: Record<string, string>) =>
      pushWithPersistentParams(router, path, searchParams, additionalParams),
    
    replace: (router: AppRouterInstance, path: string, additionalParams?: Record<string, string>) =>
      replaceWithPersistentParams(router, path, searchParams, additionalParams),
  };
};

/**
 * Creates a Link href that preserves persistent parameters
 */
export const createLinkHref = (
  path: string,
  currentSearchParams: URLSearchParams,
  additionalParams?: Record<string, string>
): string => {
  return buildUrlWithPersistentParams(path, currentSearchParams, additionalParams);
};
