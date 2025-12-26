/**
 * Task Types
 *
 * This file contains types related to tasks in the application.
 * Based on the API Reference Document for Task Creation (June 2025)
 *
 * API Reference: https://node-backend-dev-eeva.vercel.app
 *
 * Key Requirements from API Reference:
 * - Required fields: userId, accountId, title (1-256 characters)
 * - Reminder types: 0-10 (0=None, 6=1 hour before default)
 * - Frequency options: "none", "daily", "weekly", "biweekly", "monthly", "yearly"
 * - Date fields: ISO 8601 format
 * - Time fields: HH:MM format
 * - Weekly recurrence: reminderEachXWeek01-07 for Monday-Sunday
 * - Recurring tasks: useJustInTime=true recommended
 */

/**
 * Task interface matching the API response schema
 * Includes all fields from the API reference document
 */
export interface Task {
  // Required fields
  id: string;
  accountId: string;
  userId: string;
  title: string;

  // Core task fields
  text?: string;
  priority?: number;
  color?: string;

  // Association fields
  delegateUserId?: string;
  tileId?: string;
  eventId?: string;
  contactId?: string;

  // Date and time fields (ISO 8601 format)
  deadlineDateTime?: string;
  deadlineDateTimeEnd?: string;
  scheduledTime?: string;        // HH:MM format
  scheduledTimeEnd?: string;     // HH:MM format
  durationInSeconds?: number;
  isAllDay?: boolean;

  // Reminder fields
  reminderType?: number;         // 0-10 (see API reference)

  // Recurring task fields
  isRecurring?: boolean;
  useJustInTime?: boolean;
  reminderFrequency?: string;    // "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly"
  reminderEachXDays?: number;
  reminderEachXWeeks?: number;
  reminderEachXMonths?: number;
  reminderEndDate?: string;      // ISO 8601 format

  // Weekly day selection (Monday = 01, Sunday = 07)
  reminderEachXWeek01?: boolean; // Monday
  reminderEachXWeek02?: boolean; // Tuesday
  reminderEachXWeek03?: boolean; // Wednesday
  reminderEachXWeek04?: boolean; // Thursday
  reminderEachXWeek05?: boolean; // Friday
  reminderEachXWeek06?: boolean; // Saturday
  reminderEachXWeek07?: boolean; // Sunday

  // Advanced recurring pattern (RRule-based)
  recurringPattern?: object;

  // Status fields
  completed?: boolean;
  active?: boolean;
  deleted?: boolean;

  // Timestamp fields
  creationTimestamp?: string;
  updateTimestamp?: string;

  // People and privacy fields
  homeMembers?: string[];
  blacklistedFamily?: string[];
  peopleInvolved?: string[];
}

/**
 * Tasks response interface
 */
export interface TasksResponse {
  tasks: Task[];
}

/**
 * Task creation request interface
 * Matches the exact API schema from the reference document
 */
export interface CreateTaskRequest {
  // Required fields
  accountId: string;
  userId: string;
  title: string;

  // Core task fields
  text?: string;
  priority?: number;
  color?: string;

  // Association fields
  delegateUserId?: string;
  tileId?: string;
  eventId?: string;
  contactId?: string;

  // Date and time fields (ISO 8601 format)
  deadlineDateTime?: string;
  deadlineDateTimeEnd?: string;
  scheduledTime?: string;        // HH:MM format
  scheduledTimeEnd?: string;     // HH:MM format
  durationInSeconds?: number;
  isAllDay?: boolean;

  // Reminder fields
  reminderType?: number;         // 0-10 (see API reference)

  // Recurring task fields
  isRecurring?: boolean;
  useJustInTime?: boolean;
  reminderFrequency?: string;    // "none" | "daily" | "weekly" | "biweekly" | "monthly" | "yearly"
  reminderEachXDays?: number;
  reminderEachXWeeks?: number;
  reminderEachXMonths?: number;
  reminderEndDate?: string;      // ISO 8601 format

  // Weekly day selection (Monday = 01, Sunday = 07)
  reminderEachXWeek01?: boolean; // Monday
  reminderEachXWeek02?: boolean; // Tuesday
  reminderEachXWeek03?: boolean; // Wednesday
  reminderEachXWeek04?: boolean; // Thursday
  reminderEachXWeek05?: boolean; // Friday
  reminderEachXWeek06?: boolean; // Saturday
  reminderEachXWeek07?: boolean; // Sunday

  // Advanced recurring pattern (RRule-based)
  recurringPattern?: object;

  // Status fields (optional for creation)
  active?: boolean;
  deleted?: boolean;

  // People and privacy fields
  homeMembers?: string[];
  blacklistedFamily?: string[];
  peopleInvolved?: string[];
}

/**
 * Task update request interface
 * Includes all fields that can be updated via the API
 */
export interface UpdateTaskRequest {
  // Required fields for updates
  id: string;
  accountId: string;
  userId: string;

  // Core task fields (all optional for updates)
  title?: string;
  text?: string;
  priority?: number;
  color?: string;

  // Association fields
  delegateUserId?: string;
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

  // Reminder fields
  reminderType?: number;

  // Recurring task fields
  isRecurring?: boolean;
  useJustInTime?: boolean;
  reminderFrequency?: string;
  reminderEachXDays?: number;
  reminderEachXWeeks?: number;
  reminderEachXMonths?: number;
  reminderEndDate?: string;

