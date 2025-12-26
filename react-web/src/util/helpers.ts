import React from 'react';
import { INestedTile, User } from "./types";


interface IContact {
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  Email?: string;
}

/**
 * Gets the initials from a user's first and last name
 * @param item User or Contact object with FirstName, LastName, and EmailAddress properties
 * @returns The initials as a string
 */
export const getInitials = (item: Partial<User> | IContact) => {
  const { FirstName, LastName, Email, EmailAddress } = item as IContact;
  const email = Email || EmailAddress;

  if (FirstName && LastName) {
    return `${FirstName.charAt(0).toUpperCase()}${LastName.charAt(0).toUpperCase()}`;
  } else if (FirstName) {
    return FirstName.charAt(0).toUpperCase();
  } else if (LastName) {
    return LastName.charAt(0).toUpperCase();
  } else if (email) {
    return email.charAt(0).toUpperCase();
  }

  return "";
};

/**
 * Find a tile by its unique ID in a nested tile structure
 * @param tiles - Array of nested tiles to search through
 * @param uniqueId - The unique ID to find
 * @returns The found tile or undefined
 */
export const findTileByUniqueId = (
  tiles: INestedTile[],
  uniqueId: string
): INestedTile | undefined => {
  for (const tile of tiles) {
    if (tile.UniqueId === uniqueId) {
      return tile;
    }

    if (tile.children && tile.children.length > 0) {
      const foundInChildren = findTileByUniqueId(tile.children, uniqueId);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  return undefined;
};

/**
 * Display a snackbar notification
 * @param options - The snackbar options
 */
export const emitSnackbar = (
  options: {
    message: React.ReactNode;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
  } | string
) => {
  // Create a custom event
  let detail;

  if (typeof options === 'string') {
    detail = {
      message: options,
      type: 'info',
      duration: 3000,
    };
  } else {
    detail = {
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 3000,
    };
  }

  const event = new CustomEvent('snackbar', { detail });

  // Dispatch the event
  document.dispatchEvent(event);
};

/**
 * Get matching files for a specific entity
 * @param fileRefs - Array of file references to search through
 * @param propertyName - The property name to match on
 * @param files - Array of files to match with
 * @param entityId - The entity ID to match
 * @returns Array of matching files with details
 */
export const getMatchingFiles = (
  fileRefs: any[],
  propertyName: string,
  files: any[],
  entityId?: string
): any[] => {
  if (!fileRefs || !files || !entityId) return [];

  // Filter file references by the property name and entity ID
  const matchingFileRefs = fileRefs.filter((fileRef) => fileRef[propertyName] === entityId);

  // Map the matching file references to their corresponding files
  return matchingFileRefs.map((fileRef) => {
    const matchedFile = files.find((file) => file.UniqueId === fileRef.File_UniqueId);
    return {
      ...fileRef,
      ...matchedFile,
      Filename: matchedFile?.Filename || fileRef.Filename || 'Unnamed File',
      FileURL: matchedFile?.FileURL || fileRef.FileURL || '',
    };
  });
};

/**
 * Encode a URI component safely
 * @param str - The string to encode
 * @returns Encoded string
 */
export const uriEncode = (str: string): string => {
  if (!str) return '';
  return encodeURIComponent(str);
};

/**
 * Decode a URI component safely
 * @param str - The string to decode
 * @returns Decoded string
 */
export const uriDecode = (str: string): any => {
  if (!str) return '';
  try {
    return JSON.parse(decodeURIComponent(str));
  } catch {
    return str;
  }
};

// API request types
interface GetActivitiesByAccountRequest {
  Account_uniqueId: string;
  CurrentUserDateTime: string;
}

interface GetActivitiesByAccountResponse {
  // Define the response structure based on your API
  [key: string]: any;
}

/**
 * Fetch activities by account
 * @param req - Request parameters
 * @returns Promise with activities data
 */
export const getActivitiesByAccount = async (
  req: GetActivitiesByAccountRequest
): Promise<GetActivitiesByAccountResponse> => {
  // For now, return empty array - we'll implement real API call later
  console.log('getActivitiesByAccount called with:', req);
  return [];
};

/**
 * Generate task frequency properties matching the API reference document
 *
 * API Reference: Task Creation Examples (June 2025)
 * Endpoint: POST /tasks
 *
 * Frequency Mapping (API Reference Table):
 * - "none": No recurrence (one-time task)
 * - "daily": Repeats every day or every X days (reminderEachXDays)
 * - "weekly": Repeats every week or every X weeks (reminderEachXWeeks)
 * - "biweekly": Repeats every two weeks
 * - "monthly": Repeats every month or every X months (reminderEachXMonths)
 * - "yearly": Repeats every year
 *
 * Weekly Day Selection (API Reference):
 * - reminderEachXWeek01: Monday
 * - reminderEachXWeek02: Tuesday
 * - reminderEachXWeek03: Wednesday
 * - reminderEachXWeek04: Thursday
 * - reminderEachXWeek05: Friday
 * - reminderEachXWeek06: Saturday
 * - reminderEachXWeek07: Sunday
 *
 * @param frequency - The frequency string ("daily", "weekly", "monthly", etc.)
 * @param customInterval - Custom interval for the frequency (e.g., every 2 weeks)
 * @param endDate - Optional end date for recurring tasks (ISO 8601 string)
 * @param weeklyDays - Array of day numbers for weekly recurrence (1=Monday, 7=Sunday)
 * @returns Object with frequency properties matching API schema
 */
export const setTaskFrequencyProperties = (
  frequency: string,
  customInterval: number = 1,
  endDate?: string,
  weeklyDays?: number[]
) => {
  const baseProperties = {
    isRecurring: false,
    useJustInTime: true,
    reminderFrequency: 'none' as const,
    reminderEachXDays: 0,
    reminderEachXWeeks: 0,
    reminderEachXMonths: 0,
    reminderEndDate: endDate,
    // Weekly day selection (Monday = 01, Sunday = 07)
    reminderEachXWeek01: false,
    reminderEachXWeek02: false,
    reminderEachXWeek03: false,
    reminderEachXWeek04: false,
    reminderEachXWeek05: false,
    reminderEachXWeek06: false,
    reminderEachXWeek07: false,
  };

  if (!frequency || frequency === 'None' || frequency === 'none') {
    return baseProperties;
  }

  // Set recurring to true for all non-none frequencies
  baseProperties.isRecurring = true;

  switch (frequency.toLowerCase()) {
    case 'daily':
      return {
        ...baseProperties,
        reminderFrequency: 'daily' as const,
        reminderEachXDays: customInterval,
      };

    case 'weekly':
      const weeklyProps = {
        ...baseProperties,
        reminderFrequency: 'weekly' as const,
        reminderEachXWeeks: customInterval,
      };

      // Set specific days if provided
      if (weeklyDays && weeklyDays.length > 0) {
        weeklyDays.forEach(day => {
          if (day >= 1 && day <= 7) {
            const dayKey = `reminderEachXWeek${day.toString().padStart(2, '0')}` as keyof typeof weeklyProps;
            (weeklyProps as any)[dayKey] = true;
          }
        });
      }

      return weeklyProps;

    case 'bi-weekly':
    case 'biweekly':
      return {
        ...baseProperties,
        reminderFrequency: 'biweekly' as const,
        reminderEachXWeeks: 2, // Bi-weekly is every 2 weeks
      };

    case 'monthly':
      return {
        ...baseProperties,
        reminderFrequency: 'monthly' as const,
        reminderEachXMonths: customInterval,
      };

    case 'yearly':
      return {
        ...baseProperties,
        reminderFrequency: 'yearly' as const,
        reminderEachXMonths: 12 * customInterval, // Yearly in terms of months
      };

    default:
      return baseProperties;
  }
};

/**
 * Convert reminder option string to API reminder type number
 *
 * API Reference: Reminder Types Table (June 2025)
 *
 * Reminder Type Mapping:
 * 0 = None (no reminder)
 * 1 = At time of event
 * 2 = 5 minutes before
 * 3 = 10 minutes before
 * 4 = 15 minutes before
 * 5 = 30 minutes before
 * 6 = 1 hour before (default)
 * 7 = 2 hours before
 * 8 = 1 day before
 * 9 = 2 days before
 * 10 = 1 week before
 *
 * Note: If not specified, the default value is 6 (1 hour before)
 *
 * @param reminderOption - The reminder option string
 * @returns Number representing the reminder type (0-10)
 */
export const getReminderTypeFromString = (reminderOption: string): number => {
  switch (reminderOption) {
    case "None": return 0;
    case "At time of event": return 1;
    case "5 minutes before": return 2;
    case "10 minutes before": return 3;
    case "15 minutes before": return 4;
    case "30 minutes before": return 5;
    case "1 hour before": return 6;
    case "2 hours before": return 7;
    case "1 day before": return 8;
    case "2 days before": return 9;
    case "1 week before": return 10;
    default: return 6; // Default to 1 hour before as per API reference
  }
};

/**
 * Convert API reminder type number to string
 * @param reminderType - The reminder type number (0-10)
 * @returns String representation of the reminder type
 */
export const getReminderStringFromType = (reminderType: number): string => {
  switch (reminderType) {
    case 0: return "None";
    case 1: return "At time of event";
    case 2: return "5 minutes before";
    case 3: return "10 minutes before";
    case 4: return "15 minutes before";
    case 5: return "30 minutes before";
    case 6: return "1 hour before";
    case 7: return "2 hours before";
    case 8: return "1 day before";
    case 9: return "2 days before";
    case 10: return "1 week before";
    default: return "1 hour before";
  }
};

/**
 * Build a complete task payload matching the API reference document
 *
 * API Reference: Task Creation Examples (June 2025)
 * Endpoint: POST /tasks
 *
 * This function generates task payloads that exactly match the examples in the API reference:
 *
 * 1. Regular Task (One-time):
 *    - Required: userId, accountId, title
 *    - Optional: text, priority, color, deadlineDateTime, reminderType
 *
 * 2. Recurring Task:
 *    - Additional: isRecurring=true, useJustInTime=true, reminderFrequency
 *    - Frequency fields: reminderEachXDays/Weeks/Months
 *    - Optional: reminderEndDate
 *
 * 3. Task with Delegates and People:
 *    - Additional: delegateUserId, peopleInvolved[]
 *
 * Field Validation:
 * - title: 1-256 characters (enforced by API)
 * - dates: ISO 8601 format
 * - times: HH:MM format
 * - reminderType: 0-10 (default: 6)
 *
 * @param params - Task creation parameters
 * @returns Complete task payload ready for API submission
 */
export const buildTaskPayload = (params: {
  // Required fields
  userId: string;
  accountId: string;
  title: string;

  // Optional core fields
  text?: string;
  priority?: number;
  color?: string;

  // Association fields
  delegateUserId?: string | null;
  tileId?: string;
  eventId?: string;
  contactId?: string;

  // Date and time fields
  deadlineDateTime?: string;
  deadlineDateTimeEnd?: string;
  scheduledTime?: string;
  scheduledTimeEnd?: string;
  durationInSeconds?: number;
  isAllDay?: boolean;

  // Reminder and frequency
  reminderOption?: string;
  frequency?: string;
  customInterval?: number;
  endDate?: string;
  weeklyDays?: number[];

  // People and privacy
  homeMembers?: string[];
  blacklistedFamily?: string[];
  peopleInvolved?: string[];

  // Status
  active?: boolean;
  deleted?: boolean;
}) => {
  const {
    userId,
    accountId,
    title,
    text = '',
    priority = 1,
    color = '#3B82F6',
    delegateUserId,
    tileId,
    eventId,
    contactId,
    deadlineDateTime,
    deadlineDateTimeEnd,
    scheduledTime,
    scheduledTimeEnd,
    durationInSeconds,
    isAllDay,
    reminderOption,
    frequency,
    customInterval = 1,
    endDate,
    weeklyDays,
    homeMembers,
    blacklistedFamily,
    peopleInvolved,
    active = true,
    deleted = false
  } = params;

  // Build base payload with required fields
  const payload: any = {
    userId,
    accountId,
    title: title.trim(),
    text: text.trim(),
    priority,
    color,
    active,
    deleted
  };

  // Add optional association fields
  if (delegateUserId !== undefined) payload.delegateUserId = delegateUserId as any;
  if (tileId) payload.tileId = tileId;
  if (eventId) payload.eventId = eventId;
  if (contactId) payload.contactId = contactId;

  // Add date and time fields
  if (deadlineDateTime) payload.deadlineDateTime = deadlineDateTime;
  if (deadlineDateTimeEnd) payload.deadlineDateTimeEnd = deadlineDateTimeEnd;

  // Handle all-day logic: include isAllDay flag and conditionally include times
  if (typeof isAllDay === 'boolean') {
    payload.isAllDay = isAllDay;
  }
  if (isAllDay) {
    // Do NOT include scheduledTime fields when all-day
  } else {
    if (scheduledTime) payload.scheduledTime = scheduledTime;
    if (scheduledTimeEnd) payload.scheduledTimeEnd = scheduledTimeEnd;
  }
  if (durationInSeconds) payload.durationInSeconds = durationInSeconds;

  // Add reminder type
  if (reminderOption) {
    payload.reminderType = getReminderTypeFromString(reminderOption);
  }

  // Add frequency properties
  if (frequency) {
    const frequencyProps = setTaskFrequencyProperties(frequency, customInterval, endDate, weeklyDays);
    Object.assign(payload, frequencyProps);
  }

  // Add people and privacy fields
  if (homeMembers && homeMembers.length > 0) payload.homeMembers = homeMembers;
  if (blacklistedFamily && blacklistedFamily.length > 0) payload.blacklistedFamily = blacklistedFamily;
  if (peopleInvolved && peopleInvolved.length > 0) payload.peopleInvolved = peopleInvolved;

  return payload;
};

/**
 * Build a complete event payload matching the API reference document
 *
 * API Reference: Event Creation Examples (June 2025)
 * Endpoint: POST /api/events
 *
 * This function generates event payloads that exactly match the new API structure.
 *
 * @param params - Event creation parameters
 * @returns Complete event payload ready for API submission
 */
export const buildEventPayload = (params: {
  // Required fields
  userId: string;
  accountId: string;
  title: string;

  // Optional core fields
  text?: string;
  location?: string;
  priority?: number;
  color?: string;

  // Association fields
  delegateUserId?: string | null;
  tileId?: string;
  titleId?: string;
  taskId?: string;
  contactId?: string;

  // Date and time fields
  deadlineDateTime: string;
  deadlineDateTimeEnd?: string;
  scheduledTime?: string;
  scheduledTimeEnd?: string;
  durationInSeconds?: number;
  isAllDay?: boolean;

  // Reminder and frequency
  reminderOption?: string;
  frequency?: string;
  customInterval?: number;
  endDate?: string;
  weeklyDays?: number[];

  // People and privacy
  homeMembers?: string[];
  blacklistedFamily?: string[];
  peopleInvolved?: string[];

  // Calendar integration
  importCalendarId?: string;
  importEventId?: string;
  recurringPattern?: string;
  useJustInTime?: boolean;
}) => {
  const {
    userId,
    accountId,
    title,
    text = '',
    location = '',
    priority = 1,
    color = '#C3B7FF',
    delegateUserId,
    tileId,
    titleId,
    taskId,
    contactId,
    deadlineDateTime,
    deadlineDateTimeEnd,
    scheduledTime,
    scheduledTimeEnd,
    durationInSeconds,
    isAllDay,
    reminderOption,
    frequency,
    homeMembers,
    blacklistedFamily,
    peopleInvolved,
    importCalendarId,
    importEventId,
    recurringPattern,
    useJustInTime,
    // Unused parameters (kept for interface compatibility)
    customInterval: _customInterval = 1,
    endDate: _endDate,
    weeklyDays: _weeklyDays
  } = params;

  // Suppress unused variable warnings
  void _customInterval;
  void _endDate;
  void _weeklyDays;

  // Build base payload with required fields
  // Note: active and deleted are not allowed in the API payload per validation error
  const payload: any = {
    userId,
    accountId,
    title: title.trim(),
    text: text.trim(),
    location: location.trim(),
    priority,
    color,
    deadlineDateTime
  };

  // Handle all-day logic: include isAllDay flag and conditionally include times
  if (typeof isAllDay === 'boolean') {
    payload.isAllDay = isAllDay;
  }
  if (isAllDay) {
    // Do NOT include scheduledTime fields when all-day
  } else {
    if (scheduledTime) payload.scheduledTime = scheduledTime;
    if (scheduledTimeEnd) payload.scheduledTimeEnd = scheduledTimeEnd;
  }

  // Debug log to verify location field is included
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('🔍 buildEventPayload - Location field:', location.trim());
    console.log('🔍 buildEventPayload - Full payload:', payload);
  }

  // Add optional association fields
  if (delegateUserId !== undefined) payload.delegateUserId = delegateUserId as any;
  if (tileId) payload.tileId = tileId;
  if (titleId) payload.titleId = titleId;
  if (taskId) payload.taskId = taskId;
  if (contactId) payload.contactId = contactId;

  // Add optional date/time fields
  if (deadlineDateTimeEnd) payload.deadlineDateTimeEnd = deadlineDateTimeEnd;
  if (durationInSeconds) payload.durationInSeconds = durationInSeconds;

  // Add reminder fields
  if (reminderOption) {
    const reminderValue = getReminderValue(reminderOption);
    payload.reminderEachXWeek01 = reminderValue;
    // Add reminderFrequency field for push notifications support
    payload.reminderFrequency = reminderValue;
  }

  // Add frequency properties
  if (frequency) {
    const frequencyProps = setEventFrequencyProperties(frequency, useJustInTime);
    Object.assign(payload, frequencyProps);
  }

  // Add people and privacy fields
  if (homeMembers && homeMembers.length > 0) payload.homeMembers = homeMembers;
  if (blacklistedFamily && blacklistedFamily.length > 0) payload.blacklistedFamily = blacklistedFamily;
  if (peopleInvolved && peopleInvolved.length > 0) payload.peopleInvolved = peopleInvolved;

  // Add calendar integration fields
  if (importCalendarId) payload.importCalendarId = importCalendarId;
  if (importEventId) payload.importEventId = importEventId;
  if (recurringPattern) payload.recurringPattern = recurringPattern;
  // useJustInTime is now handled in frequency properties

  return payload;
};

/**
 * Helper function to detect synthetic tiles (created in hive selection)
 * These tiles don't exist in the database and should not be passed as tileId
 */
export const isSyntheticTile = (tileId: string | undefined): boolean => {
  if (!tileId) return false;
  return tileId.startsWith('appliances-section') ||
         tileId.startsWith('property-info-section') ||
         tileId.startsWith('spaces-section') ||
         tileId.startsWith('utilities-section');
};

/**
 * Map synthetic tile IDs to real tile IDs by looking up actual tiles from the API
 * @param syntheticTileIds Array of tile IDs that may include synthetic ones
 * @param userId User ID for API call
 * @param accountId Account ID for API call
 * @returns Array of real tile IDs
 */
export const mapSyntheticTilesToRealTiles = async (
  syntheticTileIds: string[],
  userId: string,
  accountId: string
): Promise<string[]> => {
  if (!syntheticTileIds.length || !userId || !accountId) {
    return syntheticTileIds;
  }

  try {
    // Fetch all tiles for the user from the user all-data endpoint
    const response = await fetch(`/api/users/all-data/${accountId}/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch user data for tile mapping, using original IDs');
      return syntheticTileIds;
    }

    const userData = await response.json();
    const allTiles = userData.Global_HomeMembers || [];

    // Map synthetic IDs to real IDs
    const mappedIds = syntheticTileIds.map(tileId => {
      if (!isSyntheticTile(tileId)) {
        // Already a real tile ID
        return tileId;
      }

      // Map synthetic tile ID to real tile based on name/type
      const realTile = findRealTileForSynthetic(tileId, allTiles);
      if (realTile) {
        const realTileId = realTile.UniqueId || realTile.id;
        const realTileName = realTile.Name || realTile.name;
        console.log(`Mapped synthetic tile ${tileId} to real tile ${realTileId} (${realTileName})`);
        return realTileId;
      }

      console.warn(`Could not find real tile for synthetic ID: ${tileId}. Returning undefined to avoid UUID validation error.`);
      return undefined; // Return undefined instead of synthetic ID to avoid UUID validation errors
    });

    return mappedIds.filter(id => id); // Remove any undefined/null values
  } catch (error) {
    console.error('Error mapping synthetic tiles to real tiles:', error);
    return []; // Return empty array to avoid UUID validation errors with synthetic IDs
  }
};

/**
 * Find the real tile that corresponds to a synthetic tile ID
 */
const findRealTileForSynthetic = (syntheticId: string, allTiles: any[]): any | null => {
  // All tiles (utilities, property info, etc.) are now real tiles in the database
  // Only section tiles (appliances-section, spaces-section, etc.) remain synthetic

  // Section mappings (these might not have direct tile equivalents)
  if (syntheticId.includes('-section')) {
    const sectionType = syntheticId.split('-')[0];
    const sectionNames = {
      'appliances': 'Appliances',
      'property': 'Property Info',
      'spaces': 'Spaces',
      'utilities': 'Utilities'
    };

    const targetName = sectionNames[sectionType as keyof typeof sectionNames];
    if (targetName) {
      return allTiles.find(tile =>
        tile.Name === targetName ||
        tile.name === targetName
      );
    }
  }

  return null;
};

/**
 * Set event frequency properties for recurring events
 * Updated to use the new simplified recurringFreq field and useJustInTime flag
 *
 * API Reference: Recurring Events (January 2025)
 * The backend now uses a simplified approach with recurringFreq (0-5) and useJustInTime flag
 */
export const setEventFrequencyProperties = (
  frequency: string,
  useJustInTime: boolean = true
) => {
  // Convert frequency string to numeric value
  const getRecurringFreqValue = (option: string): number => {
    switch (option) {
      case "None": return 0;
      case "Daily": return 1;
      case "Weekly": return 2;
      case "Bi-Weekly": return 3;
      case "Monthly": return 4;
      case "Yearly": return 5;
      default: return 0; // Default to None
    }
  };

  const recurringFreq = getRecurringFreqValue(frequency);

  // For the new API, we only need recurringFreq and useJustInTime
  const properties: any = {
    recurringFreq,
  };

  // Add useJustInTime flag for recurring events (not for "None")
  if (recurringFreq > 0) {
    properties.useJustInTime = useJustInTime;
  }

  return properties;
};

/**
 * Get reminder value from reminder option string
 * Maps reminder options to numeric values (0-10)
 */
export const getReminderValue = (reminderOption: string): number => {
  const reminderMap: Record<string, number> = {
    "None": 0,
    "At time of event": 1,
    "5 minutes before": 2,
    "10 minutes before": 3,
    "15 minutes before": 4,
    "30 minutes before": 5,
    "1 hour before": 6,
    "2 hours before": 7,
    "1 day before": 8,
    "2 days before": 9,
    "1 week before": 10,
  };

  return reminderMap[reminderOption] || 0;
};

/**
 * Get the frequency label from recurring frequency value
 * Updated to use the new simplified recurringFreq field
 * @param everyDay - Number of days for daily recurrence (legacy, for backward compatibility)
 * @param everyWeek - Number of weeks for weekly recurrence (legacy, for backward compatibility)
 * @param everyMonth - Number of months for monthly recurrence (legacy, for backward compatibility)
 * @param recurringFreq - Recurring frequency value (0-5)
 * @returns Frequency label string
 */
export const getPropertyFrequency = (
  everyDay: number | undefined | null,
  everyWeek: number | undefined | null,
  everyMonth: number | undefined | null,
  recurringFreq: number | undefined | null
): string => {
  // Convert recurringFreq numeric value to frequency option string
  const getFrequencyOptionFromValue = (value: number): string => {
    switch (value) {
      case 0: return "None";
      case 1: return "Daily";
      case 2: return "Weekly";
      case 3: return "Bi-Weekly";
      case 4: return "Monthly";
      case 5: return "Yearly";
      default: return "None"; // Default to None
    }
  };

  // Use the new recurringFreq field if available
  if (recurringFreq !== undefined && recurringFreq !== null) {
    return getFrequencyOptionFromValue(recurringFreq);
  }

  // Fallback to individual frequency fields for backward compatibility
  if (everyDay === 1) {
    return "Daily";
  } else if (everyWeek === 1) {
    return "Weekly";
  } else if (everyMonth === 1) {
    return "Monthly";
  }

  return "None";
};
