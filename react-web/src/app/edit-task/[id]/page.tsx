/**
 * Edit Task Page
 *
 * This page provides a comprehensive task editing interface that reuses the create task UI
 * but pre-populates it with existing task data and handles updates instead of creation.
 */

'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from '../../../hooks/useRouterWithPersistentParams';
import { useAuth } from '../../../context/AuthContext';
import { useLanguageContext } from '../../../context/LanguageContext';

import CustomText from '../../../components/CustomText';
import Button from '../../../components/Button';
import MenuListItem from '../../../components/MenuListItem';
import OverlayModal from '../../../components/OverlayModal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DeleteTaskModal from '../../../components/DeleteTaskModal';
import { DeleteTaskRequest } from '../../../services/types/task';

import Modal from '../../../components/Modal';
import HiveSelectionModal from '../../../components/HiveSelectionModal';
import FamilyMemberSelectionModal from '../../../components/FamilyMemberSelectionModal';
import DatetimeRangeInput from '../../../components/DatetimeRangeInput';
import { FamilyMember } from '../../../services/familyService';
import { Colors } from '../../../styles/index';
import taskStyles from './edit-task.module.css';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_FAMILY_POPPINS_MEDIUM,
  FONT_SIZE_16,
  FONT_SIZE_20,
} from '../../../styles/typography';
import {
  REMINDER_OPTIONS,
  RECURRING_FREQUENCY_ITEMS,
  getApiFrequency,
  getFrequencyOptionFromValue,
} from '../../../util/constants';
import { getPropertyFrequency, getReminderStringFromType, getReminderTypeFromString } from '../../../util/helpers';
import { roundTimeToNextHour } from '../../../util/calendar';
import {
  buildTaskPayload,
  mapSyntheticTilesToRealTiles,
} from '../../../util/helpers';
import { ITTask } from '../../../services/types';
import { mapApiTaskToITTask } from '../../../services/types/task';
import taskService from '../../../services/taskService';
import tileService from '../../../services/tileService';
import { useTaskStore } from '../../../context/store';
import { trackEvent, AmplitudeEvents } from '../../../services/analytics';

import moment from 'moment';

// AuthGuard component to protect the route
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  return <>{children}</>;
};

/**
 * EditTaskContent - The main content of the edit task page
 */
const EditTaskContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { tasks, setTasks } = useTaskStore();

  // Task loading state
  const [originalTask, setOriginalTask] = useState<ITTask | null>(null);
  const [isLoadingTask, setIsLoadingTask] = useState<boolean>(true);
  const [taskError, setTaskError] = useState<string | null>(null);

  // State variables matching create task page
  const [title, setTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [priority, setPriority] = useState<number>(0); // Default to No Priority
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);

  // Date and time state
  const [date, setDate] = useState<Date>(moment().toDate());
  const [dateEnd, setDateEnd] = useState<Date>(moment().toDate());
  const [time, setTime] = useState<Date>(roundTimeToNextHour(moment()).toDate());
  const [timeEnd, setTimeEnd] = useState<Date>(roundTimeToNextHour(moment()).add(1, 'hour').toDate());
  const [isAllDayActive, setIsAllDayActive] = useState<boolean>(false);

  // Modal states
  const [showReminderSelectionModal, setShowReminderSelectionModal] = useState<boolean>(false);
  const [showFrequencySelectionModal, setShowFrequencySelectionModal] = useState<boolean>(false);
  const [showHiveSelectionModal, setShowHiveSelectionModal] = useState<boolean>(false);
  const [showFamilyMemberSelectionModal, setShowFamilyMemberSelectionModal] = useState<boolean>(false);
