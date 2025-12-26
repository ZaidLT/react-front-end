'use client';

import React, { useEffect, useState, useMemo, useCallback, Suspense } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { Colors, Typography } from '../../styles';

import { trackEvent, AmplitudeEvents } from '../../services/analytics';

import LoadingSpinner from '../../components/LoadingSpinner';
import CustomText from '../../components/CustomText';
import EveryonesStuffItem from '../../components/EveryonesStuffItem';

import {
  useFamilyStore
} from '../../context/store';
import TabBar from '../../components/TabBar';


// Import types
import { WeeklyStatsResponse, SampleTask, SampleEvent } from '../../services/types';

// Note: moment import removed since we're using API data directly

// Import services
import {
  getWeeklyStats
} from '../../services/services';
import familyService from '../../services/familyService';



/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;

};

const LifePageContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const { user: authUser, isLoading } = useAuth();

  // Mobile detection using search params
  const searchParams = useSearchParams();
  const isMobileApp = searchParams.get('mobile') === 'true';
  const forceShowInactiveButton = searchParams?.get('showInactive') === 'true';



  // Store states
  const family = useFamilyStore((state) => state.family);

  // Track Life tab viewed on mount
  useEffect(() => {
    try { trackEvent(AmplitudeEvents.lifeTabViewed); } catch {}
  }, []);

  // Local state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // User filter state
  const [weeklyStatsData, setWeeklyStatsData] = useState<WeeklyStatsResponse | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setIsWeeklyStatsLoading] = useState(true);
  const [weeklyStatsError, setWeeklyStatsError] = useState<string | null>(null);
  const [showAllMembers] = useState(false); // Toggle state for member filtering



  // Family data is now fetched in Phase 1 of progressive loading
  // This old useEffect is disabled to prevent conflicts
  /*
  useEffect(() => {
    const fetchFamilyData = async () => {
      // Don't make API calls if auth is still loading or user data is incomplete
      if (isLoading || !authUser?.accountId) {
        console.log('Skipping family fetch - auth still loading or no account ID');
        return;
      }

      try {
        console.log('Fetching family members for account:', authUser.accountId);

        const familyMembers = await getUsersByAccount(authUser.accountId);

        if (familyMembers && familyMembers.length > 0) {
          const setFamily = useFamilyStore.getState().setFamily;
          setFamily(familyMembers);
          console.log(`Successfully loaded ${familyMembers.length} family members:`, familyMembers.map(m => `${m.FirstName} ${m.LastName}`));
        } else {
          console.log('No family members found');
        }
      } catch (error) {
        console.error('Error fetching family members:', error);
      }
    };

    fetchFamilyData();
  }, [authUser?.accountId, isLoading]);
  */

  // Removed automatic refresh on page focus/visibility change - this was too hacky

  // Removed session tracking - always fetch for consistency

  // Flag to prevent multiple simultaneous fetches
  const [isFetching, setIsFetching] = useState(false);
  const [isFetchingWeeklyStats, setIsFetchingWeeklyStats] = useState(false);

  // Remove session-based caching logic that causes inconsistency



  // Check for refresh trigger from URL params (when returning from create task)
  useEffect(() => {
    const refreshParam = searchParams.get('refresh');
    if (refreshParam === 'true') {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] Refresh triggered from URL params - clearing session cache');
      }
      // Force refresh by clearing data

      // Force refresh weekly stats data
      setWeeklyStatsData(null);
      setWeeklyStatsError(null);

      // Remove the refresh param from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('refresh');
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Progressive loading: Phase 1 - Critical data (users and weekly stats)
  useEffect(() => {
    console.log('[LIFE_TAB_DEBUG] ===== PROGRESSIVE LOADING USE_EFFECT TRIGGERED =====');

    const fetchCriticalData = async () => {
      // Don't make API calls if auth is still loading or user data is incomplete
      if (isLoading || !authUser?.id || !authUser?.accountId) {
        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('[LIFE_TAB_DEBUG] Skipping critical data fetch - auth still loading or incomplete user data');
        }
        return;
      }

      // Prevent multiple simultaneous fetches
      if (isFetching) {
        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('[LIFE_TAB_DEBUG] Skipping critical data fetch - already fetching');
        }
        return;
      }

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] ===== PHASE 1: FETCHING CRITICAL DATA =====');
        console.log('[LIFE_TAB_DEBUG] User ID:', authUser.id);
        console.log('[LIFE_TAB_DEBUG] Account ID:', authUser.accountId);
      }

      try {
        setIsFetching(true);

        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('[LIFE_TAB_DEBUG] Starting Phase 1 API calls...');
        }

        // Phase 1: Fetch critical data in parallel
        const [familyMembersResult, weeklyStatsResult] = await Promise.allSettled([
          familyService.getFamilyMembers(authUser.accountId),
          getWeeklyStats({
            accountId: authUser.accountId,
            includeUserBreakdown: true,
            includeSampleItems: true
          })
        ]);

        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('[LIFE_TAB_DEBUG] Phase 1 API calls completed');
        }

        // Handle family members result
        if (familyMembersResult.status === 'fulfilled') {
          const setFamily = useFamilyStore.getState().setFamily;

          // Map the new API format to the expected frontend format
          const mappedFamilyMembers = familyMembersResult.value.map((member: any) => ({
            ...member,
            // Map camelCase to PascalCase for compatibility
            UniqueId: member.id,
            Account_uniqueId: member.accountId,
            FirstName: member.firstName,
            LastName: member.lastName,
            EmailAddress: member.emailAddress,
            DisplayName: member.displayName,
            Language: member.language,
            AvatarImagePath: member.avatarImagePath,
            DisplayMode: member.displayMode,
            ActiveUser: member.activeUser,
            Address: member.address,
            StreetName: member.streetName,
            City: member.city,
            State: member.state,
            Country: member.country,
            ZipCode: member.zipCode,
            Birthday: member.birthday,
            Workplace: member.workplace,
            Cell_Phone_Number: member.cellPhoneNumber,
            Home_Phone_Number: member.homePhoneNumber,
            PropertySituation: member.propertySituation,
            ActiveFamily: member.activeFamily,
            ActiveFamilyMember: member.activeFamilyMember,
          }));

          setFamily(mappedFamilyMembers);
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('[LIFE_TAB_DEBUG] ✅ Family members loaded and mapped');
          }
        } else {
          console.error('Failed to fetch family members:', familyMembersResult.reason);
        }

        // Handle weekly stats result
        if (weeklyStatsResult.status === 'fulfilled') {
          setWeeklyStatsData(weeklyStatsResult.value);
          setIsWeeklyStatsLoading(false);
          setWeeklyStatsError(null); // Clear any previous errors
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('[LIFE_TAB_DEBUG] ✅ Weekly stats loaded');
          }
        } else {
          console.error('Failed to fetch weekly stats:', weeklyStatsResult.reason);
          setWeeklyStatsError('Failed to load weekly statistics');
          setIsWeeklyStatsLoading(false);
        }

        // Phase 1 complete

        // Remove session storage logic that causes inconsistency

        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('[LIFE_TAB_DEBUG] ✅ Phase 1 complete - starting Phase 2');
        }

        // Start Phase 2 immediately after Phase 1
        fetchDetailedData();

      } catch (error) {
        console.error('Error in Phase 1 data fetch:', error);
        setIsWeeklyStatsLoading(false);
        setWeeklyStatsError('Failed to load critical data');
      } finally {
        setIsFetching(false);
      }
    };

    // Phase 2: Detailed content data
    const fetchDetailedData = async () => {
      if (!authUser?.id || !authUser?.accountId) return;

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] ===== PHASE 2: FETCHING DETAILED DATA =====');
      }

      // Note: Individual loading states removed since we're using sample items from API

      // Validate JWT token before fetching
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        const { isTokenExpired } = await import('../../util/jwtUtils');
        const tokenExpired = isTokenExpired(token, 300); // 5 minutes buffer

        if (tokenExpired) {
          console.warn('JWT token is expired, data may be stale. Consider refreshing session.');
          // Continue with fetch but log the warning
        }
      }

      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] ✅ All critical data loaded - using sample items from weekly stats');
      }

      // Note: Loading states removed since we're using sample items from API
    };

    // Always fetch data - remove session-based caching that's causing inconsistency
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[LIFE_TAB_DEBUG] ===== ALWAYS FETCH FOR CONSISTENCY =====');
      console.log('[LIFE_TAB_DEBUG] Auth User ID:', authUser?.id);
      console.log('[LIFE_TAB_DEBUG] Auth User Account ID:', authUser?.accountId);
      console.log('[LIFE_TAB_DEBUG] Is Loading:', isLoading);
    }

    fetchCriticalData();
  }, [authUser?.id, authUser?.accountId, isLoading]); // Always fetch when auth data changes

  // Separate function to fetch weekly stats (for user filtering)
  const fetchWeeklyStats = useCallback(async (userId?: string, retryCount: number = 0) => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[LIFE_TAB_DEBUG] ===== FETCH WEEKLY STATS CALLED =====');
      console.log('[LIFE_TAB_DEBUG] User ID:', userId);
      console.log('[LIFE_TAB_DEBUG] Retry Count:', retryCount);
      console.log('[LIFE_TAB_DEBUG] Auth User Account ID:', authUser?.accountId);
      console.log('[LIFE_TAB_DEBUG] Is Loading:', isLoading);
      console.log('[LIFE_TAB_DEBUG] Is Fetching Weekly Stats:', isFetchingWeeklyStats);
    }

    if (isLoading || !authUser?.accountId) {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] Skipping weekly stats fetch - auth still loading or no account ID');
      }
      return;
    }

    if (isFetchingWeeklyStats) {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[LIFE_TAB_DEBUG] Skipping weekly stats fetch - already fetching');
      }
      return;
    }

    const maxRetries = 2;

    try {
      setIsFetchingWeeklyStats(true);
      setIsWeeklyStatsLoading(true);
      // Don't set page loading for user filtering - only for initial load
      if (retryCount === 0) {
        setWeeklyStatsError(null); // Clear previous errors only on first attempt
      }
      console.log('Fetching weekly stats for user:', userId || 'all users', retryCount > 0 ? `(retry ${retryCount})` : '');

      const statsData = await getWeeklyStats({
        accountId: authUser.accountId,
        userId: userId,
        includeUserBreakdown: true,
        includeSampleItems: true
      });

      setWeeklyStatsData(statsData);
      setWeeklyStatsError(null); // Clear errors on success
      // Don't change page loading state here - this is for user filtering, not initial load
      console.log('Successfully fetched weekly stats for user filtering:', statsData);
    } catch (error: any) {
      console.error('Error fetching weekly stats:', error);

      // Check if it's a 404 error (endpoint doesn't exist) - don't retry these
      const is404Error = error?.response?.status === 404 || error?.status === 404;

      // Only retry for actual network errors, not 404s or other HTTP errors
      const shouldRetry = retryCount < maxRetries &&
                         !is404Error &&
                         (error?.code === 'NETWORK_ERROR' ||
                          error?.code === 'ECONNRESET' ||
                          error?.code === 'ETIMEDOUT' ||
                          (error?.message?.includes('fetch') && !error?.message?.includes('404')));

      if (shouldRetry) {
        console.log(`Retrying weekly stats fetch in 1 second... (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchWeeklyStats(userId, retryCount + 1);
        }, 1000);
        return;
      }

      // For 404 errors, log but don't set as error (expected when endpoint doesn't exist)
      if (is404Error) {
        console.log('Weekly stats endpoint not available (404) - using manual calculations');
        setWeeklyStatsError(null); // Don't show error for expected 404s
      } else {
        const errorMessage = error?.message || 'Failed to load weekly statistics';
        setWeeklyStatsError(errorMessage);
      }

      // Don't clear existing data on error - keep showing cached data if available
      if (!weeklyStatsData) {
        setWeeklyStatsData(null);
      }
    } finally {
      if (retryCount === 0 || retryCount >= maxRetries) {
        setIsWeeklyStatsLoading(false);
        setIsFetchingWeeklyStats(false);
        // Don't change page loading state here - this is for user filtering
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, authUser?.accountId, isFetchingWeeklyStats]); // Removed weeklyStatsData to prevent infinite loops



  // Fix weekly stats loading state - set to false after a short delay to allow for data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only set loading to false if there's no error and we have some data or no data is expected
      if (!weeklyStatsError) {
        setIsWeeklyStatsLoading(false);
      }
    }, 2000); // Give 2 seconds for data to load

    return () => clearTimeout(timer);
  }, [weeklyStatsError]);

  // Weekly stats are now handled in Phase 1 of progressive loading
  // User filtering is handled by the WeeklyStatsDisplay component using cached data
  // No separate useEffect needed since we fetch with includeUserBreakdown=true

  // Check if there are inactive members that would be shown in "all members" view
  const hasInactiveMembers = useMemo(() => {
    const activeMembers = family.filter((member) =>
      member.ActiveUser && !member.Deleted
    );
    const allMembers = family.filter((member) =>
      member.ActiveFamilyMember ? member.ActiveUser : true
    );
    return allMembers.length > activeMembers.length;
  }, [family]);

  // Determine if we should show the inactive toggle button
  const shouldShowInactiveToggle = hasInactiveMembers || forceShowInactiveButton;

  // Filter family members based on toggle state
  const updatedFamily = useMemo(() => {
    let filteredMembers;

    if (showAllMembers) {
      // Show all members (original /life page logic)
      filteredMembers = family.filter((member) =>
        member.ActiveFamilyMember ? member.ActiveUser : true
      );
    } else {
      // Show only active members (same as /my-hive page logic)
      filteredMembers = family.filter((member) =>
        member.ActiveUser && !member.Deleted
      );
    }

    // Debug logging to verify filtering behavior
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[LIFE_TAB_DEBUG] Family member filtering:', {
        showAllMembers,
        totalFamilyMembers: family.length,
        filteredCount: filteredMembers.length,
        hasInactiveMembers,
        shouldShowInactiveToggle,
        forceShowInactiveButton,
        filteredMembers: filteredMembers.map(m => ({
          name: `${m.FirstName} ${m.LastName}`,
          ActiveUser: m.ActiveUser,
          ActiveFamilyMember: m.ActiveFamilyMember,
          Deleted: m.Deleted
        }))
      });
    }

    return filteredMembers;
  }, [family, showAllMembers, hasInactiveMembers, shouldShowInactiveToggle, forceShowInactiveButton]);

  // Create a placeholder for the current user when family data is loading
  const displayFamily = useMemo(() => {
    // If we have family data, use it
    if (updatedFamily.length > 0) {
      return updatedFamily;
    }

    // If we're still loading and have authUser, create a placeholder
    if (authUser && family.length === 0) {
      return [{
        UniqueId: authUser.id,
        FirstName: authUser.firstName,
        LastName: authUser.lastName,
        AvatarImagePath: '',
        ActiveFamilyMember: true,
        ActiveUser: true,
        EmailAddress: authUser.email,
        Account_uniqueId: authUser.accountId || '',
        DisplayName: `${authUser.firstName} ${authUser.lastName}`,
        Language: 1,
        DisplayMode: 1,
        Address: '',
        StreetName: '',
        City: '',
        State: '',
        Country: '',
        ZipCode: '',
        Birthday: '',
        Workplace: '',
        Cell_Phone_Number: '',
        Home_Phone_Number: '',
        Property_Situation: '',
        ActiveFamily: true
      }];
    }

    // No data and no authUser means we're in an error state
    return [];
  }, [updatedFamily, authUser, family.length]);



  // Note: We no longer filter store data since we're using sample items from the weekly stats API



  // Note: Weekly calculations removed - using sample items from API





  // API-driven weekly stats with fallbacks to manual calculations
  const apiWeeklyStats = useMemo(() => {
    if (!weeklyStatsData) return null;

    // If we have a selected user, try to find their data in userBreakdowns
    if (selectedUserId && weeklyStatsData.userBreakdowns) {
      const userStats = weeklyStatsData.userBreakdowns.find(
        breakdown => breakdown.userId === selectedUserId
      );

      if (userStats) {
        console.log(`Using API weekly stats for user ${selectedUserId}:`, userStats.weeklyStats);
      } else {
        console.log(`No API weekly stats found for user ${selectedUserId}, falling back to manual calculations`);
      }

      return userStats || null;
    }

    // Otherwise use the main stats
    console.log('Using main API weekly stats:', weeklyStatsData.weeklyStats);
    console.log('[LIFE_TAB_DEBUG] API Weekly Stats Values:', {
      apiTasksIncomplete: weeklyStatsData.weeklyStats?.tasksIncomplete,
      apiTasksDueThisWeek: weeklyStatsData.weeklyStats?.tasksDueThisWeek,
      apiTasksCompletedThisWeek: weeklyStatsData.weeklyStats?.tasksCompletedThisWeek,
      apiEventsUpcoming: weeklyStatsData.weeklyStats?.eventsUpcoming,
      apiNotesCreatedThisWeek: weeklyStatsData.weeklyStats?.notesCreatedThisWeek,
      apiDocsUploadedThisWeek: weeklyStatsData.weeklyStats?.docsUploadedThisWeek,
      combinedIncompleteTasksFromAPI: (weeklyStatsData.weeklyStats?.tasksIncomplete || 0) + (weeklyStatsData.weeklyStats?.tasksDueThisWeek || 0),
      currentUserId: authUser?.id,
      currentAccountId: authUser?.accountId
    });
    return weeklyStatsData;
  }, [weeklyStatsData, selectedUserId, authUser?.accountId, authUser?.id]);

  // API-driven dents count with fallbacks to manual calculations
  const apiDentsCount = useMemo(() => {
    if (!weeklyStatsData) return null;

    // If we have a selected user, try to find their data in userBreakdowns
    if (selectedUserId && weeklyStatsData.userBreakdowns) {
      const userStats = weeklyStatsData.userBreakdowns.find(
        breakdown => breakdown.userId === selectedUserId
      );

      if (userStats?.dentsCount) {
        console.log(`Using API dents count for user ${selectedUserId}:`, userStats.dentsCount);
      } else {
        console.log(`No API dents count found for user ${selectedUserId}, falling back to manual calculations`);
      }

      return userStats?.dentsCount || null;
    }

    // Otherwise use the main dents count
    console.log('Using main API dents count:', weeklyStatsData.dentsCount);
    return weeklyStatsData.dentsCount;
  }, [weeklyStatsData, selectedUserId]);

  // Get dents counts from API with fallbacks to store data
  const getDentsCount = useMemo(() => {
    if (apiDentsCount) {
      console.log('[LIFE_TAB_DEBUG] Using API dents count for Everyone\'s Stuff section:', apiDentsCount);
      return {
        tasks: apiDentsCount.tasks,
        notes: apiDentsCount.notes,
        docs: apiDentsCount.docs,
        events: apiDentsCount.events
      };
    }

    console.log('[LIFE_TAB_DEBUG] No API dents count available - using zeros as fallback');
    // Fallback when API data not available
    return {
      tasks: 0,
      notes: 0,
      docs: 0,
      events: 0
    };
  }, [apiDentsCount]);

  // Current view: choose root totals when no user selected; use user breakdown when selected
  const currentDentsCount = useMemo(() => {
    if (!weeklyStatsData) return null;
    if (selectedUserId && (weeklyStatsData as any).userBreakdowns) {
      const ubd: any = (weeklyStatsData as any).userBreakdowns;
      let breakdown: any = null;
      if (Array.isArray(ubd)) {
        breakdown = ubd.find((b: any) => b.userId === selectedUserId) || null;
      } else if (ubd && typeof ubd === 'object') {
        breakdown = ubd[selectedUserId] || null;
      }
      return breakdown?.dentsCount ?? weeklyStatsData.dentsCount;
    }
    return weeklyStatsData.dentsCount;
  }, [weeklyStatsData, selectedUserId]);

  const currentWeeklyStats = useMemo(() => {
    if (!weeklyStatsData) return null;
    if (selectedUserId && (weeklyStatsData as any).userBreakdowns) {
      const ubd: any = (weeklyStatsData as any).userBreakdowns;
      let breakdown: any = null;
      if (Array.isArray(ubd)) {
        breakdown = ubd.find((b: any) => b.userId === selectedUserId) || null;
      } else if (ubd && typeof ubd === 'object') {
        breakdown = ubd[selectedUserId] || null;
      }
      return breakdown?.weeklyStats ?? weeklyStatsData.weeklyStats;
    }
    return weeklyStatsData.weeklyStats;
  }, [weeklyStatsData, selectedUserId]);


  // Note: Task calculations removed - using sample items from API

  // Note: Debug logging removed since we're using API data directly





  return (
    <AuthGuard>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: isMobileApp ? 'transparent' : 'white',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          paddingTop: '24px',
          paddingBottom: '16px',
          backgroundColor: isMobileApp ? 'transparent' : 'white',
          width: '100%'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '0 20px',
            boxSizing: 'border-box'
          }}>
            {/* New Header Structure */}
            <div style={{
              display: 'flex',
              width: '100%',
              height: '32px',
              padding: '0 0px',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              {/* Left div */}
              <div style={{
                display: 'flex',
                width: '64px',
                height: '24px',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0
              }}>
                {/* Nothing inside for now */}
              </div>

              {/* Title div */}
              <div style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                color: '#000E50',
                textAlign: 'center',
                textOverflow: 'ellipsis',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '100%'
              }}>
                ✨ {i18n.t('Life')} ✨
              </div>

              {/* Right div */}
              <div style={{
                display: 'flex',
                width: '64px',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0
              }}>
                {/* Search icon */}
                <div
                  onClick={() => router.push('/search?from=life')}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src="/icons/icon-search.svg"
                    width={24}
                    height={24}
                    alt={i18n.t('Search')}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div style={{
          display: 'flex',
          width: '100%',
          padding: '4px 24px',
          paddingBottom: isMobileApp ? '4px' : '100px', // Add bottom padding for tab bar in web mode
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '16px',
          backgroundColor: '#FFFFFF'
        }}>
          {/* Top Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '24px',
            alignSelf: 'stretch',
            backgroundColor: '#FFFFFF'
          }}>
            {/* My Hive */}
            <div style={{
              display: 'flex',
              width: '390px',
              padding: '4px 0',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              {/* My Hive Title */}
              <div style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '100%'
              }}>
                {i18n.t('MyHive')}
              </div>

              {/* Hive Avatars */}
              <div style={{
                display: 'flex',
                width: '342px',
                alignItems: 'center',
                gap: '12px'
              }}>
                {displayFamily.map((member, index) => (
                  <div
                    key={member.UniqueId || index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px',
                      border: selectedUserId === member.UniqueId ? '1px solid #2A46BE' : '1px solid transparent',
                      borderRadius: '12px',
                      padding: '6px 8px'
                    }}
                  >
                    {/* Avatar */}
                    <div
                      onClick={async () => {
                        try {
                          try { trackEvent(AmplitudeEvents.lifeTabMemberTapped, { memberId: member.UniqueId }); } catch {}
                          const next = selectedUserId === member.UniqueId ? null : member.UniqueId;
                          setSelectedUserId(next);
                          await fetchWeeklyStats(next || undefined);
                        } catch (e) {
                          console.error('Failed to apply user filter:', e);
                        }
                      }}
                      style={{
                        display: 'flex',
                        width: '50px',
                        height: '50px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '100px',
                        border: '1px solid #FFF',
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer'
                      }}
                      title={`Filter by ${member.FirstName}`}
                    >
                      {member.AvatarImagePath ? (
                        <img
                          src={member.AvatarImagePath}
                          alt={`${member.FirstName} avatar`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <CustomText style={{
                          color: Colors.BLUE,
                          fontSize: Typography.FONT_SIZE_16,
                          fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                          fontWeight: 600
                        }}>
                          {member.FirstName?.charAt(0) || '?'}
                        </CustomText>
                      )}
                    </div>

                    {/* First Name */}
                    <div
                      onClick={async () => {
                        try {
                          try { trackEvent(AmplitudeEvents.lifeTabMemberTapped, { memberId: member.UniqueId }); } catch {}
                          const next = selectedUserId === member.UniqueId ? null : member.UniqueId;
                          setSelectedUserId(next);
                          await fetchWeeklyStats(next || undefined);
                        } catch (e) {
                          console.error('Failed to apply user filter:', e);
                        }
                      }}
                      style={{
                        color: '#000E50',
                        fontFamily: 'Poppins',
                        fontSize: '10px',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        lineHeight: '120%',
                        cursor: 'pointer'
                      }}
                    >
                      {member.FirstName}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Everyone's Stuff */}
            <div style={{
              display: 'flex',
              padding: '4px 0',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
              alignSelf: 'stretch'
            }}>
              {/* Everyone's Stuff Title */}
              <div style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '100%'
              }}>
                {i18n.t('EveryonesStuff')}
              </div>

              {/* Hex Tiles Container */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignSelf: 'stretch'
              }}>
                {/* Tasks */}
                <EveryonesStuffItem
                  type="Task"
                  count={currentDentsCount?.tasks ?? 0}
                  label={i18n.t('Tasks')}
                  color="#FFE2E0"
                  borderColor={Colors.LIGHT_RED || '#FF6B6B'}
                  onClick={() => {
                    const url = selectedUserId
                      ? `/life/all-dents?type=Task&userId=${selectedUserId}`
                      : '/life/all-dents?type=Task';
                    router.push(url);
                  }}
                />

                {/* Notes */}
                <EveryonesStuffItem
                  type="Note"
                  count={currentDentsCount?.notes ?? 0}
                  label={i18n.t('Notes')}
                  color="#FFFBDB"
                  borderColor={Colors.MUSTARD || '#FFD166'}
                  onClick={() => {
                    const url = selectedUserId
                      ? `/life/all-dents?type=Note&userId=${selectedUserId}`
                      : '/life/all-dents?type=Note';
                    router.push(url);
                  }}
                />

                {/* Events */}
                <EveryonesStuffItem
                  type="Event"
                  count={currentDentsCount?.events ?? 0}
                  label={i18n.t('Events')}
                  color="#E7E2FF"
                  borderColor={Colors.PURPLE || '#A78BFA'}
                  onClick={() => {
                    const url = selectedUserId
                      ? `/life/all-dents?type=Event&userId=${selectedUserId}`
                      : '/life/all-dents?type=Event';
                    router.push(url);
                  }}
                />

                {/* Docs */}
                <EveryonesStuffItem
                  type="Document"
                  count={currentDentsCount?.docs ?? 0}
                  label={i18n.t('Docs')}
                  color="#E0F8E5"
                  borderColor={Colors.PISTACHIO_GREEN || '#10B981'}
                  onClick={() => {
                    const url = selectedUserId
                      ? `/life/all-dents?type=Document&userId=${selectedUserId}`
                      : '/life/all-dents?type=Document';
                    router.push(url);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Weekly Stats Section */}
          <div style={{
            display: 'flex',
            padding: '0',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            alignSelf: 'stretch'
          }}>
            {/* Weekly Stats Title */}
            <div style={{
              display: 'flex',
              width: '342px',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '100%'
            }}>
              {i18n.t('WeeklyStats')}
            </div>

            {/* Weekly Stats Data Container */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
              alignSelf: 'stretch',
              backgroundColor: '#FFFFFF'
            }}>
              {/* Events this week */}
              <div
                onClick={() => {
                  const url = selectedUserId
                    ? `/life/all-dents?type=Event&weekly=true&userId=${selectedUserId}`
                    : '/life/all-dents?type=Event&weekly=true';
                  router.push(url);
                }}
                style={{
                  display: 'flex',
                  padding: '15px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '12px',
                  alignSelf: 'stretch',
                  borderRadius: '12px',
                  border: '1px solid #D4DAF2',
                  background: '#FFF',
                  boxShadow: '0 4px 4px 0 rgba(0, 14, 80, 0.10)',
                  cursor: 'pointer'
                }}>
                {/* Title */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  alignSelf: 'stretch'
                }}>
                  {/* Value Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {/* Record Count */}
                    <div style={{
                      color: '#2A46BE',
                      fontFamily: 'Poppins',
                      fontSize: '50px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {currentWeeklyStats?.eventsUpcoming ?? 0}
                    </div>

                    {/* Events this week text */}
                    <div style={{
                      color: '#7F90D8',
                      fontFamily: 'Poppins',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {i18n.t('EventsThisWeek')}
                    </div>
                  </div>

                  {/* Right-justified icon */}
                  <img
                    src="/icons/life/icon-stats-open.svg"
                    alt={i18n.t('OpenStats')}
                    style={{
                      width: '24px',
                      height: '24px'
                    }}
                  />
                </div>

                {/* Cards */}
                <div style={{
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  {(() => {
                    // Get sample events from current view (root when no selection, breakdown when selected)
                    let sampleEvents: SampleEvent[] = [];
                    const wsAny: any = currentWeeklyStats as any;
                    if (wsAny?.sampleEvents) {
                      sampleEvents = wsAny.sampleEvents;
                    }

                    // Show max 2 events or zero state
                    if (sampleEvents.length === 0) {
                      return (
                        <div style={{
                          display: 'flex',
                          padding: '9px 12px 9px 8px',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          alignSelf: 'stretch',
                          width: '100%',
                          borderRadius: '6px',
                          border: '1px solid #E6E7EE',
                          background: '#FFF'
                        }}>
                          {/* Color coding - light gray for zero state */}
                          <div style={{
                            height: '16px',
                            width: '4px',
                            backgroundColor: '#D3D3D3',
                            borderRadius: '8px'
                          }} />

                          {/* Zero state text */}
                          <div style={{
                            display: 'flex',
                            padding: '2px 0',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            flex: 1,
                            marginLeft: '8px'
                          }}>
                            <div style={{
                              color: '#000E50',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontStyle: 'normal',
                              fontWeight: 700,
                              lineHeight: '120%'
                            }}>
                              {i18n.t('UpcomingEventsWillAppearHere')}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return sampleEvents.slice(0, 2).map((event, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          padding: '9px 12px 9px 8px',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          alignSelf: 'stretch',
                          width: '100%',
                          borderRadius: '6px',
                          border: '1px solid #E6E7EE',
                          background: '#FFF'
                        }}
                      >
                        {/* Color coding */}
                        <div style={{
                          height: '16px',
                          width: '4px',
                          backgroundColor: '#FFA020',
                          borderRadius: '8px'
                        }} />

                        {/* Event title */}
                        <div style={{
                          display: 'flex',
                          padding: '2px 0',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '4px',
                          flex: 1,
                          marginLeft: '8px'
                        }}>
                          <div style={{
                            color: '#000E50',
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            fontStyle: 'normal',
                            fontWeight: 700,
                            lineHeight: '120%'
                          }}>
                            {event.title}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Incomplete Tasks */}
              <div
                onClick={() => {
                  const url = selectedUserId
                    ? `/life/all-dents?type=Task&completed=false&weekly=true&userId=${selectedUserId}`
                    : '/life/all-dents?type=Task&completed=false&weekly=true';
                  router.push(url);
                }}
                style={{
                  display: 'flex',
                  padding: '15px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '12px',
                  alignSelf: 'stretch',
                  borderRadius: '12px',
                  border: '1px solid #D4DAF2',
                  background: '#FFF',
                  boxShadow: '0 4px 4px 0 rgba(0, 14, 80, 0.10)',
                  cursor: 'pointer'
                }}>
                {/* Title */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  alignSelf: 'stretch'
                }}>
                  {/* Value Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {/* Record Count */}
                    <div style={{
                      color: '#2A46BE',
                      fontFamily: 'Poppins',
                      fontSize: '50px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {currentWeeklyStats?.tasksIncomplete ?? 0}
                    </div>

                    {/* Incomplete Tasks text */}
                    <div style={{
                      color: '#7F90D8',
                      fontFamily: 'Poppins',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {i18n.t('IncompleteTasks')}
                    </div>
                  </div>

                  {/* Right-justified icon */}
                  <img
                    src="/icons/life/icon-stats-open.svg"
                    alt={i18n.t('OpenStats')}
                    style={{
                      width: '24px',
                      height: '24px'
                    }}
                  />
                </div>

                {/* Cards */}
                <div style={{
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  {(() => {
                    // Get sample incomplete tasks from current view (root when no selection, breakdown when selected)
                    let sampleTasks: SampleTask[] = [];
                    const wsAny: any = currentWeeklyStats as any;
                    if (wsAny?.sampleIncompleteTasks) {
                      sampleTasks = wsAny.sampleIncompleteTasks;
                    }


                    // Show max 2 tasks or zero state
                    if (sampleTasks.length === 0) {
                      return (
                        <div style={{
                          display: 'flex',
                          padding: '9px 12px 9px 8px',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          alignSelf: 'stretch',
                          width: '100%',
                          borderRadius: '6px',
                          border: '1px solid #E6E7EE',
                          background: '#FFF'
                        }}>
                          {/* Color coding - light gray for zero state */}
                          <div style={{
                            height: '16px',
                            width: '4px',
                            backgroundColor: '#D3D3D3',
                            borderRadius: '8px'
                          }} />

                          {/* Zero state text */}
                          <div style={{
                            display: 'flex',
                            padding: '2px 0',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            flex: 1,
                            marginLeft: '8px'
                          }}>
                            <div style={{
                              color: '#000E50',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontStyle: 'normal',
                              fontWeight: 700,
                              lineHeight: '120%'
                            }}>
                              {i18n.t('IncompleteTasksWillAppearHere')}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return sampleTasks.slice(0, 2).map((task, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          padding: '9px 12px 9px 8px',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          alignSelf: 'stretch',
                          width: '100%',
                          borderRadius: '6px',
                          border: '1px solid #E6E7EE',
                          background: '#FFF'
                        }}
                      >
                        {/* Color coding */}
                        <div style={{
                          height: '16px',
                          width: '4px',
                          backgroundColor: '#FFA020',
                          borderRadius: '8px'
                        }} />

                        {/* Task title */}
                        <div style={{
                          display: 'flex',
                          padding: '2px 0',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '4px',
                          flex: 1,
                          marginLeft: '8px'
                        }}>
                          <div style={{
                            color: '#000E50',
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            fontStyle: 'normal',
                            fontWeight: 700,
                            lineHeight: '120%'
                          }}>
                            {task.title}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Completed Tasks */}
              <div
                onClick={() => {
                  const url = selectedUserId
                    ? `/life/all-dents?type=Task&completed=true&weekly=true&userId=${selectedUserId}`
                    : '/life/all-dents?type=Task&completed=true&weekly=true';
                  router.push(url);
                }}
                style={{
                  display: 'flex',
                  padding: '15px',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '12px',
                  alignSelf: 'stretch',
                  borderRadius: '12px',
                  border: '1px solid #D4DAF2',
                  background: '#FFF',
                  boxShadow: '0 4px 4px 0 rgba(0, 14, 80, 0.10)',
                  cursor: 'pointer'
                }}>
                {/* Title */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  alignSelf: 'stretch'
                }}>
                  {/* Value Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {/* Record Count */}
                    <div style={{
                      color: '#2A46BE',
                      fontFamily: 'Poppins',
                      fontSize: '50px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {currentWeeklyStats?.tasksCompletedThisWeek ?? 0}
                    </div>

                    {/* Completed Tasks text */}
                    <div style={{
                      color: '#7F90D8',
                      fontFamily: 'Poppins',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {i18n.t('CompletedTasks')}
                    </div>
                  </div>

                  {/* Right-justified icon */}
                  <img
                    src="/icons/life/icon-stats-open.svg"
                    alt={i18n.t('OpenStats')}
                    style={{
                      width: '24px',
                      height: '24px'
                    }}
                  />
                </div>

                {/* Cards */}
                <div style={{
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  {(() => {
                    // Get sample completed tasks from current view (root when no selection, breakdown when selected)
                    let sampleTasks: SampleTask[] = [];
                    const wsAny: any = currentWeeklyStats as any;
                    if (wsAny?.sampleCompletedTasks) {
                      sampleTasks = wsAny.sampleCompletedTasks;
                    }

                    // Show max 2 tasks or zero state
                    if (sampleTasks.length === 0) {
                      return (
                        <div style={{
                          display: 'flex',
                          padding: '9px 12px 9px 8px',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          alignSelf: 'stretch',
                          width: '100%',
                          borderRadius: '6px',
                          border: '1px solid #E6E7EE',
                          background: '#FFF'
                        }}>
                          {/* Color coding - light gray for zero state */}
                          <div style={{
                            height: '16px',
                            width: '4px',
                            backgroundColor: '#D3D3D3',
                            borderRadius: '8px'
                          }} />

                          {/* Zero state text */}
                          <div style={{
                            display: 'flex',
                            padding: '2px 0',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px',
                            flex: 1,
                            marginLeft: '8px'
                          }}>
                            <div style={{
                              color: '#000E50',
                              fontFamily: 'Poppins',
                              fontSize: '14px',
                              fontStyle: 'normal',
                              fontWeight: 700,
                              lineHeight: '120%'
                            }}>
                              {i18n.t('CompletedTasksWillAppearHere')}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return sampleTasks.slice(0, 2).map((task, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          padding: '9px 12px 9px 8px',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          alignSelf: 'stretch',
                          width: '100%',
                          borderRadius: '6px',
                          border: '1px solid #E6E7EE',
                          background: '#FFF'
                        }}
                      >
                        {/* Color coding */}
                        <div style={{
                          height: '16px',
                          width: '4px',
                          backgroundColor: '#FFA020',
                          borderRadius: '8px'
                        }} />

                        {/* Task title */}
                        <div style={{
                          display: 'flex',
                          padding: '2px 0',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '4px',
                          flex: 1,
                          marginLeft: '8px'
                        }}>
                          <div style={{
                            color: '#000E50',
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            fontStyle: 'normal',
                            fontWeight: 700,
                            lineHeight: '120%'
                          }}>
                            {task.title}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Bento Box - Notes Created and Docs Uploaded */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                alignSelf: 'stretch',
                background: '#FFFFFF',
                backgroundColor: '#FFFFFF'
              }}>
                {/* Notes Created */}
                <div
                  onClick={() => {
                    const url = selectedUserId
                      ? `/life/all-dents?type=Note&weekly=true&userId=${selectedUserId}`
                      : '/life/all-dents?type=Note&weekly=true';
                    router.push(url);
                  }}
                  style={{
                    display: 'flex',
                    padding: '15px',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flex: '1 0 0',
                    borderRadius: '12px',
                    border: '1px solid #D4DAF2',
                    background: '#FFFFFF',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 4px 0 rgba(0, 14, 80, 0.10)',
                    cursor: 'pointer'
                  }}>
                  {/* Title */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '5px'
                  }}>
                    {/* Main count */}
                    <div style={{
                      color: '#2A46BE',
                      fontFamily: 'Poppins',
                      fontSize: '50px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {currentWeeklyStats?.notesCreatedThisWeek ?? 0}
                    </div>

                    {/* Sub-text */}
                    <div style={{
                      color: '#7F90D8',
                      fontFamily: 'Poppins',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {i18n.t('NotesCreated')}
                    </div>
                  </div>

                  {/* Icon */}
                  <img
                    src="/icons/life/icon-stats-open.svg"
                    alt={i18n.t('OpenStats')}
                    style={{
                      width: '24px',
                      height: '24px'
                    }}
                  />
                </div>

                {/* Docs Uploaded */}
                <div
                  onClick={() => {
                    const url = selectedUserId
                      ? `/life/all-dents?type=Document&weekly=true&userId=${selectedUserId}`
                      : '/life/all-dents?type=Document&weekly=true';
                    router.push(url);
                  }}
                  style={{
                    display: 'flex',
                    padding: '15px',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flex: '1 0 0',
                    borderRadius: '12px',
                    border: '1px solid #D4DAF2',
                    background: '#FFFFFF',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 4px 0 rgba(0, 14, 80, 0.10)',
                    cursor: 'pointer'
                  }}>
                  {/* Title */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '5px'
                  }}>
                    {/* Main count */}
                    <div style={{
                      color: '#2A46BE',
                      fontFamily: 'Poppins',
                      fontSize: '50px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {currentWeeklyStats?.docsUploadedThisWeek ?? 0}
                    </div>

                    {/* Sub-text */}
                    <div style={{
                      color: '#7F90D8',
                      fontFamily: 'Poppins',
                      fontSize: '20px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '100%'
                    }}>
                      {i18n.t('DocsUploaded')}
                    </div>
                  </div>

                  {/* Icon */}
                  <img
                    src="/icons/life/icon-stats-open.svg"
                    alt={i18n.t('OpenStats')}
                    style={{
                      width: '24px',
                      height: '24px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>

      {/* Tab Bar - Outside max-width container like home page */}
      {!isMobileApp && <TabBar />}
    </AuthGuard>
  );
};

const LifePage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LifePageContent />
    </Suspense>
  );
};

export default LifePage;