  // Weekly day selection
  reminderEachXWeek01?: boolean;
  reminderEachXWeek02?: boolean;
  reminderEachXWeek03?: boolean;
  reminderEachXWeek04?: boolean;
  reminderEachXWeek05?: boolean;
  reminderEachXWeek06?: boolean;
  reminderEachXWeek07?: boolean;

  // Advanced recurring pattern
  recurringPattern?: object;

  // Status fields
  completed?: boolean;
  active?: boolean;
  deleted?: boolean;

  // People and privacy fields
  homeMembers?: string[];
  blacklistedFamily?: string[];
  peopleInvolved?: string[];
}

/**
 * Task deletion request interface
 */
export interface DeleteTaskRequest {
  id: string;
  accountId: string;
  userId: string;
}

/**
 * Reminder type constants (0-10) as defined in API reference
 */
export const REMINDER_TYPES = {
  NONE: 0,
  AT_TIME_OF_EVENT: 1,
  FIVE_MINUTES_BEFORE: 2,
  TEN_MINUTES_BEFORE: 3,
  FIFTEEN_MINUTES_BEFORE: 4,
  THIRTY_MINUTES_BEFORE: 5,
  ONE_HOUR_BEFORE: 6,
  TWO_HOURS_BEFORE: 7,
  ONE_DAY_BEFORE: 8,
  TWO_DAYS_BEFORE: 9,
  ONE_WEEK_BEFORE: 10
} as const;

/**
 * Frequency options as defined in API reference
 */
export const FREQUENCY_OPTIONS = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const;

/**
 * Type for reminder frequency values
 */
export type ReminderFrequency = typeof FREQUENCY_OPTIONS[keyof typeof FREQUENCY_OPTIONS];

/**
 * Type for reminder type values
 */
export type ReminderType = typeof REMINDER_TYPES[keyof typeof REMINDER_TYPES];

/**
 * Default values for task creation as defined in API reference
 */
export const TASK_DEFAULTS = {
  PRIORITY: 1,
  COLOR: '#3B82F6',
  REMINDER_TYPE: REMINDER_TYPES.ONE_HOUR_BEFORE,
  IS_RECURRING: false,
  USE_JUST_IN_TIME: true,
  ACTIVE: true,
  DELETED: false
} as const;

/**
 * Mapper function to convert API Task to ITTask format
 * Updated to handle all new fields from the API reference
 */
export const mapApiTaskToITTask = (task: Task): any => {
  return {
    UniqueId: task.id,
    Account_uniqueId: task.accountId,
    User_uniqueId: task.userId,
    Delegate_User_uniqueId: task.delegateUserId,
    Title: task.title,
    Text: task.text || '',
    Priority: task.priority || 1,
    Color: task.color || '#3B82F6',
    Tile_uniqueId: task.tileId,
    Event_uniqueId: task.eventId,
    contactId: task.contactId,
    Deadline_DateTime: task.deadlineDateTime,
    Deadline_DateTime_End: task.deadlineDateTimeEnd,
    Scheduled_Time: task.scheduledTime || '',
    Scheduled_Time_End: task.scheduledTimeEnd || '',
    Duration_In_Seconds: task.durationInSeconds,
    // All-day flag from new API
    isAllDay: task.isAllDay,
    IsAllDay: task.isAllDay, // legacy alias for UI code that checks both
    // Do not default reminder type on read; preserve undefined so UI can use cache or show correct state
    Reminder_Type: task.reminderType,
    Is_Recurring: task.isRecurring || false,
    Use_Just_In_Time: task.useJustInTime || false,
    Reminder_Frequency: task.reminderFrequency || FREQUENCY_OPTIONS.NONE,
    Reminder_Each_X_Days: task.reminderEachXDays || 0,
    Reminder_Each_X_Weeks: task.reminderEachXWeeks || 0,
    Reminder_Each_X_Months: task.reminderEachXMonths || 0,
    Reminder_End_Date: task.reminderEndDate,
    Reminder_Each_X_Week_01: task.reminderEachXWeek01 || false,
    Reminder_Each_X_Week_02: task.reminderEachXWeek02 || false,
    Reminder_Each_X_Week_03: task.reminderEachXWeek03 || false,
    Reminder_Each_X_Week_04: task.reminderEachXWeek04 || false,
    Reminder_Each_X_Week_05: task.reminderEachXWeek05 || false,
    Reminder_Each_X_Week_06: task.reminderEachXWeek06 || false,
    Reminder_Each_X_Week_07: task.reminderEachXWeek07 || false,
    Recurring_Pattern: task.recurringPattern,
    Active: task.active !== false, // Default to true
    Deleted: task.deleted || false,
    CreationTimestamp: task.creationTimestamp,
    UpdateTimestamp: task.updateTimestamp,
    HomeMembers: task.homeMembers || [],
    BlackListed_Family: task.blacklistedFamily || [],
    People_Involved: task.peopleInvolved || [],
    completed: task.completed || false, // Preserve the completed field
    state: task.completed ? 1 : 0, // Convert to TASK_STATE enum
    RecurringFreq: 0 // Legacy field for backward compatibility
  };
};
