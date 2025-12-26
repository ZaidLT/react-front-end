'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useSearchParams } from 'next/navigation';
import CustomText from '../../components/CustomText';
import PageHeader from '../../components/PageHeader';
import DynamicGridLayout from '../../components/DynamicGridLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyStateCard from '../../components/EmptyStateCard';
import { Colors, Typography } from '../../styles';
import { ETileType } from '../../util/types';
import { useLanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { TILE_DATA_MAP } from '../../util/constants';
import taskService from '../../services/taskService';
import { useMobileAppDetection } from '../../hooks/useMobileDetection';
import { useSmartDataLoader } from '../../hooks/useSmartDataLoader';
import { emitSnackbar } from '../../util/helpers';

import { ITTask, IEEvent, EventTime, IBaseItem } from '../../services/types';
import { mapTaskToBaseItem, mapEventToBaseItem } from '../../services/mapper';
import { useTaskStore, useEventStore, useTileStore } from '../../context/store';
import TabBar from '../../components/TabBar';
import TaskEventListView from '../../components/TaskEventListView';

// Import home page styles
import './home.css';
import { PageContainer } from '../../components/layout/PageContainer';
import { ResponsiveGrid } from '../../components/layout/ResponsiveGrid';

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 * This is a top-level wrapper that completely blocks rendering until auth state is resolved
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading, isProcessingUrlToken } = useAuth();
  const router = useRouter();
  const { i18n } = useLanguageContext();


  // Quick URL cleanup for already authenticated users
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        // If we're already authenticated and there's a URL token, clean it up
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('token');
        newUrl.searchParams.delete('userId');
        newUrl.searchParams.delete('mobile');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, [isAuthenticated]);

  // Handle redirect to login if not authenticated
  useEffect(() => {
    // Don't redirect if we're still loading, processing URL token, or already authenticated
    if (!isLoading && !isProcessingUrlToken && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isProcessingUrlToken, isAuthenticated, router]);

  // Create a memoized loading component to avoid re-renders
  const LoadingComponent = React.useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <LoadingSpinner size={50} color={Colors.BLUE} />
      </div>
    ),
    []
  );

  // Create a memoized redirecting component to avoid re-renders
  const RedirectingComponent = React.useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
          }}
        >
          {i18n.t('RedirectingToLogin')}
        </CustomText>
        <LoadingSpinner size={30} color={Colors.BLUE} />
      </div>
    ),
    [i18n]
  );

  // If still loading auth state or processing URL token, show loading spinner
  if (isLoading || isProcessingUrlToken) {
    return LoadingComponent;
  }

  // If not authenticated, show redirecting message
  if (!isAuthenticated) {
    return RedirectingComponent;
  }

  // If we don't have a valid user object with ID, show loading
  if (!user || !user.id) {
    return LoadingComponent;
  }

  // Authentication is complete and we have a valid user - render the children
  return <>{children}</>;
};

/**
 * HomeContent - The actual content of the home page
 * This component only renders when authentication is complete and we have a valid user
 */
const HomeContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user, updateUser } = useAuth(); // User is guaranteed to exist by AuthGuard
  const router = useRouter(); // Add router for navigation
  const [windowWidth, setWindowWidth] = useState<number>(768); // Default to desktop width

  const timeLocale = i18n.locale === 'fr' ? 'fr-CA' : 'en-US';

  // Mobile detection using comprehensive detection (includes WebView detection)
  const searchParams = useSearchParams();
  const { isMobileApp, detectionMethod } = useMobileAppDetection();

  // One-time lang sync from ?lang on /home
  useEffect(() => {
    if (!user || !user.id) return;
    const langParam = searchParams.get('lang');
    if (!langParam) return;

    const normalized = (langParam || '').toLowerCase();
    const desiredCode = normalized === 'fr-ca' || normalized.startsWith('fr') ? 2 : 1; // 1=EN, 2=FR
    const currentCode = (user as any).language ?? 1;

    if (desiredCode !== currentCode) {
      // Immediately update session and UI locale
      updateUser({ language: desiredCode } as any);
      try {
        const { LangCodeToLocaleMap } = require('../../util/i18n');
        const nextLocale = LangCodeToLocaleMap[desiredCode] || 'en';
        i18n.setLocale(nextLocale); // triggers async backend persist as well
      } catch { }
    }

    // Clean the URL regardless
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('lang');
      window.history.replaceState({}, '', url.toString());
    } catch { }
  }, [user, searchParams, i18n, updateUser]);

  // Log detection method for debugging
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🏠 Home page mobile detection:', {
        isMobileApp,
        detectionMethod,
      });
    }
  }, [isMobileApp, detectionMethod]);

  // Restore scroll position after returning from the /eeva route (mobile route-based modal)
  useEffect(() => {
    try {
      const key = 'homeScrollY';
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const y = parseInt(saved, 10) || 0;
        sessionStorage.removeItem(key);
        requestAnimationFrame(() => window.scrollTo(0, y));
      }
    } catch { }
  }, []);


  // Get data from stores
  const { tasks, updateTasks } = useTaskStore();
  const { events } = useEventStore();
  const { tiles } = useTileStore();

  // Local state for UI
  const [eventTimes] = useState<EventTime[]>([]);
  const [urgentItems, setUrgentItems] = useState<IBaseItem[]>([]);
  const [error] = useState<string | null>(null);
  const [isEmptyStateCardVisible, setIsEmptyStateCardVisible] =
    useState<boolean>(false);

  // Smart data loading with caching and background refresh







  const openEevaTypeform = useCallback(() => {
    try {
      try {
        sessionStorage.setItem('homeScrollY', String(window.scrollY || 0));
      } catch { }
      router.push('/support', { scroll: false });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to open eeva Support:', e);
      }
    }
  }, [router]);



  const { isRefreshing, refreshData } = useSmartDataLoader({
    enableBackgroundRefresh: true,
    cacheMaxAge: 5 * 60 * 1000, // 5 minutes
    onDataUpdated: (dataType) => {
      // Recalculate urgent items when tasks or events update
      if (dataType === 'tasks' || dataType === 'events') {
        // This will be handled by the useEffect below
      }
    },
  });

  // Function to expand tasks based on event times (similar to original React Native)
  const expandTasks = useCallback(
    (tasks: IBaseItem[]): IBaseItem[] => {
      const expandedTasks: IBaseItem[] = [];

      // First, add recurring tasks that have eventTimes
      eventTimes.forEach((et) => {
        const task = tasks.find(
          (t) => t.UniqueId === et.Event_uniqueId && t.Active
        );
        if (task) {
          let tempComplete = et.Complete ?? false;
          expandedTasks.push({
            ...task,
            Active: !tempComplete,
            EventTimeId: et.UniqueId,
            Deadline_DateTime: et.EventTime,
          });
        }
      });

      // Then, add non-recurring tasks (one-time tasks) that don't have eventTimes
      tasks.forEach((task) => {
        const hasEventTime = eventTimes.some(
          (et) => et.Event_uniqueId === task.UniqueId
        );
        if (!hasEventTime && task.Active) {
          // This is a one-time task, include it directly
          expandedTasks.push({
            ...task,
            EventTimeId: undefined, // No eventTime for one-time tasks
          });
        }
      });

      return expandedTasks;
    },
    [eventTimes]
  );

  // Calculate urgent items (tasks and events due within 48 hours, matching React Native)
  const calculatedUrgentItems = useMemo(() => {
    const now = new Date();

    const mappedTasks = tasks.map(mapTaskToBaseItem);
    const expandedTasks = expandTasks(mappedTasks);

    // Filter tasks: show only incomplete tasks
    const filteredTasks = expandedTasks.filter((task: IBaseItem) => {
      const isActive = task.Active !== false; // Default to true if undefined
      const isNotDeleted = !task.Deleted;
      const isIncomplete = !task.completed; // Check if task is not completed

      // Only include tasks that are active, not deleted, and incomplete
      const shouldInclude = isActive && isNotDeleted && isIncomplete;

      return shouldInclude;
    });

    // Filter events: show all upcoming events (today and future) for TaskEventListView
    const filteredEvents = events?.filter((event) => {
      const isActive = event.Active !== false; // Default to true if undefined
      const isNotDeleted = !event.Deleted;

      // Handle invalid dates safely
      const deadlineStr = event.Deadline_DateTime ?? '';
      if (!deadlineStr) {
        return false;
      }

      const deadline = new Date(deadlineStr);
      if (isNaN(deadline.getTime())) {
        return false;
      }

      // Show all events from today onwards (including today and future events)
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const isUpcoming = deadline >= startOfToday;

      return isUpcoming && isActive && isNotDeleted;
    });

    let combinedData: IBaseItem[] = [
      ...filteredTasks,
      ...(filteredEvents?.map((event: IEEvent) => mapEventToBaseItem(event)) ||
        []),
    ];

    const allItems = combinedData.filter(
      (item: IBaseItem) => item.Active && !item.Deleted
    );

    let tempUrgentItems: IBaseItem[] = [];
    if (allItems.length > 0) {
      tempUrgentItems = allItems;

      if (tempUrgentItems.length === 0) {
        // Sort remaining items by deadline date
        tempUrgentItems = allItems
          .filter((item: IBaseItem) => new Date(item.Deadline_DateTime) > now) // Exclude past deadlines
          .sort(
            (a: IBaseItem, b: IBaseItem) =>
              new Date(a.Deadline_DateTime).getTime() -
              new Date(b.Deadline_DateTime).getTime()
          ) // Sort by date
          .slice(0, 5); // Take the first 5 items
      } else {
        // Sort urgent items by deadline date
        tempUrgentItems.sort(
          (a: IBaseItem, b: IBaseItem) =>
            new Date(a.Deadline_DateTime).getTime() -
            new Date(b.Deadline_DateTime).getTime()
        );
      }

      if (tempUrgentItems.length > 0) {
        return tempUrgentItems;
      }
    }
    return [];
  }, [tasks, events, expandTasks]);

  // Update urgentItems state when calculated items change
  useEffect(() => {
    setUrgentItems(calculatedUrgentItems);
  }, [calculatedUrgentItems]);

  // Data loading is now handled by useSmartDataLoader hook above

  // Map tiles to the format expected by DynamicGridLayout
  const mappedTiles = tiles
    .filter((tile) => {
      if (tile.Deleted) return false;

      // Handle the mobile client case where My Hive has empty/invalid type
      if (
        tile.Name === 'My Hive' &&
        (tile.Type === ETileType['My Hive'] ||
          !tile.Type ||
          tile.Type === undefined)
      ) {
        return true;
      }

      // Normal filtering for other tiles
      return [
        ETileType['My Hive'],
        ETileType.EevaHive,
        ETileType.House,
      ].includes(tile.Type);
    })
    .sort((a, b) => {
      // Handle special case for My Hive with empty type on mobile
      const getOrder = (tile: any) => {
        if (tile.Name === 'My Hive') return 2; // My Hive should be order 2
        if (tile.Name === 'House') return 1; // House should be order 1
        if (tile.Name === 'Eeva Hive') return 3; // Eeva should be order 3

        // Fallback to TILE_DATA_MAP if available
        return TILE_DATA_MAP[tile.Type]?.order || 999;
      };

      return getOrder(a) - getOrder(b);
    })
    .map((tile) => {
      // Handle mobile client case where My Hive has empty type
      let tileDataFromMap = TILE_DATA_MAP[tile.Type];

      if (!tileDataFromMap && tile.Name === 'My Hive') {
        // Fallback to My Hive data when type is empty
        tileDataFromMap = TILE_DATA_MAP[ETileType['My Hive']];
      }

      return {
        content: {
          icon: tileDataFromMap?.icon ?? 'house',
          title:
            tile.Name === 'My Hive'
              ? i18n.t('MyHive')
              : tile.Name === 'House'
                ? i18n.t('House')
                : (tileDataFromMap?.title ?? tile.Name),
        },
        onPress: () => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Clicked on ${tile.Name} tile`);
          }
          // Intercept eeva hive to open in-app browser Typeform
          if (
            tile.Type === ETileType.EevaHive ||
            (typeof tile.Name === 'string' && tile.Name.toLowerCase() === 'eeva')
          ) {
            openEevaTypeform();
            return;
          }
          tileDataFromMap?.onClick && tileDataFromMap.onClick(tile, router.push);
        },
      };
    });

  // Function to determine the distribution of tiles per row
  const getHexTileDistribution = (totalTiles: number): number[] => {
    if (totalTiles <= 0) return [0];
    if (totalTiles === 1) return [1];
    if (totalTiles === 2) return [1, 1];
    if (totalTiles === 3) return [2, 1];
    if (totalTiles === 4) return [3, 1];
    if (totalTiles === 5) return [3, 2];
    if (totalTiles === 6) return [3, 3];

    // For more than 6 tiles, distribute them evenly but ensure at least one in the second row
    const firstRowMax = 3; // Maximum 3 tiles in the first row
    const firstRow = Math.min(firstRowMax, totalTiles - 1);
    const secondRow = totalTiles - firstRow;

    return [firstRow, secondRow];
  };

  // Check if the device is mobile based on window width
  const isMobile = windowWidth < 768;

  // TODO: Pass this to beeva button
  // Handle beeva icon click -> navigate to conversational UI
  const handleBeevaClick = () => {
    try {
      sessionStorage.setItem('homeScrollY', String(window.scrollY || 0));
    } catch { }
    router.push('/beeva-chat', { scroll: false });
  };

  // Initialize and update window width on client side
  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      // Set initial window width
      setWindowWidth(window.innerWidth);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // Note: Background color is now handled by CSS custom properties via MobileThemeProvider
  // No need to directly set document.body.style.backgroundColor

  // Removed skeleton loader - show content immediately

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: isMobileApp ? 'transparent' : 'var(--bg-app)', // Use variable
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        zIndex: 1,
        minHeight: '100vh',
      }}
    >
      {/* Page Header - Full width, responsive, hide when mobile=true parameter is provided */}
      {!isMobileApp && (
        <PageContainer>
          <PageHeader />
        </PageContainer>
      )}

      {/* Content Container */}
      <PageContainer>
        {/* Header section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 'var(--space-sm)', // Use variable
            alignSelf: 'stretch',
            marginBottom: 'var(--space-lg)', // Use variable
          }}
        >
          {/* Title and Refresh Button Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              position: 'relative',
            }}
          >
            <CustomText
              style={{
                color: 'var(--text-primary)', // Use variable
                fontFamily: 'var(--font-family)', // Use variable
                fontSize: 'var(--text-h2)', // Use variable
                fontWeight: 600,
                lineHeight: '1.2',
              }}
            >
              {i18n.t('YourAdultingHQ')}
            </CustomText>

            {/* Refresh Button */}
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              style={{
                background: 'none',
                border: 'none',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease',
                opacity: isRefreshing ? 0.6 : 1,
                backgroundColor: 'transparent',
                position: 'absolute',
                right: 0,
              }}
              onMouseEnter={(e) => {
                if (!isRefreshing) {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={i18n.t('RefreshData')}
            >
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke="var(--color-primary)"
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{
                  transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                  transition: 'transform 0.8s ease',
                }}
              >
                <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'></path>
                <path d='M21 3v5h-5'></path>
                <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'></path>
                <path d='M3 21v-5h5'></path>
              </svg>
            </button>
          </div>

          {/* Subtitle */}
          <CustomText
            style={{
              color: 'var(--text-secondary)', // Use variable
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--text-body)', // Use variable
              fontWeight: 400,
            }}
          >
            {i18n.t('GetTheseDoneThenHaveSomeFun')}
          </CustomText>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: 'var(--space-md)',
              backgroundColor: 'var(--color-error)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-lg)',
              opacity: 0.1
            }}
          >
            <CustomText style={{ color: 'white' }}>{error}</CustomText>
          </div>
        )}

        {/* Task and Event List View */}
        <div style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          {/* Note: TaskEventListView needs to be refactored to use ResponsiveGrid internally, 
              but for now we wrap it or let it be. 
              Actually, TaskEventListView likely renders a list. 
              Let's wrap it in a grid if it renders individual items, 
              but looking at the code it seems to render the whole list.
              We'll leave it for now and refactor the component itself in the next step.
          */}
          <TaskEventListView
            tasks={urgentItems
              .filter(item => item.type === 'Task')
              .map(item => ({
                id: item.UniqueId || `task-${item.Title}`,
                title: item.Title || i18n.t('UntitledTask'),
                time: (item as any).isAllDay === true || (item as any).IsAllDay === true
                  ? i18n.t('AllDay')
                  : item.Deadline_DateTime
                    ? new Date(item.Deadline_DateTime).toLocaleTimeString(timeLocale, {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                    : i18n.t('NoTimeSet'),
                type: 'task' as const,
                completed: !item.Active, // Active false means completed
                deadline: item.Deadline_DateTime, // Add deadline for filtering
              }))}
            events={urgentItems
              .filter(item => item.type?.toLowerCase() === 'event')
              .map(item => ({
                id: item.UniqueId || item.EventTimeId || `event-${item.Title}`,
                title: item.Title || i18n.t('UntitledEvent'),
                time: (item as any).isAllDay === true || (item as any).IsAllDay === true
                  ? i18n.t('AllDay')
                  : item.Deadline_DateTime
                    ? new Date(item.Deadline_DateTime).toLocaleTimeString(timeLocale, {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                    : i18n.t('NoTimeSet'),
                type: 'event' as const,
                deadline: item.Deadline_DateTime, // Add deadline for filtering
              }))}
            onTaskComplete={async (taskId) => {
              if (!user?.id || !user?.accountId) {
                return;
              }

              try {
                // Update the task completion status via API
                const updatedTask = await taskService.updateTaskCompletionStatus(
                  taskId,
                  user.id,
                  user.accountId,
                  true // Mark as completed
                );

                if (updatedTask) {
                  // Update the tasks list with the updated task
                  const updatedTasks = tasks.map((t: ITTask) =>
                    t.UniqueId === taskId
                      ? { ...t, Active: false } // Active false means completed
                      : t
                  );
                  updateTasks(updatedTasks);

                  // Show success message
                  emitSnackbar({
                    message: i18n.t('TaskCompletedSuccessfully'),
                    type: 'success',
                    duration: 3000
                  });
                }
              } catch (err) {
                console.error('Error completing task:', err);
                emitSnackbar({
                  message: i18n.t('FailedToCompleteTask'),
                  type: 'error',
                  duration: 3000
                });
              }
            }}
          />
        </div>
      </PageContainer>

      {/* Hex Categories using DynamicGridLayout */}
      {/* We remove the negative margin hack and use a full-width container approach */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.02))',
        paddingTop: 'var(--space-xl)',
        paddingBottom: 'var(--space-xl)',
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center'
      }}>
        {mappedTiles.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              width: '100%',
            }}
          >
            <CustomText style={{ color: 'var(--text-secondary)' }}>
              {i18n.t('NoTilesFound')}
            </CustomText>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <DynamicGridLayout
              tilesPerRow={getHexTileDistribution(mappedTiles.length)}
              tiles={mappedTiles}
              isMobile={isMobile}
              containerStyle={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Empty State Modal */}
      {isEmptyStateCardVisible && (
        <EmptyStateCard onClose={() => setIsEmptyStateCardVisible(false)} />
      )}

      {/* Tab Bar */}
      <TabBar onBeevaButtonClick={handleBeevaClick} />
    </div>
  );
};

/**
 * HomePage - The main component that wraps HomeContent with AuthGuard
 * This ensures authentication is complete before rendering any content
 */
const HomePage: React.FC = () => {
  const { i18n } = useLanguageContext();

  return (
    <AuthGuard>
      <Suspense fallback={<div>{i18n.t('LoadingEllipsis')}</div>}>
        <HomeContent />
      </Suspense>
    </AuthGuard>
  );
};

export default HomePage;