const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Localized items for Reminder and Frequency, while preserving English values for API mapping
  const reminderItems = REMINDER_OPTIONS.map((opt) => i18n.t(opt));
  const reminderDisplayToValue: Record<string, string> = {};
  REMINDER_OPTIONS.forEach((opt) => {
    reminderDisplayToValue[i18n.t(opt)] = opt;
  });

  const frequencyItems = RECURRING_FREQUENCY_ITEMS.map((opt) => i18n.t(opt));
  const frequencyDisplayToValue: Record<string, string> = {};
  RECURRING_FREQUENCY_ITEMS.forEach((opt) => {
    frequencyDisplayToValue[i18n.t(opt)] = opt;
  });

  // Selection states
  const [reminder, setReminder] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  // Privacy and assignment states
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState<boolean>(false);
  const [hideFromPeople, setHideFromPeople] = useState<any[]>([]);
  const [selectedHive, setSelectedHive] = useState<any>(null);
  const [selectedHives, setSelectedHives] = useState<any[]>([]);
  const [personInvolved] = useState<any>(null);

  // Family member assignment states
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<FamilyMember[]>([]);
  const [, setIsLoadingFamilyMembers] = useState<boolean>(false);





  // Function to populate form fields with task data
  const populateTaskData = useCallback(async (task: ITTask) => {
    setOriginalTask(task);
    // Use the new API field names
    setTitle((task as any).title || task.Title || '');
    setNote((task as any).text || task.Text || '');
    setPriority((task as any).priority || task.Priority || 0); // Default to None (0)

    // Extract local start/end datetimes from deadline fields (maintain UTC conversion logic)
    const startStr = (task as any).deadlineDateTime || (task as any).Deadline_DateTime;
    const endStr = (task as any).deadlineDateTimeEnd || (task as any).Deadline_DateTime_End;

    const startLocal = startStr ? moment.utc(startStr).local() : null;
    const endLocal = endStr ? moment.utc(endStr).local() : null;

    // Choose a base date for the UI (prefer start; fall back to end; else today)
    const base = startLocal || endLocal || moment();
    setDate(base.toDate());

    // Set end date from endLocal if available, otherwise use start date
    const endBase = endLocal || startLocal || moment();
    setDateEnd(endBase.toDate());

    // Determine all-day using new API boolean field when available; otherwise fallback to scheduled boundary times
    const scheduledStart = (task as any).scheduledTime || (task as any).Scheduled_Time;
    const scheduledEnd = (task as any).scheduledTimeEnd || (task as any).Scheduled_Time_End;
    const rawIsAllDay = (task as any).isAllDay ?? (task as any).IsAllDay;
    const hasIsAllDay = typeof rawIsAllDay === 'boolean';
    const derivedIsAllDay = hasIsAllDay ? (rawIsAllDay as boolean) : (scheduledStart === '00:00' && scheduledEnd === '23:59');
    setIsAllDayActive(derivedIsAllDay);

    // Set time pickers from deadline times; if all-day, snap to day start/end
    if (startLocal) {
      setTime(derivedIsAllDay ? startLocal.clone().startOf('day').toDate() : startLocal.toDate());
    } else {
      setTime(base.toDate());
    }

    if (endLocal) {
      setTimeEnd(derivedIsAllDay ? endLocal.clone().endOf('day').toDate() : endLocal.toDate());
    } else {
      const fallbackEnd = base.clone().add(1, 'hour');
      setTimeEnd(fallbackEnd.toDate());
    }

    // Function to load hive selection from task data
    const loadHiveSelection = async (task: ITTask) => {
      try {
        // Use the correct field for tile ID (homeMembers now contains user IDs, not tile IDs)
        const tileId = (task as any).tileId || (task as any).Tile_uniqueId;
        console.log('🔍 EditTask: Loading hive selection for tileId:', tileId);

        if (tileId && user?.accountId) {
          // Load the tile data
          try {
            const tile = await tileService.getTileById(tileId, user.accountId, user.id);
            if (tile) {
              console.log('🔍 EditTask: Successfully loaded tile:', tile.Name);
              const hiveObject = {
                UniqueId: tile.UniqueId,
                id: tile.UniqueId,
                Name: tile.Name,
                Type: tile.Type
              };
              setSelectedHive(hiveObject);
              setSelectedHives([hiveObject]);
            } else {
              console.log('🔍 EditTask: No tile data found for tileId:', tileId);
            }
          } catch (error) {
            console.error('🔍 EditTask: Error fetching tile:', error);
          }
        } else {
          console.log('🔍 EditTask: No tileId found in task data');
          setSelectedHive(null);
          setSelectedHives([]);
        }
      } catch (error) {
        console.error('Error loading hive selection:', error);
      }
    };

    // Load hive selection from task data
    await loadHiveSelection(task);

    // Load family member assignments from task data (use delegateUserId for tasks)
    const loadFamilyMemberAssignments = async (task: ITTask) => {
      try {
        setIsLoadingFamilyMembers(true);

        const existingDelegateId = (task as any).delegateUserId || (task as any).Delegate_User_uniqueId;
        if (existingDelegateId && user?.accountId && existingDelegateId !== user.id) {
          try {
            const response = await fetch(`/api/users/${existingDelegateId}?accountId=${user.accountId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              },
            });
            if (response.ok) {
              const memberData = await response.json();
              const familyMember: FamilyMember = {
                id: memberData.id || memberData.UniqueId,
                accountId: memberData.accountId || memberData.Account_uniqueId,
                emailAddress: memberData.emailAddress || memberData.EmailAddress,
                firstName: memberData.firstName || memberData.FirstName,
                lastName: memberData.lastName || memberData.LastName,
                displayName: memberData.displayName || memberData.DisplayName || '',
                language: memberData.language || memberData.Language || 0,
                avatarImagePath: memberData.avatarImagePath || memberData.AvatarImagePath || '',
                displayMode: memberData.displayMode || memberData.DisplayMode || 0,
                activeUser: memberData.activeUser ?? memberData.ActiveUser ?? true,
                address: memberData.address || memberData.Address || '',
                streetName: memberData.streetName || memberData.StreetName || '',
                city: memberData.city || memberData.City || '',
                state: memberData.state || memberData.State || '',
                country: memberData.country || memberData.Country || '',
                zipCode: memberData.zipCode || memberData.ZipCode || '',
                birthday: memberData.birthday || memberData.Birthday || '',
                workplace: memberData.workplace || memberData.Workplace || '',
                cellPhoneNumber: memberData.cellPhoneNumber || memberData.Cell_Phone_Number || '',
                homePhoneNumber: memberData.homePhoneNumber || memberData.Home_Phone_Number || '',
                propertySituation: memberData.propertySituation || memberData.PropertySituation || '',
                activeFamily: memberData.activeFamily ?? memberData.ActiveFamily ?? true,
                activeFamilyMember: memberData.activeFamilyMember ?? memberData.ActiveFamilyMember ?? true,
              };
              setSelectedFamilyMembers([familyMember]);
            } else {
              setSelectedFamilyMembers([]);
            }
          } catch (err) {
            console.error('Error fetching delegate user for task:', err);
            setSelectedFamilyMembers([]);
          }
        } else {
          // No delegate on task: ensure empty selection
          setSelectedFamilyMembers([]);
        }
      } catch (error) {
        console.error('Error loading family member assignments:', error);
      } finally {
        setIsLoadingFamilyMembers(false);
      }
    };

    // Load family member assignments from task data
    await loadFamilyMemberAssignments(task);

    // All-day already determined earlier from API field with fallback; no-op here

    // Set privacy settings - use the new API field names
    const hasBlacklistedFamily = (task as any).blacklistedFamily && (task as any).blacklistedFamily.length > 0;
    setIsPrivacyEnabled(hasBlacklistedFamily);
    setHideFromPeople((task as any).blacklistedFamily || task.BlackListed_Family || []);

    // Set reminder based on reminderType (0-10). Prefer mapped field if present
    const rt = (task as any).reminderType ?? (task as any).Reminder_Type;
    if (rt !== undefined && rt !== null) {
      // If explicit None (0), do not show a chip
      if (Number(rt) === 0) setReminder('');
      else setReminder(getReminderStringFromType(Number(rt)));
    } else {
      // Fallbacks when backend omits reminderType
      const tid = (task as any).id || (task as any).UniqueId;

      // 1) Try local cache written on create/update
      const cached = tid ? Number(localStorage.getItem(`task-reminderType:${tid}`) || '') : NaN;
      if (!Number.isNaN(cached)) {
        if (cached === 0) setReminder('');
        else if (cached > 0) setReminder(getReminderStringFromType(cached));
        else {
          // 2) Try tasks store copy (if list API included the field)
          try {
            const storeTask = tasks.find((t: any) => (t?.UniqueId === tid) || (t?.id === tid));
            const storeRt = storeTask ? (storeTask.reminderType ?? storeTask.Reminder_Type) : undefined;
            if (storeRt !== undefined && storeRt !== null) {
              if (Number(storeRt) === 0) setReminder('');
              else setReminder(getReminderStringFromType(Number(storeRt)));
            } else {
              setReminder('');
            }
          } catch {
            setReminder('');
          }
        }
      } else {
        // 2) Try tasks store copy (if list API included the field)
        try {
          const storeTask = tasks.find((t: any) => (t?.UniqueId === tid) || (t?.id === tid));
          const storeRt = storeTask ? (storeTask.reminderType ?? storeTask.Reminder_Type) : undefined;
          if (storeRt !== undefined && storeRt !== null) {
            if (Number(storeRt) === 0) setReminder('');
            else setReminder(getReminderStringFromType(Number(storeRt)));
          } else {
            setReminder('');
          }
        } catch {
          setReminder('');
        }
      }
    }

    // Map frequency only if the task is recurring
    const isRec = (task as any).isRecurring ?? (task as any).Is_Recurring ?? false;
    if (!isRec) {
      setFrequency('');
    } else {
      // Map frequency from task data (supports numeric enum, string, and legacy/mapped fields)
      let uiFrequency: string | null = null;
      const rf = (task as any).reminderFrequency ?? (task as any).Reminder_Frequency;
      if (typeof rf === 'number') {
        uiFrequency = getFrequencyOptionFromValue(rf);
      } else if (typeof rf === 'string') {
        const map: Record<string, string> = { none: 'None', daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-Weekly', 'bi-weekly': 'Bi-Weekly', monthly: 'Monthly', yearly: 'Yearly' };
        uiFrequency = map[(rf as string).toLowerCase()] || null;
      }
      if (!uiFrequency) {
        // Fallback to interval fields (check both API and mapped legacy names)
        const days = (task as any).reminderEachXDays ?? (task as any).Reminder_Each_X_Days;
        const weeks = (task as any).reminderEachXWeeks ?? (task as any).Reminder_Each_X_Weeks;
        const months = (task as any).reminderEachXMonths ?? (task as any).Reminder_Each_X_Months;
        const legacyRecurring = (task as any).recurringFreq ?? (task as any).Recurring_Freq;

        if (weeks === 2) {
          uiFrequency = 'Bi-Weekly';
        } else {
          uiFrequency = getPropertyFrequency(days, weeks, months, legacyRecurring) || null;
        }
      }
      // If resolved to 'None', treat as empty
      if (uiFrequency && uiFrequency !== 'None') setFrequency(uiFrequency);
      else setFrequency('');
    }

    // Set location if available
    if ((task as any).location) {
      setLocation((task as any).location);
    }
  }, [tasks, user?.accountId, user?.id]); // Dependencies for useCallback



  // Load task data on component mount
  useEffect(() => {
    const taskId = params.id as string;

    if (taskId) {
      // Always fetch fresh data from API to ensure we have the latest information
      const fetchTask = async () => {
        try {
          if (user?.accountId) {
            console.log('🔍 EditTask: Fetching fresh task data from API for:', taskId);
            const fetchedTask = await taskService.getTaskById(taskId, user.accountId);
            if (fetchedTask) {
              console.log('🔍 EditTask: Successfully loaded fresh task data:', fetchedTask);
              populateTaskData(fetchedTask);
            } else {
              setTaskError('Task not found');
            }
          } else {
            setTaskError('User account not available');
          }
        } catch (err) {
          console.error('Error fetching task:', err);
          setTaskError('Failed to load task');
        } finally {
          setIsLoadingTask(false);
        }
      };

      fetchTask();
    } else {
      setTaskError('No task ID provided');
      setIsLoadingTask(false);
    }
  }, [params.id, tasks, user?.accountId, populateTaskData]);

  // Handle URL parameters for hive selection (from hive-selection page)
  useEffect(() => {
    const selectedHiveIds = searchParams.get('selectedHiveIds');
    const selectedHiveNames = searchParams.get('selectedHiveNames');
    const fromHiveSelection = searchParams.get('fromHiveSelection');

    if (fromHiveSelection === 'true' && selectedHiveIds && selectedHiveNames) {
      const hiveIds = selectedHiveIds.split(',');
      const hiveNames = selectedHiveNames.split(',');

      // Create hive objects from the URL parameters
      const hiveObjects = hiveIds.map((id, index) => ({
        UniqueId: id,
        Name: hiveNames[index] || 'Unknown Hive',
        Type: 1, // Default type
      }));

      setSelectedHives(hiveObjects);
      if (hiveObjects.length === 1) {
        setSelectedHive(hiveObjects[0]);
      } else if (hiveObjects.length > 1) {
        setSelectedHive(null);
      }

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Handle hive selection from modal (single-select only, just update form state, don't save)
  const handleHiveSelection = (selectedHives: any[], selectedHive?: any) => {
    // For single-select, use the selectedHive parameter
    if (selectedHive) {
      setSelectedHive(selectedHive);
      setSelectedHives([selectedHive]); // Keep array for compatibility but only one item
    } else if (selectedHives.length > 0) {
      setSelectedHive(selectedHives[0]);
      setSelectedHives([selectedHives[0]]); // Only keep the first/latest selection
    } else {
      setSelectedHive(null);
      setSelectedHives([]);
    }
    setShowHiveSelectionModal(false);
  };

  // Handle family member selection
  const handleFamilyMemberSelect = (selectedMembers: FamilyMember[]) => {
    // Filter out the current user since they're always assigned
    // selectedFamilyMembers should only contain additional family members
    const additionalMembers = selectedMembers.filter(member => member.id !== user?.id);
    setSelectedFamilyMembers(additionalMembers);
    setShowFamilyMemberSelectionModal(false);
  };

  const handleUpdateTask = async () => {
    // Enhanced client-side validation matching API reference requirements
    const validationErrors: string[] = [];

    // Validate required fields
    if (!title.trim()) {
      validationErrors.push(i18n.t("TaskTitleRequired") || "Task title is required");
    }

    // Validate title length (1-256 characters as per API reference)
    if (title.trim().length > 256) {
      validationErrors.push(i18n.t("TaskTitleTooLong") || "Task title is too long");
    }

    // Validate user authentication
    if (!user?.id || !user?.accountId) {
      validationErrors.push(i18n.t("UserNotAuthenticated") || "User not authenticated");
    }

    // Validate original task exists
    if (!originalTask?.UniqueId && !(originalTask as any)?.id) {
      validationErrors.push("Original task not found");
    }

    // Show validation errors if any
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    setIsLoading(true);
    setShowLoadingModal(true);
    try {
      const formattedStart = isAllDayActive ? '00:00' : moment(time).format("HH:mm");
      const formattedEnd = isAllDayActive
        ? '23:59'
        : timeEnd
          ? moment(timeEnd).format("HH:mm")
          : moment(formattedStart, "HH:mm").add(30, "minutes").format("HH:mm");

      // Build precise local datetimes for start/end, then convert to UTC
      const startLocal = moment(date).clone().set({
        hour: isAllDayActive ? 0 : moment(time).hour(),
        minute: isAllDayActive ? 0 : moment(time).minute(),
        second: isAllDayActive ? 0 : moment(time).second(),
        millisecond: 0,
      });
      const endLocal = moment(dateEnd).clone().set({
        hour: isAllDayActive ? 23 : (timeEnd ? moment(timeEnd).hour() : moment(time).hour()),
        minute: isAllDayActive ? 59 : (timeEnd ? moment(timeEnd).minute() : moment(time).minute()),
        second: isAllDayActive ? 59 : (timeEnd ? moment(timeEnd).second() : moment(time).second()),
        millisecond: 0,
      });
      const deadlineStartUtc = startLocal.clone().utc().toISOString();
      const deadlineEndUtc = endLocal.clone().utc().toISOString();

      // Calculate duration in seconds using full datetime difference (including date)
      let durationInSeconds: number | undefined;
      if (!isAllDayActive) {
        durationInSeconds = endLocal.diff(startLocal, 'seconds');
      }

      // Prepare people arrays - homeMembers should only contain user IDs, not tile IDs
      // Single-select: if assignee is self, homeMembers is just current user; if delegating, keep just current user
      const selectedAssignee = selectedFamilyMembers[0];
      const homeMembers: string[] = [user!.id];
      let realTileId: string | undefined = undefined;

      // Do not push delegate into homeMembers
      // If selectedAssignee is self, current user already included

      // Use the selected hives from form state (not from task store)
      const selectedHiveIds = selectedHives.map(hive => hive.UniqueId);
      console.log('🔍 Selected hive IDs from form state:', selectedHiveIds);

      // Map synthetic tiles to real tiles for tileId only (not homeMembers)
      if (selectedHiveIds.length > 0) {
        console.log('🔍 Mapping synthetic tiles to real tiles...');
        const realHiveIds = await mapSyntheticTilesToRealTiles(selectedHiveIds, user!.id, user!.accountId!);
        console.log('🔍 Mapped real hive IDs:', realHiveIds);

        // Set tileId if exactly one hive is selected
        if (realHiveIds.length === 1) {
          realTileId = realHiveIds[0];
          console.log('🔍 Set realTileId:', realTileId);
        }

        // homeMembers should NOT contain tile IDs - only user IDs
        console.log('🔍 Final homeMembers (user IDs only):', homeMembers);
      }

      console.log('Final assignment for save:', { realTileId, homeMembers: homeMembers, selectedFamilyMembers: selectedFamilyMembers.length });

      const blacklistedFamily = isPrivacyEnabled && hideFromPeople.length > 0
        ? hideFromPeople.map(person => person.UniqueId || person.id)
        : undefined;

      const peopleInvolved = personInvolved
        ? [personInvolved.UniqueId || personInvolved.id]
        : undefined;

      // Build task update payload using the helper function
      const taskData = buildTaskPayload({
        // Required fields for update (note: buildTaskPayload doesn't handle 'id', we'll add it separately)
        userId: user!.id,
        accountId: user!.accountId!,
        title: title.trim(),

        // Core task fields
        text: note.trim(),
        priority: priority, // 0=None, 1=Low, 2=Medium, 3=High
        color: '#3B82F6',

        // Association fields
        delegateUserId: (selectedAssignee && selectedAssignee.id) ? selectedAssignee.id : (
          ((originalTask as any)?.delegateUserId || (originalTask as any)?.Delegate_User_uniqueId) ? null : undefined
        ),
        tileId: realTileId, // Only set if it's a real tile, not synthetic
        contactId: undefined, // TODO: Map from form state if needed

        // Date and time fields
        deadlineDateTime: deadlineStartUtc,
        deadlineDateTimeEnd: deadlineEndUtc,
        scheduledTime: isAllDayActive ? undefined : formattedStart,
        scheduledTimeEnd: isAllDayActive ? undefined : formattedEnd,
        isAllDay: isAllDayActive,
        durationInSeconds,

        // Reminder and frequency
        reminderOption: reminder && reminder !== '' ? reminder : undefined,
        frequency: frequency && frequency !== '' && frequency !== 'None' ? getApiFrequency(frequency) : undefined,

        // People and privacy
        homeMembers: homeMembers.length > 0 ? homeMembers : undefined,
        blacklistedFamily,
        peopleInvolved,

        // Status
        active: true,
        deleted: false
      }) as any;

      // Add the required 'id' field for updates (buildTaskPayload doesn't handle this)
      taskData.id = (originalTask as any)?.id || originalTask!.UniqueId!;

      // Persist reminderType locally as a fallback for reads (backend omits it)
      if (typeof taskData.reminderType === 'number') {
        try { localStorage.setItem(`task-reminderType:${taskData.id}`, String(taskData.reminderType)); } catch {}
      } else if (reminder) {
        const rtLocal = getReminderTypeFromString(reminder);
        try { localStorage.setItem(`task-reminderType:${taskData.id}`, String(rtLocal)); } catch {}
      }

      // Add location field (future backend support)
      if (location && location.trim() !== '') {
        taskData.location = location.trim();
      }

      console.log('Updating task with API-compliant data:', taskData);

      const queryParams = user!.accountId ? `?accountId=${user!.accountId}` : '';
      const response = await fetch(`/api/tasks${queryParams}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        try {
          const responseData = await response.json();
          console.log('Task updated successfully:', responseData);

          // Extract the task data from the response
          const updatedTaskData = responseData.task || responseData;

          // Update task in store with fresh data - use the correct ID field
          const taskId = (originalTask as any)?.id || originalTask!.UniqueId;
          const updatedTasks = tasks.map((t) => {
            if ((t as any).id === taskId || t.UniqueId === taskId) {
              // Merge the updated data with existing task, preserving the store format
              return {
                ...t,
                // Update with new API field names
                Title: updatedTaskData.title || t.Title,
                Text: updatedTaskData.text || t.Text,
                Priority: updatedTaskData.priority || t.Priority,
                Tile_uniqueId: updatedTaskData.tileId || t.Tile_uniqueId,
                HomeMembers: updatedTaskData.homeMembers || t.HomeMembers,
                // Keep other existing fields
              };
            }
            return t;
          });
          setTasks(updatedTasks);
          console.log('✅ Task store updated with fresh data');
        } catch (error) {
          console.log('Response parsing failed, but HTTP status is OK:', error);
        }

        // Since the API returned 200 status, treat as successful
        console.log('✅ Task update successful - HTTP 200 received');
        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
          // Preserve mobile and token params if present
          const currentParams = new URLSearchParams(window.location.search);
          const mobile = currentParams.get('mobile');
          const token = currentParams.get('token');
          const urlObj = new URL(returnTo, window.location.origin);
          if (mobile) urlObj.searchParams.set('mobile', mobile);
          if (token) urlObj.searchParams.set('token', token);
          router.push(urlObj.pathname + urlObj.search);
        } else {
          router.back();
        }
        // Analytics: Task Edited and possibly Assigned
        try { trackEvent(AmplitudeEvents.taskEdited, { taskId: (taskData as any).id }); } catch {}
        try {
          const delegate = (selectedFamilyMembers && selectedFamilyMembers[0]) ? selectedFamilyMembers[0] : null;
          if (delegate && delegate.id && delegate.id !== user?.id) {
            trackEvent(AmplitudeEvents.taskAssigned, { taskId: (taskData as any).id, delegateUserId: delegate.id });
          }
        } catch {}
      } else {
        console.error('Failed to update task:', response.status, response.statusText);

        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);

          // Handle specific API error responses
          let errorMessage = i18n.t("SomethingWentWrongTryAgainLater") || "Something went wrong, please try again later";

          if (errorData.error) {
            switch (response.status) {
              case 400:
                if (errorData.error === 'Missing required fields') {
                  errorMessage = i18n.t("MissingRequiredFields") || "Missing required fields";
                } else if (errorData.error === 'Invalid title length') {
                  errorMessage = i18n.t("InvalidTitleLength") || "Invalid title length";
                } else {
                  errorMessage = errorData.details || errorData.error;
                }
                break;
              case 401:
                errorMessage = i18n.t("AuthenticationRequired") || "Authentication required";
                break;
              case 403:
                errorMessage = i18n.t("AccessDenied") || "Access denied";
                break;
              case 404:
                errorMessage = "Task not found";
                break;
              case 429:
                errorMessage = i18n.t("TooManyRequests") || "Too many requests";
                break;
              case 500:
                errorMessage = i18n.t("ServerError") || "Server error";
                break;
              default:
                errorMessage = errorData.details || errorData.error || errorMessage;
            }
          }

          alert(errorMessage);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          alert(i18n.t("UnexpectedError") || "Unexpected error occurred");
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);

      // Handle different types of errors
      let errorMessage = i18n.t("SomethingWentWrongTryAgainLater") || "Something went wrong, please try again later";

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = i18n.t("NetworkError") || "Network error";
      } else if (error instanceof Error) {
        // Log the specific error for debugging but show a user-friendly message
        console.error('Specific error:', error.message);
        if (error.message.includes('JSON')) {
          errorMessage = i18n.t("DataFormatError") || "Data format error";
        }
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
      setShowLoadingModal(false);
    }
  };

  // Early return for loading state
  if (isLoadingTask) {
    return null;
  }

  const handleDelete = async () => {
    if (!originalTask || !user?.id || !user?.accountId) return;

    setIsLoading(true);
    try {
      const deleteRequest: DeleteTaskRequest = {
        id: (originalTask as any)?.id || originalTask.UniqueId || '',
        accountId: user.accountId,
        userId: user.id,
      };

      await taskService.deleteTask(deleteRequest);

      // Update tasks in store
      const updatedTasks = tasks.filter(
        (t) => t.UniqueId !== ((originalTask as any)?.id || originalTask.UniqueId)
      );
      setTasks(updatedTasks);

      // Navigate back
      router.back();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (taskError || !originalTask) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        gap: '20px'
      }}>
        <CustomText style={{
          fontSize: FONT_SIZE_20,
          fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
          color: Colors.RED
        }}>
          {taskError || 'Task not found'}
        </CustomText>
        <Button
          textProps={{
            text: "Go Back",
            fontSize: FONT_SIZE_16,
            color: Colors.WHITE,
            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
          }}
          onButtonClick={() => {
            const returnTo = searchParams.get('returnTo');
            if (returnTo) {
              router.push(returnTo);
            } else {
              router.back();
            }
          }}
          backgroundColor={Colors.BLUE}
          borderProps={{
            width: 1,
            color: Colors.BLUE,
            radius: 8,
          }}
        />
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .edit-task-input::placeholder,
        .edit-task-textarea::placeholder {
          color: var(--primary-electric-40, #AAB5E5) !important;
          text-align: left;
          font-family: Poppins;
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 19px;
          letter-spacing: -0.084px;
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        backgroundColor: Colors.WHITE,
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '20px', // Normal bottom padding
      }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            padding: '20px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={() => {
              const returnTo = searchParams.get('returnTo');
              if (returnTo) {
                router.push(returnTo);
              } else {
                router.back();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}
          >
            <img
              src="/icons/icon-menu-back.svg"
              width={24}
              height={24}
              alt="Back"
              style={{ cursor: 'pointer' }}
            />
          </button>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-0.408px',
              }}
            >
              {i18n.t('Edit')} {i18n.t('Task')}
            </CustomText>
          </div>

          {/* Right actions */}
          <div
            style={{
              position: 'absolute',
              right: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                borderRadius: '4px',
              }}
              title='Delete'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M3 6H5H21'
                  stroke={Colors.RED}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z'
                  stroke={Colors.RED}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Title and Note Input Section */}
        <div style={{
          marginLeft: '24px',
          marginRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Title Field */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
            alignSelf: 'stretch',
          }}>
            <CustomText style={{
              color: 'var(--primary-dark-blue-100, #000E50)',
              fontSize: '12px',
              fontFamily: 'Poppins',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '15px',
            }}>
              {i18n.t('Title') || 'Title'}
            </CustomText>
            <input
              className="edit-task-input"
              style={{
                fontSize: FONT_SIZE_20,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                border: 'none',
                outline: 'none',
                width: '100%',
                borderRadius: '12px',
                background: 'var(--primary-electric-3, #F7F9FF)',
                padding: '12px',
                color: 'var(--primary-electric-100, #2A46BE)',
              }}
              placeholder={i18n.t('AddATitle') || 'Add a title'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description Field */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '8px',
            alignSelf: 'stretch',
          }}>
            <CustomText style={{
              color: 'var(--primary-dark-blue-100, #000E50)',
              fontSize: '12px',
              fontFamily: 'Poppins',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '15px',
            }}>
              {i18n.t('Description') || 'Description'}
            </CustomText>
            <textarea
              className="edit-task-textarea"
              style={{
                fontSize: FONT_SIZE_16,
                fontFamily: FONT_FAMILY_POPPINS_REGULAR,
                height: '100px',
                border: 'none',
                outline: 'none',
                width: '100%',
                borderRadius: '12px',
                background: 'var(--primary-electric-3, #F7F9FF)',
                padding: '12px',
                resize: 'none',
                color: 'var(--primary-electric-100, #2A46BE)',
              }}
              placeholder={i18n.t('AddADescription') || 'Add a description'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {/* Date and Time Selection */}
        <DatetimeRangeInput
          initialStartDate={date}
          initialStartTime={time}
          initialEndTime={timeEnd}
          initialIsAllDay={isAllDayActive}
          onChange={(data) => {
            setDate(data.startDate);
            setDateEnd(data.endDate);
            setTime(data.startTime);
            setTimeEnd(data.endTime);
            setIsAllDayActive(data.isAllDay);
          }}
          className={taskStyles.datetimeRangeContainer}
        />

        {/* Reminder Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          marginLeft: '24px',
          marginRight: '24px',
          paddingTop: '16px',
        }}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-60, #666E96)',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '15px',
          }}>
            {i18n.t('Reminder') || 'Reminder'}
          </CustomText>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            paddingBottom: '16px',
            backgroundColor: Colors.WHITE,
            borderRadius: '8px',
            cursor: 'pointer',
          }} onClick={() => !reminder && setShowReminderSelectionModal(true)}>
            <img
              src="/icon-create-task-reminder.svg"
              alt="reminder"
              style={{
                width: '24px',
                height: '24px'
              }}
            />
            {reminder ? (
              <div style={{
                display: 'flex',
                height: '31px',
                padding: '8px 12px 8px 14px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '39px',
                border: '1px solid var(--primary-electric-100, #2A46BE)',
              }}>
                <CustomText style={{
                  color: 'var(--primary-electric-100, #2A46BE)',
                  textAlign: 'center',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '100%',
                }}>
                  {i18n.t(reminder)}
                </CustomText>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReminder('');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.00004 15.6668C4.042 15.6668 0.833374 12.4582 0.833374 8.50016C0.833374 4.54212 4.042 1.3335 8.00004 1.3335C11.9581 1.3335 15.1667 4.54212 15.1667 8.50016C15.1667 12.4582 11.9581 15.6668 8.00004 15.6668ZM10.4714 6.97158C10.7318 6.71124 10.7318 6.28913 10.4714 6.02878C10.2111 5.76842 9.78904 5.7684 9.52864 6.02874L7.99991 7.55736L6.47143 6.029C6.21107 5.76866 5.78896 5.76868 5.52862 6.02904C5.26828 6.2894 5.26829 6.7115 5.52865 6.97184L7.05704 8.50016L5.52865 10.0285C5.26829 10.2888 5.26828 10.711 5.52862 10.9713C5.78896 11.2316 6.21107 11.2316 6.47143 10.9713L7.99991 9.44296L9.52864 10.9716C9.78904 11.2319 10.2111 11.2319 10.4714 10.9716C10.7318 10.7112 10.7318 10.2891 10.4714 10.0288L8.94277 8.50016L10.4714 6.97158Z" fill="#2A46BE"/>
                </svg>
              </div>
            ) : (
              <CustomText style={{
                flex: 1,
                color: "var(--primary-dark-blue-20, #CCCFDC)",
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: '400',
              }}>
                {i18n.t('AddReminder') || 'Add reminder'}
              </CustomText>
            )}
          </div>
        </div>

        {/* Frequency Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          marginLeft: '24px',
          marginRight: '24px',
        }}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-60, #666E96)',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '15px',
          }}>
            {i18n.t('Frequency') || 'Frequency'}
          </CustomText>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            paddingBottom: '16px',
            backgroundColor: Colors.WHITE,
            borderRadius: '8px',
            cursor: 'pointer',
          }} onClick={() => !frequency && setShowFrequencySelectionModal(true)}>
            <img
              src="/dents/icon-task-frequency.svg"
              alt="frequency"
              style={{
                width: '24px',
                height: '24px'
              }}
            />
            {frequency ? (
              <div style={{
                display: 'flex',
                height: '31px',
                padding: '8px 12px 8px 14px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '39px',
                border: '1px solid var(--primary-electric-100, #2A46BE)',
              }}>
                <CustomText style={{
                  color: 'var(--primary-electric-100, #2A46BE)',
                  textAlign: 'center',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '100%',
                }}>
                  {i18n.t(frequency)}
                </CustomText>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFrequency('');
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.00004 15.6668C4.042 15.6668 0.833374 12.4582 0.833374 8.50016C0.833374 4.54212 4.042 1.3335 8.00004 1.3335C11.9581 1.3335 15.1667 4.54212 15.1667 8.50016C15.1667 12.4582 11.9581 15.6668 8.00004 15.6668ZM10.4714 6.97158C10.7318 6.71124 10.7318 6.28913 10.4714 6.02878C10.2111 5.76842 9.78904 5.7684 9.52864 6.02874L7.99991 7.55736L6.47143 6.029C6.21107 5.76866 5.78896 5.76868 5.52862 6.02904C5.26828 6.2894 5.26829 6.7115 5.52865 6.97184L7.05704 8.50016L5.52865 10.0285C5.26829 10.2888 5.26828 10.711 5.52862 10.9713C5.78896 11.2316 6.21107 11.2316 6.47143 10.9713L7.99991 9.44296L9.52864 10.9716C9.78904 11.2319 10.2111 11.2319 10.4714 10.9716C10.7318 10.7112 10.7318 10.2891 10.4714 10.0288L8.94277 8.50016L10.4714 6.97158Z" fill="#2A46BE"/>
                </svg>
              </div>
            ) : (
              <CustomText style={{
                flex: 1,
                color: "var(--primary-dark-blue-20, #CCCFDC)",
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: '400',
              }}>
                {i18n.t('AddFrequency') || 'Add frequency'}
              </CustomText>
            )}
          </div>
        </div>

        {/* Assign to Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          marginLeft: '24px',
          marginRight: '24px',
        }}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-60, #666E96)',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '15px',
          }}>
            {i18n.t('AssignTo') || 'Assign to'}
          </CustomText>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            paddingBottom: '16px',
            backgroundColor: Colors.WHITE,
            borderRadius: '8px',
            cursor: 'pointer',
          }} onClick={() => !(selectedHive || selectedHives?.length > 0) && setShowHiveSelectionModal(true)}>
            <img
              src="/dents/icon-assign-hive.svg"
              alt="hive"
              style={{
                width: '24px',
                height: '24px'
              }}
            />
            {(selectedHive || selectedHives?.length > 0) ? (
              <div style={{
                display: 'flex',
                height: '31px',
                padding: '8px 12px 8px 14px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                borderRadius: '39px',
                backgroundColor: selectedHive?.color || selectedHives?.[0]?.color || '#2A46BE',
              }}>
                <CustomText style={{
                  color: 'var(--White, #FFF)',
                  textAlign: 'center',
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  fontStyle: 'normal',
                  fontWeight: '500',
                  lineHeight: '100%',
                }}>
                  {selectedHive?.Name || selectedHives?.[0]?.Name}
                </CustomText>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="17"
                  viewBox="0 0 16 17"
                  fill="none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHive(null);
                    setSelectedHives([]);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.00004 15.6668C4.042 15.6668 0.833374 12.4582 0.833374 8.50016C0.833374 4.54212 4.042 1.3335 8.00004 1.3335C11.9581 1.3335 15.1667 4.54212 15.1667 8.50016C15.1667 12.4582 11.9581 15.6668 8.00004 15.6668ZM10.4714 6.97158C10.7318 6.71124 10.7318 6.28913 10.4714 6.02878C10.2111 5.76842 9.78904 5.7684 9.52864 6.02874L7.99991 7.55736L6.47143 6.029C6.21107 5.76866 5.78896 5.76868 5.52862 6.02904C5.26828 6.2894 5.26829 6.7115 5.52865 6.97184L7.05704 8.50016L5.52865 10.0285C5.26829 10.2888 5.26828 10.711 5.52862 10.9713C5.78896 11.2316 6.21107 11.2316 6.47143 10.9713L7.99991 9.44296L9.52864 10.9716C9.78904 11.2319 10.2111 11.2319 10.4714 10.9716C10.7318 10.7112 10.7318 10.2891 10.4714 10.0288L8.94277 8.50016L10.4714 6.97158Z" fill="white"/>
                </svg>
              </div>
            ) : (
              <CustomText style={{
                flex: 1,
                color: "var(--primary-dark-blue-20, #CCCFDC)",
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: '400',
              }}>
                {i18n.t('SelectHive') || 'Select hive'}
              </CustomText>
            )}
          </div>
        </div>



        {/* Location Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          marginLeft: '24px',
          marginRight: '24px',
          paddingBottom: '8px',
        }}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-60, #666E96)',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '15px',
          }}>
            {i18n.t('Location') || 'Location'}
          </CustomText>
          <div
            onClick={() => {
              // Focus the hidden input when clicking the container
              const inputs = document.querySelectorAll('input[type="text"]');
              const locationInput = Array.from(inputs).find(input =>
                (input as HTMLInputElement).value === location
              ) as HTMLInputElement;
              if (locationInput) locationInput.focus();
            }}
            style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            backgroundColor: Colors.WHITE,
            borderRadius: '8px',
            position: 'relative',
            cursor: 'text',
          }}>
            <img
              src="/dents/icon-task-location.svg"
              alt="location"
              style={{
                width: '24px',
                height: '24px'
              }}
            />
            {location ? (
              <CustomText style={{
                flex: 1,
                color: 'var(--primary-electric-100, #2A46BE)',
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: '400',
              }}>
                {location}
              </CustomText>
            ) : (
              <CustomText style={{
                flex: 1,
                color: "var(--primary-dark-blue-20, #CCCFDC)",
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: '400',
              }}>
                {i18n.t('AddLocation') || 'Add location'}
              </CustomText>
            )}
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'transparent',
                fontSize: '16px',
                fontFamily: 'Poppins',
                padding: '8px 0',
                paddingLeft: '36px', // Account for icon width
              }}
            />
          </div>
        </div>

        {/* Priority Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px',
          alignSelf: 'stretch',
          marginLeft: '24px',
          marginRight: '24px',
          paddingTop: '8px',
        }}>
          <CustomText style={{
            color: 'var(--primary-dark-blue-60, #666E96)',
            fontSize: '12px',
            fontFamily: 'Poppins',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '15px',
          }}>
            {i18n.t('Priority')}
          </CustomText>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'stretch',
          }}>
            {/* None Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 0 ? 1 : 0.5,
              }}
              onClick={() => setPriority(0)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M13.3333 10H6.66663" stroke="#666E96" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.99996 18.3337C14.6023 18.3337 18.3333 14.6027 18.3333 10.0003C18.3333 5.39795 14.6023 1.66699 9.99996 1.66699C5.39759 1.66699 1.66663 5.39795 1.66663 10.0003C1.66663 14.6027 5.39759 18.3337 9.99996 18.3337Z" stroke="#666E96" strokeWidth="1.25" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--primary-dark-blue-60, #666E96)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '21px',
                letterSpacing: '-0.408px',
              }}>
                {i18n.t('None')}
              </CustomText>
            </div>

            {/* Low Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 1 ? 1 : 0.5,
              }}
              onClick={() => setPriority(1)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33337 11.667V17.5003" stroke="#6CC47C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#6CC47C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--primary-dark-blue-60, #666E96)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '21px',
                letterSpacing: '-0.408px',
              }}>
                {i18n.t('Low')}
              </CustomText>
            </div>

            {/* Medium Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 2 ? 1 : 0.5,
              }}
              onClick={() => setPriority(2)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33337 11.667V17.5003" stroke="#FFA020" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#FFA020" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--primary-dark-blue-60, #666E96)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '21px',
                letterSpacing: '-0.408px',
              }}>
                {i18n.t('Medium')}
              </CustomText>
            </div>

            {/* High Priority */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                opacity: priority === 3 ? 1 : 0.5,
              }}
              onClick={() => setPriority(3)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3.33337 11.667V17.5003" stroke="#FF6961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9.79804 3.1991C7.04367 1.77488 4.4142 2.83108 3.33337 3.68353V12.3545C4.14146 11.426 6.5657 9.98675 9.79804 11.6581C12.6867 13.1518 15.5037 12.3313 16.6667 11.686V3.34011C14.4247 4.35967 12.0145 4.34516 9.79804 3.1991Z" stroke="#FF6961" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CustomText style={{
                color: 'var(--primary-dark-blue-60, #666E96)',
                fontFamily: 'Poppins',
                fontSize: '14px',
                fontStyle: 'normal',
                fontWeight: '400',
                lineHeight: '21px',
                letterSpacing: '-0.408px',
              }}>
                {i18n.t('High')}
              </CustomText>
            </div>
          </div>
        </div>

        {/* Assign Task Section - Always show since current user is always assigned */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '15px',
          marginLeft: '24px',
          marginRight: '24px',
        }}>
          <CustomText
            style={{
              fontSize: FONT_SIZE_16,
              fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
              color: Colors.BLACK,
              marginBottom: '5px',
            }}
          >
            {`${i18n.t('AssignedTo') || 'Assigned to'} ${selectedFamilyMembers.length + 1} ${(selectedFamilyMembers.length + 1) > 1 ? (i18n.t('Members') || 'members') : (i18n.t('Member') || 'member')}`}

          </CustomText>

            {/* Always show current user as assigned */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              backgroundColor: Colors.LIGHT_BLUE_BACKGROUND,
              borderRadius: '8px',
              border: `1px solid ${Colors.BLUE}`,
              marginBottom: '8px',
            }}>
              {user?.avatarImagePath ? (
                <img
                  src={user.avatarImagePath}
                  alt={`${user.firstName} ${user.lastName}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: Colors.BLUE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CustomText
                    style={{
                      fontSize: 14,
                      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                      color: Colors.WHITE,
                    }}
                  >
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </CustomText>
                </div>
              )}
              <CustomText
                style={{
                  fontSize: 14,
                  fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                  color: Colors.BLACK,
                  flex: 1,
                }}
              >
                {`${user?.firstName || i18n.t('You') || 'You'} ${user?.lastName || ''} (${i18n.t('You') || 'You'})`}
              </CustomText>
            </div>

            {selectedFamilyMembers.map((member) => (
              <div key={member.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                backgroundColor: Colors.LIGHT_BLUE_BACKGROUND,
                borderRadius: '8px',
                border: `1px solid ${Colors.BLUE}`,
              }}>
                {member.avatarImagePath ? (
                  <img
                    src={member.avatarImagePath}
                    alt={`${member.firstName} ${member.lastName}`}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: Colors.BLUE_GREY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                      color: Colors.BLACK,
                    }}
                  >
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                )}
                <CustomText
                  style={{
                    fontSize: FONT_SIZE_16,
                    fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
                    color: Colors.BLUE,
                    flex: 1,
                  }}
                >
                  {`${member.firstName} ${member.lastName}`}
                </CustomText>
                <button
                  onClick={() => {
                    setSelectedFamilyMembers(prev => prev.filter(m => m.id !== member.id));
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke={Colors.RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={Colors.RED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
            <MenuListItem
              content={{
                icon: '/assets/person-with-shadow.svg',
                name: i18n.t("ChangeAssignment") || "Change Assignment",
              }}
              textColor={Colors.BLUE}
              onPress={() => setShowFamilyMemberSelectionModal(true)}
              isFullWidth={true}
            />
        </div>

        {/* Save Button */}
        <div style={{
          padding: '0 24px 20px 24px',
          marginTop: '8px',
        }}>
          <Button
            textProps={{
              text: isLoading ? "Updating..." : (i18n.t("Save") || "Save"),
              fontSize: FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
            }}
            disabled={title.trim().length === 0 || isLoading}
            onButtonClick={handleUpdateTask}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
            style={{
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Modals */}
      <OverlayModal
        onSelect={(display: string) => {
          const value = frequencyDisplayToValue[display] || display;
          setFrequency(value === 'None' ? '' : value);
        }}
        selected={frequency ? i18n.t(frequency) : ''}
        isVisible={showFrequencySelectionModal}
        onRequestClose={() => setShowFrequencySelectionModal(false)}
        headerText={i18n.t("Frequency") || "Frequency"}
        items={frequencyItems}
        actionButtons={[
          {
            buttonWidth: 150,
            textProps: {
              text: i18n.t("Cancel") || "Cancel",
              color: Colors.BLUE,
            },
            backgroundColor: Colors.WHITE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowFrequencySelectionModal(false),
          },
          {
            buttonWidth: 150,
            textProps: {
              text: i18n.t("Confirm") || "Confirm",
              color: Colors.WHITE,
            },
            backgroundColor: Colors.BLUE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowFrequencySelectionModal(false),
          },
        ]}
      />

      <OverlayModal
        selected={reminder ? i18n.t(reminder) : ''}
        onSelect={(display: string) => {
          const value = reminderDisplayToValue[display] || display;
          setReminder(value === 'None' ? '' : value);
        }}
        isVisible={showReminderSelectionModal}
        onRequestClose={() => setShowReminderSelectionModal(false)}
        headerText={i18n.t("Reminder") || "Reminder"}
        items={reminderItems}
        actionButtons={[
          {
            buttonWidth: 150,
            textProps: {
              text: i18n.t("Cancel") || "Cancel",
              color: Colors.BLUE,
            },
            backgroundColor: Colors.WHITE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowReminderSelectionModal(false),
          },
          {
            buttonWidth: 150,
            textProps: {
              text: i18n.t("Confirm") || "Confirm",
              color: Colors.WHITE,
            },
            backgroundColor: Colors.BLUE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowReminderSelectionModal(false),
          },
        ]}
      />

      {/* Loading Modal */}
      <Modal
        isVisible={showLoadingModal}
        onClose={() => {}} // Prevent closing during loading
        showCloseButton={false}
        closeOnBackdropPress={false}
        contentStyle={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <LoadingSpinner size={50} color={Colors.BLUE} />
        <CustomText style={{
          marginTop: '20px',
          fontSize: FONT_SIZE_16,
          color: Colors.BLACK,
          fontFamily: FONT_FAMILY_POPPINS_REGULAR
        }}>
          Updating task...
        </CustomText>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        isVisible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        taskName={title || originalTask?.Title}
      />

      {/* Hive Selection Modal */}
      <HiveSelectionModal
        isVisible={showHiveSelectionModal}
        onClose={() => setShowHiveSelectionModal(false)}
        onHiveSelect={handleHiveSelection}
        multiSelect={false}
        initialSelectedHives={selectedHives}
        initialSelectedHive={selectedHive}
      />

      {/* Family Member Selection Modal */}
      <FamilyMemberSelectionModal
        isVisible={showFamilyMemberSelectionModal}
        onClose={() => setShowFamilyMemberSelectionModal(false)}
        onMemberSelect={(members, member) => {
          setSelectedFamilyMembers(member ? [member] : []);
          try {
            if (member && member.id) {
              const currentTaskId = (originalTask as any)?.id || originalTask?.UniqueId;
              trackEvent(AmplitudeEvents.taskAssigned, { taskId: currentTaskId, delegateUserId: member.id });
            }
          } catch {}
          setShowFamilyMemberSelectionModal(false);
        }}
        multiSelect={false}
        initialSelectedMembers={[]}
        initialSelectedMember={selectedFamilyMembers[0] || {
          id: user?.id || '',
          accountId: user?.accountId || '',
          emailAddress: user?.email || '',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          displayName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          language: 1,
          avatarImagePath: user?.avatarImagePath || '',
          displayMode: 0,
          activeUser: true,
          address: '',
          streetName: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          birthday: '',
          workplace: '',
          cellPhoneNumber: '',
          homePhoneNumber: '',
          propertySituation: '',
          activeFamily: true,
          activeFamilyMember: true,
        }}
      />
    </>
  );
};

/**
 * EditTask Page - The main component that wraps EditTaskContent with AuthGuard
 */
const EditTask: React.FC = () => {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <EditTaskContent />
      </Suspense>
    </AuthGuard>
  );
};

export default EditTask;
