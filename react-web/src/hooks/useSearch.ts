'use client';

import { useState, useCallback, useEffect } from 'react';
import { debounce } from 'lodash';

// Types matching the search API response
export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'event' | 'note' | 'file';
  date?: string;
  data: any;
}

export interface SearchResponse {
  results: SearchResult[];
  count: number;
  query?: string;
  types: string[];
}

export interface SearchFilters {
  types?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface UseSearchOptions {
  debounceMs?: number;
  autoSearch?: boolean;
  initialQuery?: string;
  filters?: SearchFilters;
}

export interface UseSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  count: number;
  
  // Actions
  setQuery: (query: string) => void;
  search: (searchQuery?: string) => Promise<void>;
  clearResults: () => void;
  setFilters: (filters: SearchFilters) => void;
  
  // Computed
  hasResults: boolean;
  hasQuery: boolean;
}

export const useSearch = (
  accountId: string,
  userId: string,
  options: UseSearchOptions = {}
): UseSearchReturn => {
  const {
    debounceMs = 300,
    autoSearch = true,
    initialQuery = '',
    filters: initialFilters = {}
  } = options;

  // State
  const [query, setQueryState] = useState<string>(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Perform the actual search API call
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        accountId,
        userId,
        query: searchQuery.trim()
      });

      // Add type filters if specified
      if (filters.types && filters.types.length > 0) {
        params.append('types', filters.types.join(','));
      }

      const response = await fetch(`/api/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed with status ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please try again.';
      setError(errorMessage);
      setResults([]);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, userId, filters]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      performSearch(searchQuery);
    }, debounceMs),
    [performSearch, debounceMs]
  );

  // Public search function
  const search = useCallback(async (searchQuery?: string) => {
    const queryToSearch = searchQuery !== undefined ? searchQuery : query;
    await performSearch(queryToSearch);
  }, [performSearch, query]);

  // Set query with optional auto-search
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    if (autoSearch) {
      if (newQuery.trim()) {
        debouncedSearch(newQuery);
      } else {
        // Cancel pending debounced search and clear results immediately
        debouncedSearch.cancel();
        setResults([]);
        setError(null);
      }
    }
  }, [autoSearch, debouncedSearch]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    debouncedSearch.cancel();
  }, [debouncedSearch]);

  // Update filters and re-search if needed
  const setFiltersAndSearch = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // If we have a query and auto-search is enabled, re-search with new filters
    if (autoSearch && query.trim()) {
      // Use a small delay to ensure filters are updated
      setTimeout(() => {
        performSearch(query);
      }, 50);
    }
  }, [autoSearch, query, performSearch]);

  // Effect to handle initial search if initialQuery is provided
  useEffect(() => {
    if (initialQuery && autoSearch) {
      debouncedSearch(initialQuery);
    }
  }, [initialQuery, autoSearch, debouncedSearch]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Computed values
  const hasResults = results.length > 0;
  const hasQuery = query.trim().length > 0;
  const count = results.length;

  return {
    // State
    query,
    results,
    isLoading,
    error,
    count,
    
    // Actions
    setQuery,
    search,
    clearResults,
    setFilters: setFiltersAndSearch,
    
    // Computed
    hasResults,
    hasQuery,
  };
};

// Helper hook for grouped search results (matching React Native implementation)
export interface GroupedSearchResults {
  tasks: SearchResult[];
  events: SearchResult[];
  notes: SearchResult[];
  files: SearchResult[];
}

export const useGroupedSearchResults = (results: SearchResult[]): GroupedSearchResults => {
  return {
    tasks: results.filter(r => r.type === 'task'),
    events: results.filter(r => r.type === 'event'),
    notes: results.filter(r => r.type === 'note'),
    files: results.filter(r => r.type === 'file'),
  };
};

// Helper hook for search result navigation
export const useSearchNavigation = () => {
  const navigateToResult = useCallback((result: SearchResult) => {
    switch (result.type) {
      case 'task':
        // Navigate to task detail page with return path
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/edit-task/${result.id}?returnTo=${encodeURIComponent(currentPath)}`;
        break;
      case 'event':
        // Navigate to event detail page with return path
        const currentPathForEvent = window.location.pathname + window.location.search;
        window.location.href = `/edit-event/${result.id}?returnTo=${encodeURIComponent(currentPathForEvent)}`;
        break;
      case 'note':
        // Navigate to note detail page with return path
        const currentPathForNote = window.location.pathname + window.location.search;
        window.location.href = `/edit-note/${result.id}?returnTo=${encodeURIComponent(currentPathForNote)}`;
        break;
      case 'file':
        // Navigate to file detail page
        window.location.href = `/view-file/${result.id}`;
        break;
      default:
        console.warn('Unknown result type:', result.type);
    }
  }, []);

  return { navigateToResult };
};

export default useSearch;
