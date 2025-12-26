import { SearchResult } from '../hooks/useSearch';

/**
 * Navigation utilities for search results
 * Handles routing to appropriate detail pages based on result type
 */

export interface NavigationOptions {
  openInNewTab?: boolean;
  preserveSearchState?: boolean;
}

export class SearchNavigationService {
  /**
   * Navigate to the appropriate detail page for a search result
   */
  static navigateToResult(
    result: SearchResult,
    router?: any,
    options: NavigationOptions = {}
  ): void {
    const { openInNewTab = false } = options;

    let url = this.getResultUrl(result);

    if (!url) {
      console.warn('No navigation URL found for result:', result);
      return;
    }

    // Preserve mobile app parameters if they exist in current URL
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');

      if (mobile || token) {
        const urlObj = new URL(url, window.location.origin);
        if (mobile) urlObj.searchParams.set('mobile', mobile);
        if (token) urlObj.searchParams.set('token', token);
        url = urlObj.pathname + urlObj.search;

        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('🔗 Search navigation preserving params:', { mobile, token, finalUrl: url });
        }
      }
    }

    if (openInNewTab) {
      window.open(url, '_blank');
    } else if (router && router.push) {
      // Next.js router navigation
      router.push(url);
    } else {
      // Fallback to window.location
      window.location.href = url;
    }

    // Track navigation for analytics if needed
    this.trackNavigation(result, url);
  }

  /**
   * Get the URL for a search result based on its type
   */
  static getResultUrl(result: SearchResult): string | null {
    switch (result.type) {
      case 'task':
        return `/view-task/${result.id}`;
      
      case 'event':
        return `/view-event/${result.id}`;
      
      case 'note':
        return `/edit-note/${result.id}`;
      
      case 'file':
        return `/view-file/${result.id}`;
      
      default:
        console.warn('Unknown result type:', result.type);
        return null;
    }
  }

  /**
   * Check if a navigation URL is valid/exists
   */
  static async isValidUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get navigation context for a result (breadcrumbs, parent info, etc.)
   */
  static getNavigationContext(result: SearchResult): {
    breadcrumbs: string[];
    parentType?: string;
    parentId?: string;
  } {
    const breadcrumbs = ['Search'];
    
    switch (result.type) {
      case 'task':
        breadcrumbs.push('Tasks', result.title);
        break;
      case 'event':
        breadcrumbs.push('Events', result.title);
        break;
      case 'note':
        breadcrumbs.push('Notes', result.title);
        break;
      case 'file':
        breadcrumbs.push('Files', result.title);
        break;
    }

    return {
      breadcrumbs,
      parentType: result.type,
      parentId: result.id,
    };
  }

  /**
   * Track navigation for analytics
   */
  private static trackNavigation(result: SearchResult, url: string): void {
    // Implement analytics tracking here
    console.log('Navigation tracked:', {
      resultType: result.type,
      resultId: result.id,
      url,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * React hook for search navigation
 */
export const useSearchNavigation = () => {
  const navigateToResult = (
    result: SearchResult, 
    options: NavigationOptions = {}
  ) => {
    SearchNavigationService.navigateToResult(result, null, options);
  };

  const getResultUrl = (result: SearchResult) => {
    return SearchNavigationService.getResultUrl(result);
  };

  const getNavigationContext = (result: SearchResult) => {
    return SearchNavigationService.getNavigationContext(result);
  };

  return {
    navigateToResult,
    getResultUrl,
    getNavigationContext,
  };
};

/**
 * Navigation utilities for different result types
 */
export const TaskNavigation = {
  viewTask: (taskId: string, router?: any, returnTo?: string) => {
    const currentPath = returnTo || window.location.pathname;
    let url = `/view-task/${taskId}?returnTo=${encodeURIComponent(currentPath)}`;

    // Preserve mobile app parameters
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');

      if (mobile || token) {
        const urlObj = new URL(url, window.location.origin);
        if (mobile) urlObj.searchParams.set('mobile', mobile);
        if (token) urlObj.searchParams.set('token', token);
        url = urlObj.pathname + urlObj.search;
      }
    }

    if (router?.push) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  },

  editTask: (taskId: string, router?: any, returnTo?: string) => {
    // Determine returnTo path (explicit, or fall back to current page)
    const baseReturnTo = returnTo || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/home');
    let url = `/edit-task/${taskId}?returnTo=${encodeURIComponent(baseReturnTo)}`;

    // Preserve mobile app parameters
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');

      if (mobile || token) {
        const urlObj = new URL(url, window.location.origin);
        if (mobile) urlObj.searchParams.set('mobile', mobile);
        if (token) urlObj.searchParams.set('token', token);
        url = urlObj.pathname + urlObj.search;
      }
    }

    if (router?.push) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  },
};

export const EventNavigation = {
  viewEvent: (eventId: string, router?: any, returnTo?: string) => {
    let url = `/view-event/${eventId}`;

    // Add returnTo parameter if provided
    if (returnTo) {
      url += `?returnTo=${encodeURIComponent(returnTo)}`;
    }

    // Preserve mobile app parameters
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');

      if (mobile || token) {
        const urlObj = new URL(url, window.location.origin);
        if (mobile) urlObj.searchParams.set('mobile', mobile);
        if (token) urlObj.searchParams.set('token', token);
        url = urlObj.pathname + urlObj.search;
      }
    }

    if (router?.push) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  },

  editEvent: (eventId: string, router?: any, returnTo?: string) => {
    let url = `/edit-event/${eventId}`;

    // Add returnTo parameter if provided
    if (returnTo) {
      url += `?returnTo=${encodeURIComponent(returnTo)}`;
    }

    // Preserve mobile app parameters
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');

      if (mobile || token) {
        const urlObj = new URL(url, window.location.origin);
        if (mobile) urlObj.searchParams.set('mobile', mobile);
        if (token) urlObj.searchParams.set('token', token);
        url = urlObj.pathname + urlObj.search;
      }
    }

    if (router?.push) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  },
};

