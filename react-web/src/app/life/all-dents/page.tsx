'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../../hooks/useRouterWithPersistentParams';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';
import { Colors, Typography } from '../../../styles';
import CustomText from '../../../components/CustomText';
import LoadingSpinner from '../../../components/LoadingSpinner';
import TabBar from '../../../components/TabBar';
import Icon from '../../../components/Icon';
import UnifiedItemCard from '../../../components/UnifiedItemCard';
import {
  useTaskStore,
  useEventStore,
  useNoteStore,
  useFileStore,
  useFamilyStore,
  useEventTimeStore
} from '../../../context/store';

import { PRIORITY_ITEMS } from '../../../util/constants';
import moment from 'moment';
import {
  getUsersByAccount,
  getEventsByUser,
  getEventsByAccount,
  updateEventCompletionStatus,
  getNotesByUser,
  getNotesByAccount,
  getTasksByUser,
  getTasksByAccount,
  getEventTimesByAccount,
  getFiles,
  getFilesByUser,
  getWeeklyStats
} from '../../../services/services';
import { HIVE_ICONS } from '../../../assets/hive-icons';
import taskService from '../../../services/taskService';

// Import styles
import { trackEvent, AmplitudeEvents } from '../../../services/analytics';

import './all-dents.css';

/**
 * AuthGuard - A component that ensures authentication is complete before rendering children
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

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

interface AllDentsItem {
  UniqueId: string;
  Title: string;
  Text?: string;
  type: 'Task' | 'Event' | 'Note' | 'Document';
  Priority?: number | null;
  Deadline_DateTime?: string | null;
  CreationTimestamp?: string;
  User_uniqueId?: string;
  completed?: boolean;
  // All-day flags for display logic
  isAllDay?: boolean;
  IsAllDay?: boolean;
}

const AllDentsContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();

  // Get type from URL parameters
  const type = searchParams.get('type') || 'Task';

  // Get weekly filter from URL parameters
  const isWeeklyFilter = searchParams.get('weekly') === 'true';

  // Track Life tab drill down on mount
  useEffect(() => {
    try { trackEvent(AmplitudeEvents.lifeTabDrillDown, { type }); } catch {}
  }, []);

  // Get selected user ID from URL parameters
  const urlSelectedUserId = searchParams.get('userId');

  // Get completed filter from URL parameters (only applies to tasks)
  const completedParam = searchParams.get('completed'); // 'true', 'false', or null
  const completedFilter = completedParam === 'true' ? true : completedParam === 'false' ? false : null;

  // Mobile detection
  const mobileToken = searchParams.get('token');

  // Store states
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);
  const events = useEventStore((state) => state.events);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const notes = useNoteStore((state) => state.notes);
  const files = useFileStore((state) => state.files);
  const family = useFamilyStore((state) => state.family);
  const eventTimes = useEventTimeStore((state) => state.eventTimes);

  // Filter and sort state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortOption, setSortOption] = useState<string>('Default');

  // Calendar navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Initialize with current week's Monday
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    return monday;
  });

  // Selected date for filtering
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sortDirection, setSortDirection] = useState<'Ascending' | 'Descending'>('Ascending');

  // Local completion status tracking for optimistic updates
  const [localCompletionStatus, setLocalCompletionStatus] = useState<Record<string, boolean>>({});
  const [selectedPeople, setSelectedPeople] = useState<string[]>(() => {
    // Initialize with URL parameter if present
    return urlSelectedUserId ? [urlSelectedUserId] : [];
  });
  const [statusFilter, setStatusFilter] = useState<'Completed' | 'Incomplete'>(() => {
    // Initialize based on URL completed parameter
    return completedFilter === true ? 'Completed' : 'Incomplete';
  });
  const [priorityFilter, setPriorityFilter] = useState<number | null>(null);

  // State
  // Loading state for fetch operations
  const [isLoadingData, setIsLoadingData] = useState(false);

// Pagination state for Events list
const [eventsPaged, setEventsPaged] = useState<any[]>([]);
const [pageIndex, setPageIndex] = useState(0);
const [pageSize] = useState(50);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const [hasMoreData, setHasMoreData] = useState(true);
const [totalEventsCount, setTotalEventsCount] = useState<number | null>(null);
// Totals for headings across types
const [totalTasksCount, setTotalTasksCount] = useState<number | null>(null);
const [totalNotesCount, setTotalNotesCount] = useState<number | null>(null);
const [totalDocsCount, setTotalDocsCount] = useState<number | null>(null);



  // Update selectedPeople when URL parameter changes (only when coming from external navigation)
  useEffect(() => {
    if (urlSelectedUserId && !selectedPeople.includes(urlSelectedUserId)) {
      setSelectedPeople([urlSelectedUserId]);
    } else if (!urlSelectedUserId && selectedPeople.length > 0) {
      setSelectedPeople([]);
    }
  }, [urlSelectedUserId]);

  // Update statusFilter when URL completed parameter changes
  useEffect(() => {
    const newStatusFilter = completedFilter === true ? 'Completed' : 'Incomplete';
    if (statusFilter !== newStatusFilter) {
      setStatusFilter(newStatusFilter);
    }
  }, [completedFilter, statusFilter]);

  // Fetch data from API when dependencies change
  useEffect(() => {
    fetchDataFromAPI();
  }, [authUser?.id, authUser?.accountId, type, isWeeklyFilter, statusFilter, selectedPeople]);



  // Filter and sort data based on type and filters
  const filteredData = useMemo((): AllDentsItem[] => {

    let data: AllDentsItem[] = [];

    // Get base data by type
    switch (type) {
      case 'Task':
        // Filter tasks - API already returns correct completion status based on statusFilter
        const filteredTasks = tasks.filter(task => task.UniqueId && task.Title);

        data = filteredTasks.map(task => ({
          ...task,
          UniqueId: task.UniqueId!,
          Title: task.Title!,
          // Priority field is already normalized for tasks
          Priority: task.Priority ?? null,
          type: 'Task' as const,
          completed: task.completed || false
        }));
        break;
      case 'Event':
        // Use paged events for this page when available; otherwise fall back to store
        const baseEvents: any[] = eventsPaged;
        data = baseEvents.filter(event => {
          // Handle both React Native (UniqueId/Title) and React Web (id/title) field naming
          const hasId = (event as any).UniqueId || (event as any).id;
          const hasTitle = (event as any).Title || (event as any).title;
          return hasId && hasTitle;
        }).map(event => ({
          ...(event as any),
          UniqueId: (event as any).UniqueId || (event as any).id!,
          Title: (event as any).Title || (event as any).title!,
          // Normalize text field - use Text (uppercase) for consistency with UnifiedItemCard
          Text: (event as any).Text || (event as any).text || '',
          // Normalize priority field - use Priority (uppercase) for consistency with UnifiedItemCard
          Priority: (event as any).Priority ?? (event as any).priority ?? null,
          type: 'Event' as const
        }));
        break;
      case 'Note':
        data = notes.filter(note => note.UniqueId).map(note => ({
          ...note,
          UniqueId: note.UniqueId!,
          Title: note.Title || i18n.t('UntitledNote'),
          Text: note.Checklist_Data && note.Checklist_Data.trim() !== ''
            ? note.Checklist_Data  // Use Checklist_Data if it exists and is not empty
            : note.Text || '',     // Otherwise use Text field
          type: 'Note' as const
        }));
        break;
      case 'Document':
        data = files.map(file => {
          const description = (file as any).description || (file as any).Description || '';
          const trimmedDesc = typeof description === 'string' ? description.trim() : '';
          const filename = file.Filename || file.filename || i18n.t('UntitledDocument');
          return {
            UniqueId: file.UniqueId || file.id,
            // Always show filename as title
            Title: filename,
            // Show description as body text (with truncation), empty if no description
            Text: trimmedDesc || '',
            type: 'Document' as const,
            CreationTimestamp: file.CreationTimestamp || file.creationTimestamp,
            User_uniqueId: file.User_uniqueId || file.userId,
            FileURL: file.FileURL || file.fileUrl
          } as AllDentsItem & { FileURL?: string };
        });
        break;
      default:
        data = [];
    }

    // Apply filters
    if (selectedPeople.length > 0) {
      data = data.filter(item =>
        item.User_uniqueId && selectedPeople.includes(item.User_uniqueId)
      );
    }

    // Status filtering is now handled server-side via the includeCompleted parameter

    if (priorityFilter !== null) {
      data = data.filter(item => item.Priority === priorityFilter);
    }

    // Date filtering - filter by selected date
    if (selectedDate) {
      data = data.filter(item => {
        // Check deadline date first, then creation date
        const itemDate = item.Deadline_DateTime || item.CreationTimestamp;
        if (!itemDate) return false;

        const itemMoment = moment(itemDate);
        const selectedMoment = moment(selectedDate);

        // Compare dates (ignore time)
        return itemMoment.format('YYYY-MM-DD') === selectedMoment.format('YYYY-MM-DD');
      });
    }

    // Apply sorting
    switch (sortOption) {
      case 'ByPriority':
        data.sort((a, b) => {
          const priorityA = a.Priority ?? 0;
          const priorityB = b.Priority ?? 0;
          return sortDirection === 'Ascending' ? priorityA - priorityB : priorityB - priorityA;
        });
        break;
      case 'ByCreationDate':
        data.sort((a, b) => {
          const dateA = a.CreationTimestamp ? moment(a.CreationTimestamp) : null;
          const dateB = b.CreationTimestamp ? moment(b.CreationTimestamp) : null;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return sortDirection === 'Ascending' ? dateA.diff(dateB) : dateB.diff(dateA);
        });
        break;
      case 'ByDueDate':
        data.sort((a, b) => {
          const dateA = a.Deadline_DateTime ? moment(a.Deadline_DateTime) : null;
          const dateB = b.Deadline_DateTime ? moment(b.Deadline_DateTime) : null;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return sortDirection === 'Ascending' ? dateA.diff(dateB) : dateB.diff(dateA);
        });
        break;
      default:
        // Default sort by creation date, newest first
        data.sort((a, b) => {
          const dateA = a.CreationTimestamp ? moment(a.CreationTimestamp) : null;
          const dateB = b.CreationTimestamp ? moment(b.CreationTimestamp) : null;
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.diff(dateA);
        });
    }

    return data;
  }, [type, tasks, /*events unused for Event paging*/ notes, files, selectedPeople, statusFilter, priorityFilter, sortOption, sortDirection, selectedDate, eventsPaged]);

  // Get heading based on type
  const getHeading = (itemType: string) => {
    const baseHeading = (() => {
      switch (itemType) {
        case 'Task':
          return i18n.t('AllTasks');
        case 'Event':
          return i18n.t('AllEvents');
        case 'Note':
          return i18n.t('AllNotes');
        case 'Document':
          return i18n.t('AllDocuments');
        default:
          return '';
      }
    })();

    // Add "This Week" prefix if weekly filter is active
    if (isWeeklyFilter) {
      switch (itemType) {
        case 'Task':
          return i18n.t('TasksThisWeek');
        case 'Event':
          return i18n.t('EventsThisWeek');
        case 'Note':
          return i18n.t('NotesThisWeek');
        case 'Document':
          return i18n.t('DocumentsThisWeek');
        default:
          return `${baseHeading} This Week`;
      }
    }

    return baseHeading;
  };


  // Compute heading count consistently across types using Weekly Stats when weekly=true
  const getHeadingCount = (): number => {
    switch (type) {
      case 'Event':
        return totalEventsCount ?? filteredData.length;
      case 'Task':
        return totalTasksCount ?? filteredData.length;
      case 'Note':
        return totalNotesCount ?? filteredData.length;
      case 'Document':
        return totalDocsCount ?? filteredData.length;
      default:
        return filteredData.length;
    }
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return selectedPeople.length > 0 ||
           statusFilter !== 'Incomplete' ||
           priorityFilter !== null ||
           sortOption !== 'Default' ||
           selectedDate !== null;
  };

  // Load a page of Events with paging params; when replace=true, resets the list
  const loadEventsPage = async (nextPageIndex: number, replace: boolean = false) => {
    if (!authUser?.id || !authUser?.accountId) return 0;

    try {
      const selectedUsers = [...selectedPeople];

      // When replacing (initial load), show page-level spinner; otherwise show "load more" spinner
      if (!replace) setIsLoadingMore(true);

      let results: any[] = [];

      if (selectedUsers.length === 0) {
        // 0 users -> account endpoint (proxy requires userId for auth)
        results = await getEventsByAccount(
          authUser.accountId,
          authUser.id,
          isWeeklyFilter,
          undefined,
          undefined,
          pageSize,
          nextPageIndex
        );
      } else if (selectedUsers.length === 1) {
        // 1 user -> user endpoint once
        results = await getEventsByUser(
          selectedUsers[0],
          authUser.accountId,
          isWeeklyFilter,
          undefined,
          undefined,
          pageSize,
          nextPageIndex
        );
      } else {
        // 2+ users -> call user endpoint for each selected user and merge
        const promises = selectedUsers.map(uid =>
          getEventsByUser(
            uid,
            authUser.accountId,
            isWeeklyFilter,
            undefined,
            undefined,
            pageSize,
            nextPageIndex
          )
        );
        const arrays = await Promise.all(promises);
        const merged = arrays.flat();
        // Deduplicate by UniqueId/id in case the same event appears for multiple users
        const seen = new Set<string>();
        results = merged.filter((ev: any) => {
          const key = (ev as any).UniqueId || (ev as any).id;
          if (!key) return false;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        // Sort by deadline for stability (ascending for unfiltered default window)
        results.sort((a: any, b: any) => {
          const A = (a as any).Deadline_DateTime || (a as any).deadlineDateTime || '';
          const B = (b as any).Deadline_DateTime || (b as any).deadlineDateTime || '';
          return (A || '').localeCompare(B || '');
        });
      }

      setEventsPaged(prev => (replace ? results : [...prev, ...results]));

      const prevCount = replace ? 0 : eventsPaged.length;
      const newTotalLoaded = prevCount + results.length;
      if (typeof totalEventsCount === 'number') {
        setHasMoreData(newTotalLoaded < totalEventsCount);
      } else {
        // Fallback heuristic: if any call returned a full page, assume there may be more
        const fullPageLikely = results.length >= pageSize || selectedUsers.length > 1; // multi-user likely has more
        setHasMoreData(fullPageLikely);
      }

      return results.length;
    } catch (e) {
      console.error('Error loading events page:', e);
      setHasMoreData(false);
      return 0;
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load total events count from weekly stats (account-wide, single user, or multi-user sum)
  const loadEventsTotalCount = async () => {
    if (!authUser?.accountId) return;
    try {
      const stats = await getWeeklyStats({
        accountId: authUser.accountId,
        // For single-user we can request targeted breakdown; for multi-user omit to get all
        userId: selectedPeople.length === 1 ? selectedPeople[0] : undefined,
        includeUserBreakdown: true
      });

      let total: number | null = null;
      const useWeekly = isWeeklyFilter === true;

      if (selectedPeople.length === 0) {
        // Account-wide total
        total = useWeekly
          ? (stats as any)?.weeklyStats?.eventsUpcoming ?? null
          : (stats as any)?.dentsCount?.events ?? null;
      } else if (selectedPeople.length === 1) {
        // Single user total
        const uid = selectedPeople[0];
        if (Array.isArray((stats as any).userBreakdowns)) {
          const ub = (stats as any).userBreakdowns.find((u: any) => u.userId === uid);
          total = useWeekly
            ? ub?.weeklyStats?.eventsUpcoming ?? null
            : ub?.dentsCount?.events ?? null;
        }
      } else {
        // Multi-user total: sum selected users
        if (Array.isArray((stats as any).userBreakdowns)) {
          total = (stats as any).userBreakdowns
            .filter((u: any) => selectedPeople.includes(u.userId))
            .reduce((sum: number, u: any) => sum + (
              useWeekly ? (u?.weeklyStats?.eventsUpcoming || 0) : (u?.dentsCount?.events || 0)
            ), 0);
        } else {
          total = null;
        }
      }

      if (typeof total === 'number') setTotalEventsCount(total);
    } catch (e) {
      console.warn('Could not load weekly stats for total events count:', e);
    }
  };


  // Load total tasks count from weekly stats (respects Completed vs Incomplete when weekly=true)
  const loadTasksTotalCount = async () => {
    if (!authUser?.accountId) return;
    try {
      const stats = await getWeeklyStats({
        accountId: authUser.accountId,
        userId: selectedPeople.length === 1 ? selectedPeople[0] : undefined,
        includeUserBreakdown: true
      });

      let total: number | null = null;
      const useWeekly = isWeeklyFilter === true;
      const completed = statusFilter === 'Completed';

      if (selectedPeople.length === 0) {
        total = useWeekly
          ? (completed
              ? (stats as any)?.weeklyStats?.tasksCompletedThisWeek ?? null
              : (stats as any)?.weeklyStats?.tasksIncomplete ?? null)
          : (stats as any)?.dentsCount?.tasks ?? null;
      } else if (selectedPeople.length === 1) {
        const uid = selectedPeople[0];
        if (Array.isArray((stats as any).userBreakdowns)) {
          const ub = (stats as any).userBreakdowns.find((u: any) => u.userId === uid);
          total = useWeekly
            ? (completed
                ? ub?.weeklyStats?.tasksCompletedThisWeek ?? null
                : ub?.weeklyStats?.tasksIncomplete ?? null)
            : ub?.dentsCount?.tasks ?? null;
        }
      } else {
        if (Array.isArray((stats as any).userBreakdowns)) {
          total = (stats as any).userBreakdowns
            .filter((u: any) => selectedPeople.includes(u.userId))
            .reduce((sum: number, u: any) => sum + (
              useWeekly
                ? (completed ? (u?.weeklyStats?.tasksCompletedThisWeek || 0) : (u?.weeklyStats?.tasksIncomplete || 0))
                : (u?.dentsCount?.tasks || 0)
            ), 0);
        } else {
          total = null;
        }
      }

      if (typeof total === 'number') setTotalTasksCount(total);
    } catch (e) {
      console.warn('Could not load weekly stats for total tasks count:', e);
    }
  };

  // Load total notes count from weekly stats
  const loadNotesTotalCount = async () => {
    if (!authUser?.accountId) return;
    try {
      const stats = await getWeeklyStats({
        accountId: authUser.accountId,
        userId: selectedPeople.length === 1 ? selectedPeople[0] : undefined,
        includeUserBreakdown: true
      });

      let total: number | null = null;
      const useWeekly = isWeeklyFilter === true;

      if (selectedPeople.length === 0) {
        total = useWeekly
          ? (stats as any)?.weeklyStats?.notesCreatedThisWeek ?? null
          : (stats as any)?.dentsCount?.notes ?? null;
      } else if (selectedPeople.length === 1) {
        const uid = selectedPeople[0];
        if (Array.isArray((stats as any).userBreakdowns)) {
          const ub = (stats as any).userBreakdowns.find((u: any) => u.userId === uid);
          total = useWeekly
            ? ub?.weeklyStats?.notesCreatedThisWeek ?? null
            : ub?.dentsCount?.notes ?? null;
        }
      } else {
        if (Array.isArray((stats as any).userBreakdowns)) {
          total = (stats as any).userBreakdowns
            .filter((u: any) => selectedPeople.includes(u.userId))
            .reduce((sum: number, u: any) => sum + (
              useWeekly ? (u?.weeklyStats?.notesCreatedThisWeek || 0) : (u?.dentsCount?.notes || 0)
            ), 0);
        } else {
          total = null;
        }
      }

      if (typeof total === 'number') setTotalNotesCount(total);
    } catch (e) {
      console.warn('Could not load weekly stats for total notes count:', e);
    }
  };

  // Load total docs count from weekly stats
  const loadDocsTotalCount = async () => {
    if (!authUser?.accountId) return;
    try {
      const stats = await getWeeklyStats({
        accountId: authUser.accountId,
        userId: selectedPeople.length === 1 ? selectedPeople[0] : undefined,
        includeUserBreakdown: true
      });

      let total: number | null = null;
      const useWeekly = isWeeklyFilter === true;

      if (selectedPeople.length === 0) {
        total = useWeekly
          ? (stats as any)?.weeklyStats?.docsUploadedThisWeek ?? null
          : (stats as any)?.dentsCount?.docs ?? null;
      } else if (selectedPeople.length === 1) {
        const uid = selectedPeople[0];
        if (Array.isArray((stats as any).userBreakdowns)) {
          const ub = (stats as any).userBreakdowns.find((u: any) => u.userId === uid);
          total = useWeekly
            ? ub?.weeklyStats?.docsUploadedThisWeek ?? null
            : ub?.dentsCount?.docs ?? null;
        }
      } else {
        if (Array.isArray((stats as any).userBreakdowns)) {
          total = (stats as any).userBreakdowns
            .filter((u: any) => selectedPeople.includes(u.userId))
            .reduce((sum: number, u: any) => sum + (
              useWeekly ? (u?.weeklyStats?.docsUploadedThisWeek || 0) : (u?.dentsCount?.docs || 0)
            ), 0);
        } else {
          total = null;
        }
      }

      if (typeof total === 'number') setTotalDocsCount(total);
    } catch (e) {
      console.warn('Could not load weekly stats for total docs count:', e);
    }
  };



  const handleLoadMore = async () => {
    const next = pageIndex + 1;
    const loaded = await loadEventsPage(next, false);
    if (loaded > 0) setPageIndex(next);
  };

  // Function to fetch data from API
  const fetchDataFromAPI = async (currentSelectedPeople: string[] = selectedPeople) => {
    if (!authUser?.id || !authUser?.accountId) {
      return;
    }

    setIsLoadingData(true);

    try {
      // Get store setters
      const setTasks = useTaskStore.getState().setTasks;
      const setNotes = useNoteStore.getState().setNotes;
      const setEvents = useEventStore.getState().setEvents;
      const setEventTimes = useEventTimeStore.getState().setEventTimes;
      const setFiles = useFileStore.getState().setFiles;
      const setFamily = useFamilyStore.getState().setFamily;

      // Fetch family members first (always needed for user names)
      const familyData = await getUsersByAccount(authUser.accountId);
      if (familyData) {
        setFamily(familyData);
      }

      switch (type) {
        case 'Task':
          // Determine includeCompleted based on statusFilter
          const includeCompleted = statusFilter === 'Completed';

          // Use account-wide API when no specific people are selected, user-specific when people are selected
          if (currentSelectedPeople.length === 0) {
            const tasksResult = await getTasksByAccount(authUser.id, authUser.accountId, includeCompleted, isWeeklyFilter);
            setTasks(tasksResult);
          } else {
            // When specific people are selected, fetch for the first selected person
            const selectedUserId = currentSelectedPeople[0];
            const tasksResult = await getTasksByUser(selectedUserId, authUser.accountId, includeCompleted, isWeeklyFilter);
            setTasks(tasksResult);
          }
          await loadTasksTotalCount();
          break;

        case 'Event':
          // Reset paging state and load total count for display
          setEventsPaged([]);
          setPageIndex(0);
          setHasMoreData(true);
          await loadEventsTotalCount();
          // Load first page
          await loadEventsPage(0, true);
          break;

        case 'Note':
          // Use account-wide API when no specific people are selected, user-specific when people are selected
          if (currentSelectedPeople.length === 0) {
            const notesResult = await getNotesByAccount(authUser.id, authUser.accountId, isWeeklyFilter);
            setNotes(notesResult);
          } else {
            // When specific people are selected, fetch for the first selected person
            const selectedUserId = currentSelectedPeople[0];
            const notesResult = await getNotesByUser(selectedUserId, authUser.accountId, isWeeklyFilter);
            setNotes(notesResult);
          }
          await loadNotesTotalCount();
          break;

        case 'Document':
          // Use account-wide API when no specific people are selected, user-specific when people are selected
          if (currentSelectedPeople.length === 0) {
            const filesResult = await getFiles(authUser.accountId, authUser.id, isWeeklyFilter);
            setFiles(filesResult);
          } else {
            // When specific people are selected, fetch for the first selected person
            const selectedUserId = currentSelectedPeople[0];
            const filesResult = await getFilesByUser(selectedUserId, authUser.accountId, isWeeklyFilter);
            setFiles(filesResult);
          }
          await loadDocsTotalCount();
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Helper function to update URL when selected people change
  const updateSelectedPeopleAndUrl = async (newSelectedPeople: string[]) => {
    setSelectedPeople(newSelectedPeople);

    // Update URL to reflect the change
    const currentParams = new URLSearchParams(window.location.search);

    if (newSelectedPeople.length > 0) {
      // Set the first selected person as the userId parameter
      currentParams.set('userId', newSelectedPeople[0]);
    } else {
      // Remove the userId parameter when no one is selected
      currentParams.delete('userId');
    }

    // Update the URL without causing a page reload
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
    window.history.replaceState({}, '', newUrl);

    // Fetch will be triggered by the useEffect listening to selectedPeople
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateSelectedPeopleAndUrl([]);
    setStatusFilter('Incomplete');
    setPriorityFilter(null);
    setSortOption('Default');
    setSortDirection('Ascending');
    setSelectedDate(null); // Clear date filter

    // Remove completed parameter from URL to reset completion filter
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.delete('completed');

    const newUrl = `/life/all-dents?${currentParams.toString()}`;
    router.push(newUrl);
  };

  // Toggle person filter
  const togglePersonFilter = (personId: string) => {
    const newSelectedPeople = selectedPeople.includes(personId)
      ? selectedPeople.filter(id => id !== personId)
      : [...selectedPeople, personId];

    updateSelectedPeopleAndUrl(newSelectedPeople);
  };

  // Handle item press
  const handleItemPress = (item: AllDentsItem) => {
    switch (item.type) {
      case 'Task': {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/edit-task/${item.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
        break;
      }
      case 'Event': {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/edit-event/${item.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
        break;
      }
      case 'Note': {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/edit-note/${item.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
        break;
      }
      case 'Document':
        router.push(`/document-viewer?fwdDoc=${encodeURIComponent(JSON.stringify({
          UniqueIdForFile: item.UniqueId,
          FileName: item.Title,
          url: (item as any).FileURL || ''
        }))}`);
        break;
    }
  };

  // Get user name for item
  const getUserName = (userId?: string): string => {
    if (!userId) return 'Unknown';
    const user = family.find(member => member.UniqueId === userId);
    return user ? `${user.FirstName} ${user.LastName}` : 'Unknown';
  };

  // Get priority information for display
  const getPriorityInfo = (priority?: number) => {
    const priorityValue = priority ?? 0; // Default to no priority
    return PRIORITY_ITEMS.find(item => item.value === priorityValue) || PRIORITY_ITEMS[0]; // Fallback to None (value 0)
  };

  // Helper function to get priority icon color (using PRIORITY_ITEMS)
  const getPriorityIconColor = (priority?: number): string => {
    const priorityValue = priority ?? 0;
    const priorityItem = PRIORITY_ITEMS.find(item => item.value === priorityValue);
    return priorityItem?.iconColor || '#666E96';
  };

  // Helper function to get priority text label
  const getPriorityText = (priority?: number): string => {
    const priorityValue = priority ?? 0;

    switch (priorityValue) {
      case 0: return 'None';     // No Priority
      case 1: return 'Low';      // Low Priority
      case 2: return 'Medium';   // Medium Priority
      case 3: return 'High';     // High Priority
      default: return 'None';
    }
  };

  // Get formatted date for item
  const getFormattedDate = (item: AllDentsItem): string => {
    let dateToFormat: string | null | undefined;

    if (item.type === 'Event') {
      // For events, use deadline date time
      dateToFormat = item.Deadline_DateTime;
    } else if (item.type === 'Task') {
      dateToFormat = item.Deadline_DateTime;
    } else if (item.type === 'Note' || item.type === 'Document') {
      // For notes and documents, use creation timestamp
      dateToFormat = item.CreationTimestamp;
    }

    if (dateToFormat) {
      const date = moment(dateToFormat);
      return date.isValid() ? date.format('MMM DD, YYYY') : '';
    }

    return '';
  };



  // Get priority color for text
  const getPriorityTextColor = (priority?: number): string => {
    const priorityValue = priority ?? 0;
    const colorMap: { [key: number]: string } = {
      0: '#666E96', // Gray for no priority
      1: '#6CC47C', // Green for low priority
      2: '#FFA020', // Orange for medium priority
      3: '#FF6961', // Red for high priority
    };
    return colorMap[priorityValue] || '#666E96';
  };

  // Format bullet point list for notes (up to 3 lines with ellipsis)
  const formatBulletPointList = (text: string): string => {
    if (!text) return text;

    // Try to parse as JSON first (in case it's checklist data)
    let contentToProcess = text;
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        // If it's an array of checklist items
        const checklistItems = parsed.filter(item =>
          item && (typeof item === 'string' || (typeof item === 'object' && item.text))
        );

        if (checklistItems.length >= 2) {
          const displayItems = checklistItems.slice(0, 2);
          const formattedItems = displayItems.map(item => {
            const itemText = typeof item === 'string' ? item : item.text || item.title || '';
            return `• ${itemText.trim()}`;
          });

          if (checklistItems.length > 2) {
            return formattedItems.join('\n') + `\n${i18n.t('MoreEllipsis')}`;
          }

          return formattedItems.join('\n');
        }
      } else if (parsed && typeof parsed === 'object' && parsed.items) {
        // If it's an object with items array
        return formatBulletPointList(JSON.stringify(parsed.items));
      }
    } catch (e) {
      // Not JSON, continue with text processing
    }

    // Check if text contains bullet points (lines starting with -, •, *, or numbers)
    const lines = contentToProcess.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const bulletPatterns = [
      /^[-•*]\s+(.+)$/,      // Dash, bullet, or asterisk with space
      /^[-•*](.+)$/,         // Dash, bullet, or asterisk without space
      /^\d+\.\s+(.+)$/,      // Numbered list (1. item)
      /^\d+\)\s+(.+)$/,      // Numbered list (1) item)
      /^[a-zA-Z]\.\s+(.+)$/, // Lettered list (a. item)
      /^[a-zA-Z]\)\s+(.+)$/  // Lettered list (a) item)
    ];

    const bulletLines = lines.filter(line =>
      bulletPatterns.some(pattern => pattern.test(line))
    );

    // Only format as bullet list if we have at least 2 bullet items
    if (bulletLines.length >= 2) {
      const displayLines = bulletLines.slice(0, 2); // Take up to 2 lines
      const formattedLines = displayLines.map(line => {
        // Extract the content after the bullet/number
        for (const pattern of bulletPatterns) {
          const match = line.match(pattern);
          if (match) {
            return `• ${match[1].trim()}`; // Use consistent bullet point
          }
        }
        return `• ${line}`; // Fallback
      });

      // Add "More..." if there are more items
      if (bulletLines.length > 2) {
        return formattedLines.join('\n') + `\n${i18n.t('MoreEllipsis')}`;
      }

      return formattedLines.join('\n');
    }

    // Not a bullet list, return original text (will be truncated later)
    return text;
  };

  // Format date for display
  const formatDateForDisplay = (item: AllDentsItem): string => {
    const formattedDate = getFormattedDate(item);
    if (!formattedDate) return i18n.t('NoDate');

    // Check if it's today - use appropriate date field based on type
    const today = moment().format('YYYY-MM-DD');
    let dateToCheck: string | null | undefined;

    if (item.type === 'Task' || item.type === 'Event') {
      dateToCheck = item.Deadline_DateTime;
    } else if (item.type === 'Note' || item.type === 'Document') {
      dateToCheck = item.CreationTimestamp;
    }

    if (dateToCheck) {
      const itemDate = moment(dateToCheck).format('YYYY-MM-DD');
      return itemDate === today ? 'Today' : formattedDate;
    }

    return formattedDate;
  };

  // Handle task completion toggle
  const handleTaskCompletionToggle = async (item: AllDentsItem, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click

    if (item.type !== 'Task' || !authUser || !authUser.accountId) return;

    // Optimistically update the UI immediately
    const currentStatus = getCurrentCompletionStatus(item);
    const newCompletionStatus = !currentStatus;
    setLocalCompletionStatus(prev => ({
      ...prev,
      [item.UniqueId]: newCompletionStatus
    }));

    try {
      console.log(`Toggling task completion: ${item.Title} -> ${newCompletionStatus ? 'completed' : 'incomplete'}`);

      // Call the task service to update completion status
      // Use the same pattern as view-task and time pages that work
      const updatedTask = await taskService.updateTaskCompletionStatus(
        item.UniqueId,
        authUser.id,
        authUser.accountId,
        newCompletionStatus
      );

      if (updatedTask) {
        // Update the store with the server response
        updateTask({ ...updatedTask, completed: newCompletionStatus });

        console.log(`Task completion updated successfully: ${item.Title}`);
      } else {
        // Revert the optimistic update on failure
        setLocalCompletionStatus(prev => ({
          ...prev,
          [item.UniqueId]: !newCompletionStatus
        }));
        console.error('Failed to update task completion status');
      }
    } catch (error) {
      // Revert the optimistic update on error
      setLocalCompletionStatus(prev => ({
        ...prev,
        [item.UniqueId]: !newCompletionStatus
      }));
      console.error('Error toggling task completion:', error);
    }
  };

  // Handle event completion toggle
  const handleEventCompletionToggle = async (item: AllDentsItem, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click

    if (item.type !== 'Event' || !authUser || !authUser.accountId) return;

    // Optimistically update the UI immediately
    const currentStatus = getCurrentCompletionStatus(item);
    const newCompletionStatus = !currentStatus;
    setLocalCompletionStatus(prev => ({
      ...prev,
      [item.UniqueId]: newCompletionStatus
    }));

    try {


      // Call the event service to update completion status
      // Use correct mapping: userId=authUser.id, accountId=authUser.accountId
      const updatedEvent = await updateEventCompletionStatus(
        item.UniqueId,
        authUser.id,        // userId
        authUser.accountId, // accountId
        newCompletionStatus
      );

      if (updatedEvent) {
        // Update the store with the server response
        updateEvent(updatedEvent);

        console.log(`Event completion updated successfully: ${item.Title}`);
      } else {
        // Revert the optimistic update on failure
        setLocalCompletionStatus(prev => ({
          ...prev,
          [item.UniqueId]: !newCompletionStatus
        }));
        console.error('Failed to update event completion status');
      }
    } catch (error) {
      // Revert the optimistic update on error
      setLocalCompletionStatus(prev => ({
        ...prev,
        [item.UniqueId]: !newCompletionStatus
      }));
      console.error('Error toggling event completion:', error);
    }
  };

  // Static descriptions for empty descriptions based on type
  const getPlaceholderDescription = (type: string): string => {
    switch (type) {
      case 'Task':
        return "Your future self might need more details than that...";
      case 'Event':
        return "Is there more to it? Add more details here!";
      case 'Note':
        return "Fill in the blanks to avoid confusion later.";
      case 'Document':
        return "Fill in the blanks to avoid confusion later.";
      default:
        return "Add more details here.";
    }
  };

  // Get current completion status (local override or original)
  const getCurrentCompletionStatus = (item: AllDentsItem): boolean => {
    return localCompletionStatus.hasOwnProperty(item.UniqueId)
      ? localCompletionStatus[item.UniqueId]
      : (item.completed || false);
  };

  // Render individual item
  const renderItem = (item: AllDentsItem) => {
    return (
      <UnifiedItemCard
        key={`${item.type}-${item.UniqueId}-${item.CreationTimestamp || item.Deadline_DateTime || ''}`}
        UniqueId={item.UniqueId}
        Title={item.Title}
        Text={item.Text}
        type={item.type}
        Priority={item.Priority}
        Deadline_DateTime={item.Deadline_DateTime}
        CreationTimestamp={item.CreationTimestamp}
        User_uniqueId={item.User_uniqueId}
        completed={getCurrentCompletionStatus(item)}
        onPress={() => handleItemPress(item)}
        onToggle={item.type === 'Task' ? (isCompleted) => {
          // Handle task completion toggle
          const e = new MouseEvent('click');
          handleTaskCompletionToggle(item, e as any);
        } : undefined}
        getUserName={getUserName}
        formatDateForDisplay={formatDateForDisplay}
        isAllDay={(item as any).isAllDay === true || (item as any).IsAllDay === true}
      />
    );
  };



  // Helper functions for carousel navigation
  // Updated order: Task, Note, Event, Document
  const carouselTypes = ['Task', 'Note', 'Event', 'Document'];

  const getLeftType = (currentType: string): string => {
    const currentIndex = carouselTypes.indexOf(currentType);
    const leftIndex = currentIndex === 0 ? carouselTypes.length - 1 : currentIndex - 1;
    return carouselTypes[leftIndex];
  };

  const getRightType = (currentType: string): string => {
    const currentIndex = carouselTypes.indexOf(currentType);
    const rightIndex = currentIndex === carouselTypes.length - 1 ? 0 : currentIndex + 1;
    return carouselTypes[rightIndex];
  };

  // Handle carousel navigation with URL updates
  const handleCarouselClick = (newType: string) => {
    // Update URL with new type while preserving other parameters
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('type', newType);

    // Clear weekly filter for Notes and Documents (they're not time-based)
    if (newType === 'Note' || newType === 'Document') {
      currentParams.delete('weekly');
    }

    // Use router.push to update URL and trigger re-render
    const newUrl = `/life/all-dents?${currentParams.toString()}`;
    router.push(newUrl);
  };

  // Map types to their corresponding SVG file names (same as EveryonesStuffItem)
  const getIconName = (type: string): string => {
    const iconMap: { [key: string]: string } = {
      'Task': 'task',
      'Note': 'note',
      'Document': 'doc',
      'Event': 'event',
    };
    return iconMap[type] || 'task';
  };

  // Get current week days (Monday to Sunday) based on currentWeekStart
  const getCurrentWeekDays = () => {
    const today = new Date();
    const weekDays = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(currentWeekStart);
      currentDate.setDate(currentWeekStart.getDate() + i);
      const dateNumber = currentDate.getDate();

      weekDays.push({
        dayName: dayNames[i],
        dateNumber: dateNumber.toString().padStart(2, '0'),
        isToday: dateNumber === today.getDate() &&
                 currentDate.getMonth() === today.getMonth() &&
                 currentDate.getFullYear() === today.getFullYear()
      });
    }

    return weekDays;
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  // Override the global background color for this page
  React.useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    return () => {
      // Reset to default when leaving the page
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <>
      <div className="all-dents-container">
        {/* Header - Cloned from /life page */}
        <div style={{
          paddingTop: '24px',
          backgroundColor: 'transparent',
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
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              {/* Left div - Back button */}
              <div style={{
                display: 'flex',
                width: '64px',
                height: '24px',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0
              }}>
                <img
                  src="/icons/icon-menu-back.svg"
                  width={24}
                  height={24}
                  alt="Back"
                  onClick={() => router.push('/life')}
                  style={{ cursor: 'pointer' }}
                />
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

              {/* Right div - Search icon */}
              <div style={{
                display: 'flex',
                width: '64px',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0
              }}>
                <div
                  onClick={() => router.push('/search?from=life')}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src="/icons/icon-search.svg"
                    width={24}
                    height={24}
                    alt="Search"
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Hex Header - Clickable Carousel */}
        <div style={{ width: '100%' }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
            height: '80px',
            backgroundColor: 'transparent',
            marginTop: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 48px',
            boxSizing: 'border-box'
          }}>
          {/* Left hex - Clickable */}
          <div
            onClick={() => handleCarouselClick(getLeftType(type))}
            style={{
              width: '58px',
              height: '64px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              opacity: 0.7
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            <img
              src={`/icons/life/icon-hex-${getIconName(getLeftType(type))}.svg`}
              width={58}
              height={64}
              alt={getLeftType(type)}
              style={{
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          {/* Middle hex (selected) - Clickable */}
          <div
            onClick={() => handleCarouselClick(type)}
            style={{
              width: '72px',
              height: '80px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              opacity: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src={`/icons/life/icon-hex-${getIconName(type)}.svg`}
              width={72}
              height={80}
              alt={type}
              style={{
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          {/* Right hex - Clickable */}
          <div
            onClick={() => handleCarouselClick(getRightType(type))}
            style={{
              width: '58px',
              height: '64px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              opacity: 0.7
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '0.7';
            }}
          >
            <img
              src={`/icons/life/icon-hex-${getIconName(getRightType(type))}.svg`}
              width={58}
              height={64}
              alt={getRightType(type)}
              style={{
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }}
            />
          </div>
        </div>
        </div>

        {/* Content Div */}
        <div style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '16px',
          marginTop: '32px', // 32px spacing from hex tiles above
          minHeight: 'calc(100vh - 80px - 100px)', // Adjust for header and tab bar
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box'
          }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px',
            alignSelf: 'stretch'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              alignSelf: 'stretch'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                alignSelf: 'stretch',
                padding: '0 24px'
              }}>
                {/* Title with count */}
                <div style={{
                  color: '#000E50',
                  fontFamily: 'Poppins',
                  fontSize: '20px',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '100%',
                  paddingBottom: '16px'
                }}>
                  {getHeading(type)} ({getHeadingCount()})
                </div>

                {/* Settings icon */}
                <img
                  src="/icons/life/icon-settings.svg"
                  width={24}
                  height={24}
                  alt="Settings"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowFilterModal(true)}
                />
              </div>
            </div>

            {/* TEMPORARILY DISABLED - Calendar Information Section */}
            {false && (
            <div style={{
              display: 'flex',
              padding: '4px 24px',
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'stretch',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                maxWidth: '400px' // Reasonable max width for the calendar
              }}>
                {/* Left arrow button */}
                <button
                  onClick={goToPreviousWeek}
                  style={{
                    display: 'flex',
                    width: '32px',
                    height: '32px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                >
                  <img
                    src="/icons/icon-menu-back.svg"
                    width={24}
                    height={24}
                    alt="Previous"
                  />
                </button>

                {/* Main center content - week days */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  flex: 1
                }}>
                  {getCurrentWeekDays().map((day, index) => {
                    const dayDate = new Date(currentWeekStart);
                    dayDate.setDate(currentWeekStart.getDate() + index);
                    const isSelected = selectedDate && moment(selectedDate).format('YYYY-MM-DD') === moment(dayDate).format('YYYY-MM-DD');

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDate(null); // Deselect if already selected
                          } else {
                            setSelectedDate(dayDate); // Select this date
                          }
                        }}
                        style={{
                          display: 'flex',
                          width: '32px',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          padding: '4px'
                        }}
                      >
                      {/* Day of week */}
                      <div style={{
                        color: day.isToday ? '#000E50' : '#666E96',
                        fontFamily: 'Poppins',
                        fontSize: '10px',
                        fontStyle: 'normal',
                        fontWeight: day.isToday ? 700 : 400,
                        lineHeight: '120%'
                      }}>
                        {day.dayName}
                      </div>
                      {/* Date number */}
                      <div style={{
                        color: day.isToday ? '#000E50' : '#666E96',
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: day.isToday ? 700 : 400,
                        lineHeight: '120%'
                      }}>
                        {day.dateNumber}
                      </div>
                    </div>
                  );
                  })}
                </div>

                {/* Right arrow button */}
                <button
                  onClick={goToNextWeek}
                  style={{
                    display: 'flex',
                    width: '32px',
                    height: '32px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                >
                  <img
                    src="/icons/icon-menu-back.svg"
                    width={24}
                    height={24}
                    alt="Next"
                    style={{
                      transform: 'rotate(180deg)'
                    }}
                  />
                </button>
              </div>
            </div>
            )}
          </div>

          {/* Content Section - moved up to appear right below calendar */}
          <div style={{
            width: '100%',
            maxWidth: '800px',
            padding: '0 20px',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}>
            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
                alignItems: 'center'
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_14,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                  color: Colors.BLACK,
                  marginRight: '8px'
                }}>
                  {i18n.t('Filters')}:
                </CustomText>

                {selectedPeople.map(personId => {
                  const person = family.find(f => f.UniqueId === personId);
                  return person ? (
                    <div key={personId} style={{
                      backgroundColor: Colors.BLUE,
                      color: Colors.WHITE,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: Typography.FONT_SIZE_12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {person.FirstName}
                      <span
                        onClick={() => togglePersonFilter(personId)}
                        style={{ cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ×
                      </span>
                    </div>
                  ) : null;
                })}

                {statusFilter !== 'Incomplete' && (
                  <div style={{
                    backgroundColor: Colors.MUSTARD,
                    color: Colors.WHITE,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: Typography.FONT_SIZE_12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {statusFilter}
                    <span
                      onClick={() => setStatusFilter('Incomplete')}
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ×
                    </span>
                  </div>
                )}

                {sortOption !== 'Default' && (
                  <div style={{
                    backgroundColor: Colors.PURPLE,
                    color: Colors.WHITE,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: Typography.FONT_SIZE_12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {sortOption} ({sortDirection})
                    <span
                      onClick={() => setSortOption('Default')}
                      style={{ cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ×
                    </span>
                  </div>
                )}

                <button
                  onClick={clearAllFilters}
                  style={{
                    background: 'none',
                    border: `1px solid ${Colors.LIGHT_RED}`,
                    color: Colors.LIGHT_RED,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: Typography.FONT_SIZE_12,
                    cursor: 'pointer'
                  }}
                >
                  {i18n.t('ClearAll')}
                </button>
              </div>
            )}

            {/* Items List */}
            {isLoadingData ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px 0'
              }}>
                <LoadingSpinner />
              </div>
            ) : filteredData.length > 0 ? (
              <>
                {filteredData.map(renderItem)}
                {type === 'Event' && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0', paddingBottom: '75px' }}>
                    {hasMoreData && (totalEventsCount === null || filteredData.length < (totalEventsCount || 0)) ? (
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        style={{
                          backgroundColor: Colors.BLUE,
                          color: Colors.WHITE,
                          border: 'none',
                          borderRadius: '12px',
                          padding: '10px 16px',
                          fontFamily: 'Poppins',
                          fontSize: '14px',
                          cursor: isLoadingMore ? 'default' : 'pointer'
                        }}
                      >
                        {isLoadingMore ? 'Loading…' : 'Load More'}
                      </button>
                    ) : (
                      <div style={{ color: Colors.GREY_COLOR, fontFamily: 'Poppins', fontSize: '12px' }}>
                        All events have been displayed
                      </div>
                    )}
                  </div>
                )}
                <div style={{ height: '75px' }} />
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: Colors.WHITE,
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  color: Colors.GREY_COLOR
                }}>
                  {i18n.t('NoItemsFound')}
                </CustomText>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Tab Bar - only show if not mobile */}
        {!mobileToken && <TabBar />}

        {/* Filter Modal */}
        {showFilterModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: Colors.WHITE,
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Modal Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_20,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                  color: Colors.BLACK
                }}>
                  {i18n.t('FilterAndSort')}
                </CustomText>
                <button
                  onClick={() => setShowFilterModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: Typography.FONT_SIZE_24,
                    cursor: 'pointer',
                    color: Colors.GREY_COLOR
                  }}
                >
                  ×
                </button>
              </div>

              {/* People Filter */}
              <div style={{ marginBottom: '24px' }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                  color: Colors.BLACK,
                  marginBottom: '12px'
                }}>
                  {i18n.t('FilterByPerson')}
                </CustomText>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {family.map(person => (
                    <button
                      key={person.UniqueId}
                      onClick={() => togglePersonFilter(person.UniqueId)}
                      style={{
                        backgroundColor: selectedPeople.includes(person.UniqueId) ? Colors.BLUE : Colors.LIGHT_GREY,
                        color: selectedPeople.includes(person.UniqueId) ? Colors.WHITE : Colors.BLACK,
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '16px',
                        fontSize: Typography.FONT_SIZE_14,
                        cursor: 'pointer'
                      }}
                    >
                      {person.FirstName} {person.LastName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter (Tasks only) */}
              {type === 'Task' && (
                <div style={{ marginBottom: '24px' }}>
                  <CustomText style={{
                    fontSize: Typography.FONT_SIZE_16,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                    color: Colors.BLACK,
                    marginBottom: '12px'
                  }}>
                    {i18n.t('FilterByStatus')}
                  </CustomText>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Completed', 'Incomplete'].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          const newStatus = status as 'Completed' | 'Incomplete';
                          setStatusFilter(newStatus);

                          // Update URL parameter to reflect the change
                          const currentParams = new URLSearchParams(window.location.search);
                          if (newStatus === 'Completed') {
                            currentParams.set('completed', 'true');
                          } else {
                            currentParams.set('completed', 'false');
                          }

                          const newUrl = `/life/all-dents?${currentParams.toString()}`;
                          router.push(newUrl);
                        }}
                        style={{
                          backgroundColor: statusFilter === status ? Colors.MUSTARD : Colors.LIGHT_GREY,
                          color: statusFilter === status ? Colors.WHITE : Colors.BLACK,
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '16px',
                          fontSize: Typography.FONT_SIZE_14,
                          cursor: 'pointer'
                        }}
                      >
                        {i18n.t(status as any)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort Options */}
              <div style={{ marginBottom: '24px' }}>
                <CustomText style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                  color: Colors.BLACK,
                  marginBottom: '12px'
                }}>
                  {i18n.t('SortBy')}
                </CustomText>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {['Default', 'ByPriority', 'ByCreationDate', 'ByDueDate'].map(key => (
                    <button
                      key={key}
                      onClick={() => setSortOption(i18n.t(key as any))}
                      style={{
                        backgroundColor: sortOption === i18n.t(key as any) ? Colors.PURPLE : Colors.LIGHT_GREY,
                        color: sortOption === i18n.t(key as any) ? Colors.WHITE : Colors.BLACK,
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '16px',
                        fontSize: Typography.FONT_SIZE_14,
                        cursor: 'pointer'
                      }}
                    >
                      {i18n.t(key as any)}
                    </button>
                  ))}
                </div>

                {/* Sort Direction */}
                {sortOption !== 'Default' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Ascending', 'Descending'].map(direction => (
                      <button
                        key={direction}
                        onClick={() => setSortDirection(direction as 'Ascending' | 'Descending')}
                        style={{
                          backgroundColor: sortDirection === direction ? Colors.PURPLE : Colors.LIGHT_GREY,
                          color: sortDirection === direction ? Colors.WHITE : Colors.BLACK,
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '12px',
                          fontSize: Typography.FONT_SIZE_12,
                          cursor: 'pointer'
                        }}
                      >
                        {direction}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={clearAllFilters}
                  style={{
                    backgroundColor: Colors.LIGHT_GREY,
                    color: Colors.BLACK,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: Typography.FONT_SIZE_14,
                    cursor: 'pointer'
                  }}
                >
                  {i18n.t('ClearAll')}
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  style={{
                    backgroundColor: Colors.BLUE,
                    color: Colors.WHITE,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: Typography.FONT_SIZE_14,
                    cursor: 'pointer'
                  }}
                >
                  {i18n.t('Apply')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const AllDentsPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: Colors.WHITE
      }}>
        <LoadingSpinner />
      </div>
    }>
      <AllDentsContent />
    </Suspense>
  );
};

export default AllDentsPage;
