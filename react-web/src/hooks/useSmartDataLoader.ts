import { useCallback, useEffect, useState, useRef } from 'react';
import { useTaskStore, useEventStore, useTileStore, useCacheStore } from '../context/store';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/taskService';
import tileService from '../services/tileService';
import { getEventsByUser } from '../services/services';
import { ETileType } from '../util/types';
import { debugLog } from '../util/debug';

interface UseSmartDataLoaderOptions {
  enableBackgroundRefresh?: boolean;
  cacheMaxAge?: number; // in milliseconds
  onDataUpdated?: (dataType: 'tasks' | 'events' | 'tiles') => void;
}

interface UseSmartDataLoaderReturn {
  isInitialLoading: boolean;
  isRefreshing: boolean;
  hasData: boolean;
  refreshData: () => Promise<void>;
  lastRefresh: number;
}

export const useSmartDataLoader = (options: UseSmartDataLoaderOptions = {}): UseSmartDataLoaderReturn => {
  const {
    enableBackgroundRefresh = true,
    cacheMaxAge = 5 * 60 * 1000, // 5 minutes default
    onDataUpdated
  } = options;

  const { user } = useAuth();
  const { tasks, setTasks } = useTaskStore();
  const { events, setEvents } = useEventStore();
  const { tiles, setTiles } = useTileStore();
  const {
    setLastFetched,
    setRefreshing,
    isCacheValid,
    tasks: taskCache,
    events: eventCache,
    tiles: tileCache
  } = useCacheStore();

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const initializationRef = useRef(false);

  // Track mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Check if we have any cached data
  const hasData = tasks.length > 0 || events.length > 0 || tiles.length > 0;

  // Check if any cache is currently refreshing
  const isRefreshing = taskCache.isRefreshing || eventCache.isRefreshing || tileCache.isRefreshing;

  // Get the most recent refresh time
  const lastRefresh = Math.max(taskCache.lastFetched, eventCache.lastFetched, tileCache.lastFetched);

  // Load tiles from API with smart caching
  const loadTiles = useCallback(async (forceRefresh = false) => {

    if (!user || typeof window === 'undefined') return;

    const shouldRefresh = forceRefresh || !isCacheValid('tiles', cacheMaxAge);

    if (!shouldRefresh && tiles.length > 0) {
      return;
    }

    try {
      setRefreshing('tiles', true);

      // Try to load tiles from API first (prime full tiles for all pages)
      try {
        const allTiles = await tileService.getAllTilesByUser(user.id, user.accountId || '');

        if (allTiles && allTiles.length > 0) {
          // Filter to only show the main tiles for the home page view
          const mainTiles = allTiles.filter(tile =>
            !tile.Deleted &&
            tile.Active &&
            // Only show parent tiles (no parentId) or specific main tile types
            (!(tile as any).ParentUniqueId || [ETileType['My Hive'], ETileType.EevaHive, ETileType.House].includes(tile.Type))
          );

          // If we have main tiles, ensure the 3 primary tiles are present (House, My Hive, Eeva Hive)
          if (mainTiles.length > 0) {
            const hasType = (type: number) => mainTiles.some(t => t.Type === type);
            const supplemented: typeof mainTiles = [...mainTiles];

            // Add missing My Hive
            if (!hasType(ETileType['My Hive'])) {
              supplemented.push({
                Account_uniqueId: user.accountId || '1',
                Active: true,
                Deleted: false,
                CreationTimestamp: new Date().toISOString(),
                Name: 'My Hive',
                Type: ETileType['My Hive'],
                UniqueId: 'my-hive-static',
                UpdateTimestamp: new Date().toISOString(),
                User_uniqueId: user.id
              } as any);
            }

            // Add missing Eeva Hive
            if (!hasType(ETileType.EevaHive)) {
              supplemented.push({
                Account_uniqueId: user.accountId || '2',
                Active: true,
                Deleted: false,
                CreationTimestamp: new Date().toISOString(),
                Name: 'Eeva Hive',
                Type: ETileType.EevaHive,
                UniqueId: 'eeva-hive-static',
                UpdateTimestamp: new Date().toISOString(),
                User_uniqueId: user.id
              } as any);
            }

            // Add missing House
            if (!hasType(ETileType.House)) {
              supplemented.push({
                Account_uniqueId: user.accountId || '3',
                Active: true,
                Deleted: false,
                CreationTimestamp: new Date().toISOString(),
                Name: 'House',
                Type: ETileType.House,
                UniqueId: 'house-static',
                UpdateTimestamp: new Date().toISOString(),
                User_uniqueId: user.id
              } as any);
            }

            // Prime full tiles into the store (so child pages render from cache)
            const augmentedAllTiles = [...allTiles];

            // If any of the three primary tiles are missing, append synthetic ones
            if (!hasType(ETileType['My Hive'])) {
              augmentedAllTiles.push({
                Account_uniqueId: user.accountId || '1',
                Active: true,
                Deleted: false,
                CreationTimestamp: new Date().toISOString(),
                Name: 'My Hive',
                Type: ETileType['My Hive'],
                UniqueId: 'my-hive-static',
                UpdateTimestamp: new Date().toISOString(),
                User_uniqueId: user.id
              } as any);
            }
            if (!hasType(ETileType.EevaHive)) {
              augmentedAllTiles.push({
                Account_uniqueId: user.accountId || '2',
                Active: true,
                Deleted: false,
                CreationTimestamp: new Date().toISOString(),
                Name: 'Eeva Hive',
                Type: ETileType.EevaHive,
                UniqueId: 'eeva-hive-static',
                UpdateTimestamp: new Date().toISOString(),
                User_uniqueId: user.id
              } as any);
            }
            if (!hasType(ETileType.House)) {
              augmentedAllTiles.push({
                Account_uniqueId: user.accountId || '3',
                Active: true,
                Deleted: false,
                CreationTimestamp: new Date().toISOString(),
                Name: 'House',
                Type: ETileType.House,
                UniqueId: 'house-static',
                UpdateTimestamp: new Date().toISOString(),
                User_uniqueId: user.id
              } as any);
            }

            setTiles(augmentedAllTiles);
            setLastFetched('tiles');
            onDataUpdated?.('tiles');
            return;
          }

          // If we only got child tiles (rooms), fall back to static tiles
          // This happens when the API returns space tiles instead of main tiles
        }
      } catch (apiError) {
        console.warn('API tiles loading failed, falling back to static tiles:', apiError);
      }

      // Fallback to static tiles if API fails or returns no data
      const staticTiles = [
        {
          Account_uniqueId: user.accountId || '1',
          Active: true,
          Deleted: false,
          CreationTimestamp: new Date().toISOString(),
          Name: 'My Hive',
          Type: ETileType['My Hive'],
          UniqueId: 'my-hive-static',
          UpdateTimestamp: new Date().toISOString(),
          User_uniqueId: user.id
        },
        {
          Account_uniqueId: user.accountId || '2',
          Active: true,
          Deleted: false,
          CreationTimestamp: new Date().toISOString(),
          Name: 'Eeva Hive',
          Type: ETileType.EevaHive,
          UniqueId: 'eeva-hive-static',
          UpdateTimestamp: new Date().toISOString(),
          User_uniqueId: user.id
        },
        {
          Account_uniqueId: user.accountId || '3',
          Active: true,
          Deleted: false,
          CreationTimestamp: new Date().toISOString(),
          Name: 'House',
          Type: ETileType.House,
          UniqueId: 'house-static',
          UpdateTimestamp: new Date().toISOString(),
          User_uniqueId: user.id
        }
      ];

      setTiles(staticTiles);
      setLastFetched('tiles');
      onDataUpdated?.('tiles');

    } catch (error) {
      console.error('Error loading tiles:', error);
    } finally {
      setRefreshing('tiles', false);
    }
  }, [user, cacheMaxAge, isCacheValid, tiles.length, setTiles, setLastFetched, setRefreshing, onDataUpdated]);

  // Load tasks with smart caching
  const loadTasks = useCallback(async (forceRefresh = false) => {

    if (!user || typeof window === 'undefined') return;

    const shouldRefresh = forceRefresh || !isCacheValid('tasks', cacheMaxAge);

    if (!shouldRefresh && tasks.length > 0) {
      return;
    }

    try {
      setRefreshing('tasks', true);

      const tasksData = await taskService.getTasksByUser(user.id, user.accountId || '', false);
      
      // Only update if data actually changed
      const hasChanges = JSON.stringify(tasksData) !== JSON.stringify(tasks);
      if (hasChanges || forceRefresh) {
        setTasks(tasksData);
        setLastFetched('tasks');
        onDataUpdated?.('tasks');
      } else {
        setLastFetched('tasks'); // Update timestamp even if no changes
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setRefreshing('tasks', false);
    }
  }, [user, cacheMaxAge, isCacheValid, tasks, setTasks, setLastFetched, setRefreshing, onDataUpdated]); // Include all dependencies

  // Load events with smart caching
  const loadEvents = useCallback(async (forceRefresh = false) => {

    if (!user || typeof window === 'undefined') return;

    const shouldRefresh = forceRefresh || !isCacheValid('events', cacheMaxAge);

    if (!shouldRefresh && events.length > 0) {
      return;
    }

    try {
      setRefreshing('events', true);

      const eventsData = await getEventsByUser(user.id, user.accountId);
      
      // Only update if data actually changed
      const hasChanges = JSON.stringify(eventsData) !== JSON.stringify(events);
      if (hasChanges || forceRefresh) {
        setEvents(eventsData);
        setLastFetched('events');
        onDataUpdated?.('events');
      } else {
        setLastFetched('events'); // Update timestamp even if no changes
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setRefreshing('events', false);
    }
  }, [user, cacheMaxAge, isCacheValid, events, setEvents, setLastFetched, setRefreshing, onDataUpdated]); // Include all dependencies

  // Manual refresh function
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadTiles(true),
      loadTasks(true),
      loadEvents(true)
    ]);
  }, [loadTiles, loadTasks, loadEvents]);

  // Initial load effect - only run once when user is available
  useEffect(() => {
    console.log('🔍 useSmartDataLoader useEffect triggered');
    console.log('🔍 user?.id:', user?.id);
    console.log('🔍 isMounted:', isMounted);
    console.log('🔍 initializationRef.current:', initializationRef.current);

    if (!user?.id || !isMounted || initializationRef.current) {
      console.log('🔍 useSmartDataLoader early return');
      return;
    }

    const initializeData = async () => {

      console.log('🔍 useSmartDataLoader initializeData starting');
      initializationRef.current = true;

      debugLog('Smart data loader initializing...');

      const hasAnyCache = isCacheValid('tasks') || isCacheValid('events') || tiles.length > 0;
      console.log('🔍 hasAnyCache:', hasAnyCache, 'tiles.length:', tiles.length);

      if (!hasAnyCache) {
        console.log('🔍 Setting isInitialLoading to true');
        setIsInitialLoading(true);
      }

      try {
        // Load data (from cache or API)
        await refreshData();

        debugLog('Smart data loader initialization complete');
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {

        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    initializeData();
  }, [user?.id, isMounted, isCacheValid, tiles.length, loadTiles, loadTasks, loadEvents]); // Include all dependencies

  // Background refresh effect
  useEffect(() => {
    if (!enableBackgroundRefresh || !user?.id) return;

    const interval = setInterval(() => {
      // Only refresh if not currently refreshing and cache is stale
      if (!isRefreshing) {
        if (!isCacheValid('tiles', cacheMaxAge)) {
          loadTiles();
        }
        if (!isCacheValid('tasks', cacheMaxAge)) {
          loadTasks();
        }
        if (!isCacheValid('events', cacheMaxAge)) {
          loadEvents();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [enableBackgroundRefresh, user?.id, isRefreshing, isCacheValid, cacheMaxAge, loadTiles, loadTasks, loadEvents]); // Include all dependencies

  return {
    isInitialLoading,
    isRefreshing,
    hasData,
    refreshData,
    lastRefresh
  };
};