export const NoteNavigation = {
  viewNote: (noteId: string, router?: any, returnTo?: string) => {
    let url = `/view-note/${noteId}`;

    // Add returnTo parameter if provided
    if (returnTo) {
      url += `?returnTo=${encodeURIComponent(returnTo)}`;
    }

    // Preserve mobile app parameters
    if (typeof window !== 'undefined') {
      const currentParams = new URLSearchParams(window.location.search);
      const mobile = currentParams.get('mobile');
      const token = currentParams.get('token');

      if (mobile || token) {
        const urlObj = new URL(url, window.location.origin);
        if (mobile) urlObj.searchParams.set('mobile', mobile);
        if (token) urlObj.searchParams.set('token', token);
        url = urlObj.pathname + urlObj.search;
      }
    }

    if (router?.push) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  },

  editNote: (noteId: string, router?: any, returnTo?: string) => {
    // Determine returnTo path (explicit, or fall back to current page)
    const baseReturnTo = returnTo || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/home');
    let url = `/edit-note/${noteId}?returnTo=${encodeURIComponent(baseReturnTo)}`;

    if (router?.push) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  },
};

export const FileNavigation = {
  viewFile: (fileId: string, router?: any) => {
    const url = `/view-file/${fileId}`;
    if (router?.push) {
      router.push(url);
    } else {
      window.location.href = url;
    }
  },
  
  downloadFile: (fileId: string, filename?: string) => {
    // Implement file download logic
    const url = `/api/files/${fileId}/download`;
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

/**
 * Utility to encode search result data for URL parameters
 */
export const encodeSearchResultForUrl = (result: SearchResult): string => {
  try {
    return encodeURIComponent(JSON.stringify({
      id: result.id,
      title: result.title,
      type: result.type,
      // Include minimal data to avoid URL length issues
    }));
  } catch (error) {
    console.error('Error encoding search result:', error);
    return '';
  }
};

/**
 * Utility to decode search result data from URL parameters
 */
export const decodeSearchResultFromUrl = (encoded: string): Partial<SearchResult> | null => {
  try {
    return JSON.parse(decodeURIComponent(encoded));
  } catch (error) {
    console.error('Error decoding search result:', error);
    return null;
  }
};

/**
 * Generate a shareable URL for a search result
 */
export const generateShareableUrl = (result: SearchResult): string => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const resultUrl = SearchNavigationService.getResultUrl(result);
  
  if (!resultUrl) {
    return baseUrl;
  }
  
  return `${baseUrl}${resultUrl}`;
};

export default SearchNavigationService;
