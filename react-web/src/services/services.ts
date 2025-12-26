import { IEEvent, ITTask, INote, IContact, User, EventTime, WeeklyStatsResponse, WeeklyStatsRequest } from './types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { trackEvent, AmplitudeEvents } from './analytics';

// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

/**
 * APIs with includeOnlyThisWeeksItems Filter Support
 *
 * The following APIs now support the `includeOnlyThisWeeksItems` query parameter:
 * - getFiles(accountId, userId, includeOnlyThisWeeksItems) - Filters by creation_timestamp
 * - getNotesByUser(userId, accountId, includeOnlyThisWeeksItems) - Filters by creation_timestamp
 * - getNotesByAccount(userId, accountId, includeOnlyThisWeeksItems) - Filters by creation_timestamp
 * - getEventsByUser(userId, accountId, includeOnlyThisWeeksItems) - Filters by deadline_date_time
 * - getEventsByAccount(userId, accountId, includeOnlyThisWeeksItems) - Filters by deadline_date_time
 * - getTasksByUser(userId, accountId, includeCompleted, includeOnlyThisWeeksItems) - Already supported
 *
 * Usage Guidelines:
 * ✅ Use the filter for: Weekly Stats section, Weekly dashboard views, Current week summaries
 * ❌ Don't use the filter for: Everyone's Stuff section, Full collection browsing, Historical data views
 *
 * Example:
 * // For Weekly Stats (use filter)
 * const weeklyFiles = await getFiles(accountId, userId, true);
 * const weeklyNotes = await getNotesByUser(userId, accountId, true);
 *
 * // For Everyone's Stuff (don't use filter)
 * const allFiles = await getFiles(accountId, userId, false);
 * const allNotes = await getNotesByUser(userId, accountId, false);
 */

// Headers for API requests
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Helper function to map API event response to frontend format
 * Maps backend field names (id, accountId, etc.) to frontend field names (UniqueId, Account_uniqueId, etc.)
 * @param events - Array of events from API response
 * @returns Array of events with mapped field names
 */
const mapEventResponse = (events: any[]): IEEvent[] => {

  return events.map((event: any, index: number) => {
    // Keep ALL original API fields, just add missing compatibility fields
    const mapped = {
      ...event,
      UniqueId: event.id,
      Account_uniqueId: event.accountId,
      User_uniqueId: event.userId,
      Title: event.title,
      Text: event.text,
      Deadline_DateTime: event.deadlineDateTime,
      Deadline_DateTime_End: event.deadlineDateTimeEnd,
      Scheduled_Time: event.scheduledTime,
      Scheduled_Time_End: event.scheduledTimeEnd,
      Priority: event.priority,
      Color: event.color,
      HomeMembers: event.homeMembers || [],
      People_Involved: event.peopleInvolved || [],
      // Ensure completion status is available to the UI/store
      completed: event.completed ?? false,
      // All-day flags from API
      isAllDay: event.isAllDay,
      IsAllDay: event.isAllDay,
    };


    return mapped;
  });
};

/**
 * Helper function to map API task response to frontend format
 * Maps backend field names to React Web format (no React Native compatibility needed)
 * @param tasks - Array of tasks from API response
 * @returns Array of tasks with mapped field names
 */
const mapTaskResponse = (tasks: any[]): ITTask[] => {
  return tasks.map((apiTask: any) => ({
    UniqueId: apiTask.id,
    CreationTimestamp: apiTask.creationTimestamp,
    UpdateTimestamp: apiTask.updateTimestamp,
    Active: apiTask.active,
    Deleted: apiTask.deleted,
    completed: apiTask.completed,
    Account_uniqueId: apiTask.accountId,
    User_uniqueId: apiTask.userId,
    DelegateUser_uniqueId: apiTask.delegateUserId,
    Title: apiTask.title,
    Text: apiTask.text,
    Priority: apiTask.priority,
    Color: apiTask.color,
    Tile_uniqueId: apiTask.tileId,
    Event_uniqueId: apiTask.eventId,
    contactId: apiTask.contactId,
    Deadline_DateTime: apiTask.deadlineDateTime,
    Deadline_DateTime_End: apiTask.deadlineDateTimeEnd,
    Scheduled_Time: apiTask.scheduledTime || '',
    Scheduled_Time_End: apiTask.scheduledTimeEnd || '',
    // New all-day field from API
    isAllDay: apiTask.isAllDay,
    IsAllDay: apiTask.isAllDay,
    DurationInSeconds: apiTask.durationInSeconds,
    ReminderEachXMonths: apiTask.reminderEachXMonths,
    ReminderEachXWeeks: apiTask.reminderEachXWeeks,
    ReminderEachXDays: apiTask.reminderEachXDays,
    RecurringFreq: apiTask.recurringFreq,
    ReminderFrequency: apiTask.reminderFrequency,
    ReminderEndDate: apiTask.reminderEndDate,
    IsRecurring: apiTask.isRecurring,
    RruleString: apiTask.rruleString,
    OriginalTaskId: apiTask.originalTaskId,
    UseJustInTime: apiTask.useJustInTime,
    HomeMembers: apiTask.homeMembers || [],
    BlackListed_Family: apiTask.blacklistedFamily || [],
    People_Involved: apiTask.peopleInvolved || []
  }));
};

// Mock API functions for development purposes
// These would be replaced with actual API calls in production

/**
 * Get all events for a user
 * @param userId - The user ID to get events for
 * @param accountId - The account ID (optional)
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of events
 */
export const getEventsByUser = async (
  userId: string,
  accountId?: string,
  includeOnlyThisWeeksItems?: boolean,
  start?: string,
  end?: string,
  pageSize?: number,
  pageIndex?: number
): Promise<IEEvent[]> => {
  try {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[LIFE_TAB_DEBUG] 🌐 API CALL: GET /events/user/' + userId);
    }
    console.log(`Fetching events for user: ${userId}, account: ${accountId}, includeOnlyThisWeeksItems: ${includeOnlyThisWeeksItems}, start: ${start}, end: ${end}`);

    // Debug: Check what's in the JWT token vs what we're sending
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && process.env.NODE_ENV === 'development') {
      try {
        const payload = JSON.parse(atob((token as string).split('.')[1]));
        console.log('JWT token accountId vs requested accountId:', {
          jwtAccountId: payload.account_uniqueid,
          jwtSub: payload.sub,
          jwtEmail: payload.email,
          requestedAccountId: accountId,
          match: payload.account_uniqueid === accountId,
          allJwtFields: Object.keys(payload)
        });
      } catch {
        console.log('Could not decode JWT for debugging');
      }
    }

    let url = `${API_BASE_URL}/events/user/${userId}`;
    const params = new URLSearchParams();

    if (accountId) {
      params.append('accountId', accountId);
    }

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (start) {
      params.append('start', start);
    }
    if (end) {
      params.append('end', end);
    }

    if (pageSize !== undefined) {
      params.append('page_size', String(pageSize));
    }
    if (pageIndex !== undefined) {
      params.append('page_index', String(pageIndex));
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });


    // Handle different response formats
    let eventsArray = [] as any[];

    if (Array.isArray(response.data)) {
      eventsArray = response.data;
      console.log('Found events in direct array format');
    } else if (response.data && Array.isArray(response.data.events)) {
      eventsArray = response.data.events;
      console.log('Found events in response.data.events format');
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      eventsArray = response.data.data;
      console.log('Found events in response.data.data format');
    } else {
      console.warn('Events API response is not in expected format:', response.data);
      console.log('Response keys:', Object.keys(response.data || {}));
      return [];
    }

    if (eventsArray.length === 0) {
      return [];
    }

    const mappedEvents = mapEventResponse(eventsArray);
    console.log(`=== MAPPED ${mappedEvents.length} EVENTS SUCCESSFULLY ===`);
    console.log('=== END EVENTS API TERMINAL DEBUG ===');
    return mappedEvents;
  } catch (error: any) {
    // Only log errors if they're not authentication-related during initial load
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication required for events - this is expected during initial load');
    } else {
      console.error('Error fetching events by user:', error.message);
    }
    return [];
  }
};

/**
 * Get all events for an account
 * @param accountId - The account ID to fetch events for (path param)
 * @param userId - The user ID for authorization (query param)
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of events
 */
export const getEventsByAccount = async (
  accountId: string,
  userId: string,
  includeOnlyThisWeeksItems?: boolean,
  start?: string,
  end?: string,
  pageSize?: number,
  pageIndex?: number
): Promise<IEEvent[]> => {
  try {
    console.log(`Fetching events for account: ${accountId} (auth user: ${userId}), includeOnlyThisWeeksItems: ${includeOnlyThisWeeksItems}, start: ${start}, end: ${end}, page_size: ${pageSize}, page_index: ${pageIndex}`);

    let url = `${API_BASE_URL}/events/account/${accountId}`;
    const params = new URLSearchParams();

    if (userId) {
      params.append('userId', userId);
    }

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (start) {
      params.append('start', start);
    }
    if (end) {
      params.append('end', end);
    }

    if (pageSize !== undefined) {
      params.append('page_size', String(pageSize));
    }
    if (pageIndex !== undefined) {
      params.append('page_index', String(pageIndex));
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`Successfully fetched ${response.data.length} events for account`);
      return mapEventResponse(response.data);
    } else if (response.data && Array.isArray(response.data.events)) {
      console.log(`Successfully fetched ${response.data.events.length} events for account`);
      return mapEventResponse(response.data.events);
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log(`Successfully fetched ${response.data.data.length} events for account`);
      return mapEventResponse(response.data.data);
    } else {
      console.warn('API response is not in expected format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching events by account:', error.message);
    return [];
  }
};

/**
 * Get all tasks for a user
 * @param userId - The user ID to get tasks for
 * @param accountId - The account ID (optional)
 * @param includeCompleted - Whether to include completed tasks (optional)
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of tasks
 */
export const getTasksByUser = async (userId: string, accountId?: string, includeCompleted?: boolean, includeOnlyThisWeeksItems?: boolean): Promise<ITTask[]> => {
  try {
    let url = `${API_BASE_URL}/tasks/user/${userId}`;
    const params = new URLSearchParams();

    if (accountId) {
      params.append('accountId', accountId);
    }

    if (includeCompleted !== undefined) {
      params.append('includeCompleted', includeCompleted.toString());
    }

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      return mapTaskResponse(response.data);
    } else if (response.data && Array.isArray(response.data.tasks)) {
      return mapTaskResponse(response.data.tasks);
    } else {
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching tasks by user:', error.message);
    return [];
  }
};

/**
 * Get all tasks for an account
 * @param userId - The user ID to get tasks for
 * @param accountId - The account ID (optional)
 * @param includeCompleted - Whether to include completed tasks (optional)
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of tasks
 */
export const getTasksByAccount = async (userId: string, accountId?: string, includeCompleted?: boolean, includeOnlyThisWeeksItems?: boolean): Promise<ITTask[]> => {
  try {
    let url = `${API_BASE_URL}/tasks/account/${userId}`;
    const params = new URLSearchParams();

    if (accountId) {
      params.append('accountId', accountId);
    }

    if (includeCompleted !== undefined) {
      params.append('includeCompleted', includeCompleted.toString());
    }

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      return mapTaskResponse(response.data);
    } else if (response.data && Array.isArray(response.data.tasks)) {
      return mapTaskResponse(response.data.tasks);
    } else {
      return [];
    }
  } catch (error: any) {
    // Only log errors if they're not authentication-related during initial load
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication required for tasks - this is expected during initial load');
    } else {
      console.error('Error fetching tasks by account:', error.message);
    }
    return [];
  }
};

/**
 * Get all notes for a user
 * @param userId - The user ID to get notes for
 * @param accountId - The account ID (optional)
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of notes
 */
export const getNotesByUser = async (userId: string, accountId?: string, includeOnlyThisWeeksItems?: boolean): Promise<INote[]> => {
  try {
    let url = `${API_BASE_URL}/notes/user/${userId}`;
    const params = new URLSearchParams();

    if (accountId) {
      params.append('accountId', accountId);
    }

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      // Map response data to React Native format
      return response.data.map((note: any) => ({
        UniqueId: note.id,
        User_uniqueId: note.userId,
        Account_uniqueId: note.accountId,
        Title: note.title,
        Text: note.text,
        Priority: note.priority,
        CreationTimestamp: note.creationTimestamp,
        UpdateTimestamp: note.updateTimestamp,
        Active: note.active,
        Deleted: note.deleted,
        Deadline_DateTime: note.deadlineDateTime,
        Deadline_DateTime_End: note.deadlineDateTimeEnd,
        Scheduled_Time: note.scheduledTime || '',
        Scheduled_Time_End: note.scheduledTimeEnd || '',
        Color: note.color,
        Checklist_Data: note.checklistData,
        HomeMembers: note.homeMembers,
        BlackListed_Family: note.blacklistedFamily,
        People_Involved: note.peopleInvolved,
        Task_uniqueId: note.taskId,
        Event_uniqueId: note.eventId,
        contactId: note.contactId,
        HomeMember_uniqueId: note.tileId,
        RecurringFreq: note.recurringFreq,
        Reminder_Each_X_Months: note.reminderEachXMonths,
        Reminder_Each_X_Weeks: note.reminderEachXWeeks,
        Reminder_Each_X_Days: note.reminderEachXDays,
        delegateUserId: note.delegateUserId,
      }));
    } else {
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching notes by user:', error.message);
    return [];
  }
};

/**
 * Get all notes for an account
 * @param userId - The user ID to get notes for
 * @param accountId - The account ID (optional)
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of notes
 */
export const getNotesByAccount = async (userId: string, accountId?: string, includeOnlyThisWeeksItems?: boolean): Promise<INote[]> => {
  try {
    let url = `${API_BASE_URL}/notes/account/${userId}`;
    const params = new URLSearchParams();

    if (accountId) {
      params.append('accountId', accountId);
    }

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    let notesData: any[] = [];
    if (response.data && Array.isArray(response.data)) {
      notesData = response.data;
    } else if (response.data && Array.isArray(response.data.notes)) {
      notesData = response.data.notes;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      notesData = response.data.data;
    }

    // Map response data to React Native format
    return notesData.map((note: any) => ({
      UniqueId: note.id,
      User_uniqueId: note.userId,
      Account_uniqueId: note.accountId,
      Title: note.title,
      Text: note.text,
      Priority: note.priority,
      CreationTimestamp: note.creationTimestamp,
      UpdateTimestamp: note.updateTimestamp,
      Active: note.active,
      Deleted: note.deleted,
      Deadline_DateTime: note.deadlineDateTime,
      Deadline_DateTime_End: note.deadlineDateTimeEnd,
      Scheduled_Time: note.scheduledTime || '',
      Scheduled_Time_End: note.scheduledTimeEnd || '',
      Color: note.color,
      Checklist_Data: note.checklistData,
      HomeMembers: note.homeMembers,
      BlackListed_Family: note.blacklistedFamily,
      People_Involved: note.peopleInvolved,
      Task_uniqueId: note.taskId,
      Event_uniqueId: note.eventId,
      contactId: note.contactId,
      HomeMember_uniqueId: note.tileId,
      RecurringFreq: note.recurringFreq,
      Reminder_Each_X_Months: note.reminderEachXMonths,
      Reminder_Each_X_Weeks: note.reminderEachXWeeks,
      Reminder_Each_X_Days: note.reminderEachXDays,
      delegateUserId: note.delegateUserId,
    }));
  } catch (error: any) {
    // Only log errors if they're not authentication-related during initial load
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication required for notes - this is expected during initial load');
    } else {
      console.error('Error fetching notes by account:', error.message);
    }
    return [];
  }
};

/**
 * Get all contacts for a user
 * @param userId - The user ID to get contacts for
 * @param accountId - The account ID (optional)
 * @returns Promise resolving to an array of contacts
 */
export const getContactsByUser = async (userId: string, accountId?: string): Promise<IContact[]> => {
  try {
    console.log(`Fetching contacts for user: ${userId}, account: ${accountId}`);

    let url = `${API_BASE_URL}/contacts/user/${userId}`;
    if (accountId) {
      url += `?accountId=${encodeURIComponent(accountId)}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching contacts by user:', error.message);
    return [];
  }
};

/**
 * Create a new note
 * @param noteData - The note data to create
 * @returns Promise resolving to the created note
 */
export const createNote = async (noteData: Partial<INote>): Promise<INote> => {
  try {

    // Map React Native field names to new API field names
    const apiData = {
      userId: noteData.User_uniqueId,
      accountId: noteData.Account_uniqueId,
      title: noteData.Title || '',
      text: noteData.Text || '',
      priority: noteData.Priority || 0,
      deadlineDateTime: noteData.Deadline_DateTime,
      deadlineDateTimeEnd: noteData.Deadline_DateTime_End,
      scheduledTime: noteData.Scheduled_Time,
      scheduledTimeEnd: noteData.Scheduled_Time_End,
      color: noteData.Color,
      checklistData: noteData.Checklist_Data,
      delegateUserId: (noteData as any).delegateUserId,
      homeMembers: noteData.HomeMembers,
      blacklistedFamily: noteData.BlackListed_Family,
      peopleInvolved: noteData.People_Involved,
      taskId: noteData.Task_uniqueId,
      eventId: noteData.Event_uniqueId,
      contactId: noteData.contactId,
      tileId: (noteData as any).tileId || noteData.HomeMember_uniqueId,
      recurringFreq: noteData.RecurringFreq,
      reminderEachXMonths: noteData.Reminder_Each_X_Months,
      reminderEachXWeeks: noteData.Reminder_Each_X_Weeks,
      reminderEachXDays: noteData.Reminder_Each_X_Days,
    };

    // Remove undefined values
    Object.keys(apiData).forEach(key => {
      if (apiData[key as keyof typeof apiData] === undefined) {
        delete apiData[key as keyof typeof apiData];
      }
    });

    const response = await axios.post(`${API_BASE_URL}/notes?accountId=${encodeURIComponent(apiData.accountId || '')}`, apiData, {
      headers: getHeaders()
    });

    console.log('Note created successfully:', response.data);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Full response object:', response);
    console.log('=== END NOTE CREATION DEBUG ===');

    // Extract note data from response (API returns {note: {...}, files: [...]})
    const responseNote = response.data.note || response.data;

    // Map response back to React Native format
    const createdNote: INote = {
      UniqueId: responseNote.id,
      User_uniqueId: responseNote.userId,
      Account_uniqueId: responseNote.accountId,
      Title: responseNote.title,
      Text: responseNote.text,
      Priority: responseNote.priority,
      CreationTimestamp: responseNote.creationTimestamp,
      UpdateTimestamp: responseNote.updateTimestamp,
      Active: responseNote.active,
      Deleted: responseNote.deleted,
      Deadline_DateTime: responseNote.deadlineDateTime,
      Deadline_DateTime_End: responseNote.deadlineDateTimeEnd,
      Scheduled_Time: responseNote.scheduledTime || '',
      Scheduled_Time_End: responseNote.scheduledTimeEnd || '',
      Color: responseNote.color,
      Checklist_Data: responseNote.checklistData,
      HomeMembers: responseNote.homeMembers,
      BlackListed_Family: responseNote.blacklistedFamily,
      People_Involved: responseNote.peopleInvolved,
      Task_uniqueId: responseNote.taskId,
      Event_uniqueId: responseNote.eventId,
      contactId: responseNote.contactId,
      HomeMember_uniqueId: responseNote.tileId,
      RecurringFreq: responseNote.recurringFreq,
      Reminder_Each_X_Months: responseNote.reminderEachXMonths,
      Reminder_Each_X_Weeks: responseNote.reminderEachXWeeks,
      Reminder_Each_X_Days: responseNote.reminderEachXDays,
    };

    try { trackEvent(AmplitudeEvents.noteCreated, { noteId: createdNote.UniqueId, accountId: createdNote.Account_uniqueId, userId: createdNote.User_uniqueId }); } catch {}

    return createdNote;
  } catch (error: any) {
    console.error('Error creating note:', error.message);
    throw error;
  }
};

/**
 * Update an existing note
 * @param noteId - The ID of the note to update
 * @param noteData - The note data to update
 * @returns Promise resolving to the updated note
 */
export const updateNote = async (noteId: string, noteData: Partial<INote>): Promise<INote> => {
  try {
    console.log('Updating note with ID:', noteId, 'and data:', noteData);

    // Map React Native field names to new API field names
    const apiData = {
      userId: noteData.User_uniqueId,
      accountId: noteData.Account_uniqueId,
      title: noteData.Title || '',
      text: noteData.Text || '',
      priority: noteData.Priority || 0,
      deadlineDateTime: noteData.Deadline_DateTime,
      deadlineDateTimeEnd: noteData.Deadline_DateTime_End,
      scheduledTime: noteData.Scheduled_Time,
      scheduledTimeEnd: noteData.Scheduled_Time_End,
      color: noteData.Color,
      checklistData: noteData.Checklist_Data,
      delegateUserId: (noteData as any).delegateUserId,
      homeMembers: noteData.HomeMembers,
      blacklistedFamily: noteData.BlackListed_Family,
      peopleInvolved: noteData.People_Involved,
      taskId: noteData.Task_uniqueId,
      eventId: noteData.Event_uniqueId,
      contactId: noteData.contactId,
      tileId: (noteData as any).tileId || noteData.HomeMember_uniqueId,
      recurringFreq: noteData.RecurringFreq,
      reminderEachXMonths: noteData.Reminder_Each_X_Months,
      reminderEachXWeeks: noteData.Reminder_Each_X_Weeks,
      reminderEachXDays: noteData.Reminder_Each_X_Days,
    };

    // Remove undefined values
    Object.keys(apiData).forEach(key => {
      if (apiData[key as keyof typeof apiData] === undefined) {
        delete apiData[key as keyof typeof apiData];
      }
    });

    const response = await axios.put(`${API_BASE_URL}/notes/${noteId}?accountId=${encodeURIComponent(apiData.accountId || '')}`, apiData, {
      headers: getHeaders()
    });



    // Extract note data from response (API returns {note: {...}, files: [...]})
    const responseNote = response.data.note || response.data;

    // Map response back to React Native format
    const updatedNote: INote = {
      UniqueId: responseNote.id,
      User_uniqueId: responseNote.userId,
      Account_uniqueId: responseNote.accountId,
      Title: responseNote.title,
      Text: responseNote.text,
      Priority: responseNote.priority,
      CreationTimestamp: responseNote.creationTimestamp,
      UpdateTimestamp: responseNote.updateTimestamp,
      Active: responseNote.active,
      Deleted: responseNote.deleted,
      Deadline_DateTime: responseNote.deadlineDateTime,
      Deadline_DateTime_End: responseNote.deadlineDateTimeEnd,
      Scheduled_Time: responseNote.scheduledTime || '',
      Scheduled_Time_End: responseNote.scheduledTimeEnd || '',
      Color: responseNote.color,
      Checklist_Data: responseNote.checklistData,
      HomeMembers: responseNote.homeMembers,
      BlackListed_Family: responseNote.blacklistedFamily,
      People_Involved: responseNote.peopleInvolved,
      Task_uniqueId: responseNote.taskId,
      Event_uniqueId: responseNote.eventId,
      contactId: responseNote.contactId,
      HomeMember_uniqueId: responseNote.tileId,
      RecurringFreq: responseNote.recurringFreq,
      Reminder_Each_X_Months: responseNote.reminderEachXMonths,
      Reminder_Each_X_Weeks: responseNote.reminderEachXWeeks,
      Reminder_Each_X_Days: responseNote.reminderEachXDays,
    };

    try { trackEvent(AmplitudeEvents.noteEdited, { noteId: updatedNote.UniqueId, accountId: updatedNote.Account_uniqueId, userId: updatedNote.User_uniqueId }); } catch {}


    return updatedNote;
  } catch (error: any) {
    console.error('Error updating note:', error.message);
    throw error;
  }
};

/**
 * Delete a note
 * @param noteId - The ID of the note to delete
 * @param userId - The user ID
 * @param accountId - The account ID
 * @returns Promise resolving to success status
 */
export const deleteNote = async (noteId: string, userId: string, accountId: string): Promise<boolean> => {
  try {

    await axios.delete(`${API_BASE_URL}/notes/${noteId}?accountId=${encodeURIComponent(accountId)}&userId=${encodeURIComponent(userId)}`, {
      headers: getHeaders()
    });

    try { trackEvent(AmplitudeEvents.noteDeleted, { noteId, accountId, userId }); } catch {}

    return true;
  } catch (error: any) {
    console.error('Error deleting note:', error.message);
    throw error;
  }
};

/**
 * Get a single note by ID
 * @param noteId - The ID of the note to get
 * @param accountId - The account ID
 * @returns Promise resolving to the note
 */
export const getNoteById = async (noteId: string, accountId: string): Promise<INote | null> => {
  try {
    if (!noteId || !accountId) {
      console.error('getNoteById called with invalid parameters:', { noteId, accountId });
      return null;
    }

    const response = await axios.get(`${API_BASE_URL}/notes/${noteId}?accountId=${encodeURIComponent(accountId)}`, {
      headers: getHeaders()
    });



    // The API returns a NoteResponse object with structure: { note: Note, files?: File[] }
    if (response.data && response.data.note) {
      const noteData = response.data.note;

      // Map response back to React Native format
      const note: INote = {
        UniqueId: noteData.id,
        User_uniqueId: noteData.userId,
        Account_uniqueId: noteData.accountId,
        Title: noteData.title,
        Text: noteData.text,
        Priority: noteData.priority,
        CreationTimestamp: noteData.creationTimestamp,
        UpdateTimestamp: noteData.updateTimestamp,
        Active: noteData.active,
        Deleted: noteData.deleted,
        Deadline_DateTime: noteData.deadlineDateTime,
        Deadline_DateTime_End: noteData.deadlineDateTimeEnd,
        Scheduled_Time: noteData.scheduledTime || '',
        Scheduled_Time_End: noteData.scheduledTimeEnd || '',
        Color: noteData.color,
        Checklist_Data: noteData.checklistData,
        HomeMembers: noteData.homeMembers,
        BlackListed_Family: noteData.blacklistedFamily,
        People_Involved: noteData.peopleInvolved,
        Task_uniqueId: noteData.taskId,
        Event_uniqueId: noteData.eventId,
        contactId: noteData.contactId,
        HomeMember_uniqueId: noteData.tileId,
        RecurringFreq: noteData.recurringFreq,
        Reminder_Each_X_Months: noteData.reminderEachXMonths,
        Reminder_Each_X_Weeks: noteData.reminderEachXWeeks,
        Reminder_Each_X_Days: noteData.reminderEachXDays,
        delegateUserId: noteData.delegateUserId,
      };

      try { trackEvent(AmplitudeEvents.noteViewed, { noteId, accountId }); } catch {}

      return note;
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching note by ID:', error.message);
    return null;
  }
};

/**
 * Get all contacts for an account
 * @param userId - The user ID to get contacts for
 * @param accountId - The account ID (optional)
 * @returns Promise resolving to an array of contacts
 */
export const getContactsByAccount = async (userId: string, accountId?: string): Promise<IContact[]> => {
  try {
    console.log(`Fetching contacts for account via user: ${userId}, account: ${accountId}`);

    let url = `${API_BASE_URL}/contacts/account/${userId}`;
    if (accountId) {
      url += `?accountId=${encodeURIComponent(accountId)}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`Successfully fetched ${response.data.length} contacts for account`);
      return response.data;
    } else {
      console.warn('API response is not in expected format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching contacts by account:', error.message);
    return [];
  }
};

/**
 * Get a specific user by ID
 * @param accountId - The account ID
 * @param userId - The user ID to get
 * @returns Promise resolving to a user object
 */
export const getUserById = async (accountId: string, userId: string): Promise<User | null> => {
  try {
    console.log(`Fetching user: ${userId} for account: ${accountId}`);

    const response = await axios.get(`${API_BASE_URL}/users/all-data/${accountId}/${userId}`, {
      headers: getHeaders()
    });

    if (response.data && response.data.Global_AllUsers && Array.isArray(response.data.Global_AllUsers)) {
      // Find the specific user from the all data response
      const apiUser = response.data.Global_AllUsers.find((user: any) => user.id === userId);

      if (!apiUser) {
        console.warn(`User ${userId} not found in response`);
        return null;
      }

      console.log(`Successfully fetched user ${userId}`);

      // Map the API response to the User interface
      const user: User = {
        UniqueId: apiUser.id,
        Account_uniqueId: apiUser.accountId,
        EmailAddress: apiUser.emailAddress,
        FirstName: apiUser.firstName,
        LastName: apiUser.lastName,
        DisplayName: apiUser.displayName,
        Language: apiUser.language,
        AvatarImagePath: apiUser.avatarImagePath,
        DisplayMode: apiUser.displayMode,
        ActiveUser: apiUser.activeUser,
        Address: apiUser.address,
        StreetName: apiUser.streetName,
        City: apiUser.city,
        State: apiUser.state,
        Country: apiUser.country,
        ZipCode: apiUser.zipCode,
        Birthday: apiUser.birthday,
        Workplace: apiUser.workplace,
        Cell_Phone_Number: apiUser.cellPhoneNumber,
        Home_Phone_Number: apiUser.homePhoneNumber,
        PropertySituation: apiUser.propertySituation,
        Active: apiUser.activeFamily,
        ActiveFamilyMember: apiUser.activeFamilyMember,
        // Set default values for fields not in the new API response
        CreationTimestamp: new Date().toISOString(),
        UpdateTimestamp: new Date().toISOString(),
        Deleted: false,
        // Add missing required properties with default values
        EncryptedPassword: '',
        HouseDetails_Image: '',
        HouseDetails_Data: ''
      };

      return user;
    } else {
      console.warn('API response is not in expected format:', response.data);
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching user by ID:', error.message);
    return null;
  }
};

/**
 * Get all users for an account
 * @param accountId - The account ID to get users for
 * @returns Promise resolving to an array of users
 */
export const getUsersByAccount = async (accountId: string): Promise<User[]> => {
  try {
    const url = `${API_BASE_URL}/users/account/${accountId}/all`;

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      // Map the new API response format to the existing User interface
      const users: User[] = response.data.map((apiUser: any) => ({
          UniqueId: apiUser.id,
          Account_uniqueId: apiUser.accountId,
          EmailAddress: apiUser.emailAddress,
          FirstName: apiUser.firstName,
          LastName: apiUser.lastName,
          DisplayName: apiUser.displayName,
          Language: apiUser.language,
          AvatarImagePath: apiUser.avatarImagePath,
          DisplayMode: apiUser.displayMode,
          ActiveUser: apiUser.activeUser,
          Address: apiUser.address,
          StreetName: apiUser.streetName,
          City: apiUser.city,
          State: apiUser.state,
          Country: apiUser.country,
          ZipCode: apiUser.zipCode,
          Birthday: apiUser.birthday,
          Workplace: apiUser.workplace,
          Cell_Phone_Number: apiUser.cellPhoneNumber,
          Home_Phone_Number: apiUser.homePhoneNumber,
          PropertySituation: apiUser.propertySituation,
          Active: apiUser.activeFamily,
          ActiveFamilyMember: apiUser.activeFamilyMember,
          // Set default values for fields not in the new API response
          CreationTimestamp: new Date().toISOString(),
          UpdateTimestamp: new Date().toISOString(),
          Deleted: false,
          // Add missing required properties with default values
          EncryptedPassword: '',
          HouseDetails_Image: '',
          HouseDetails_Data: ''
        }));

      return users;
    } else {
      console.warn('API response is not in expected format:', response.data);
      return [];
    }
  } catch (error: any) {
    // Only log errors if they're not authentication-related during initial load
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication required for users - this is expected during initial load');
    } else {
      console.error('Error fetching users by account:', error.message);
    }

    // Return empty array on error to prevent app crashes
    return [];
  }
};

/**
 * Get all tiles for a user
 * @param userId - The user ID to get tiles for
 * @returns Promise resolving to an array of tiles
 */
export const getTilesByUser = async (): Promise<any[]> => {
  // Mock implementation
  return Promise.resolve([]);
};

/**
 * Get all tile files for a user
 * @param params - Parameters for the query
 * @returns Promise resolving to an array of tile files
 */
export const getTileFilesByUser = async (): Promise<any[]> => {
  // Mock implementation
  return Promise.resolve([]);
};

/**
 * Get all member files for a user
 * @param params - Parameters for the query
 * @returns Promise resolving to an array of member files
 */
export const getMemberFilesByUser = async (): Promise<any[]> => {
  // Mock implementation
  return Promise.resolve([]);
};

/**
 * Upload a file
 * @param bucketType - The bucket type to upload to
 * @param file - The file to upload
 * @param fileName - Optional custom file name
 * @param path - Optional path within the bucket
 * @returns Promise resolving to the uploaded file
 */
export const uploadFile = async (
  bucketType: string,
  file: File,
  fileName?: string,
  path?: string
): Promise<any> => {
  // Mock implementation
  return Promise.resolve({
    id: uuidv4(),
    name: fileName || file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    path: path || '',
    bucketType,
  });
};

/**
 * Create a new event
 * @param event - The event to create
 * @returns Promise resolving to the created event
 */
export const createEvent = async (event: Partial<IEEvent>): Promise<IEEvent> => {
  try {
    console.log('Creating new event:', event);

    const response = await axios.post(`${API_BASE_URL}/events`, event, {
      headers: getHeaders()
    });

    if (response.data) {
      console.log('Successfully created event:', response.data);
      // Map the single event response to frontend format
      const mappedEvents = mapEventResponse([response.data]);
      const created = mappedEvents[0];
      try { trackEvent(AmplitudeEvents.eventCreated, { eventId: created.UniqueId, accountId: created.Account_uniqueId, userId: created.User_uniqueId }); } catch {}
      return created;
    } else {
      throw new Error('No data returned from create event API');
    }
  } catch (error: any) {
    console.error('Error creating event:', error.message);
    throw error;
  }
};

/**
 * Update an existing event
 * @param event - The event to update
 * @returns Promise resolving to the updated event
 */
export const updateEvent = async (event: IEEvent): Promise<IEEvent> => {
  try {
    console.log('Updating event:', event);

    const response = await axios.put(`${API_BASE_URL}/events`, event, {
      headers: getHeaders()
    });

    if (response.data) {
      console.log('Successfully updated event:', response.data);
      // Map the single event response to frontend format
      const mappedEvents = mapEventResponse([response.data]);
      const updated = mappedEvents[0];
      try { trackEvent(AmplitudeEvents.eventEdited, { eventId: updated.UniqueId, accountId: updated.Account_uniqueId, userId: updated.User_uniqueId }); } catch {}
      return updated;
    } else {
      throw new Error('No data returned from update event API');
    }
  } catch (error: any) {
    console.error('Error updating event:', error.message);
    throw error;
  }
};

/**
 * Delete an event
 * @param eventId - The ID of the event to delete
 * @param accountId - The account ID
 * @param userId - The user ID
 * @returns Promise resolving to a success message
 */
export const deleteEvent = async (eventId: string, accountId: string, userId: string): Promise<{ success: boolean }> => {
  try {
    const deletePayload = { id: eventId, accountId, userId };

    await axios.delete(`${API_BASE_URL}/events`, {
      headers: getHeaders(),
      data: deletePayload
    });

    try { trackEvent(AmplitudeEvents.eventDeleted, { eventId, accountId, userId }); } catch {}

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event:', error?.message || error);
    throw error;
  }
};

/**
 * Update event completion status
 * @param eventId - The ID of the event to update
 * @param userId - The user ID
 * @param accountId - The account ID
 * @param completed - Whether the event is completed
 * @returns Promise resolving to the updated event or null
 */
export const updateEventCompletionStatus = async (
  eventId: string,
  userId: string,
  accountId: string,
  completed: boolean
): Promise<IEEvent | null> => {
  try {
    if (completed) {
      // Use the specific completion endpoint for marking events as complete
      const requestBody = {
        accountId,
        userId,
        completionDate: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      };

      const response = await axios.put(
        `${API_BASE_URL}/events/${eventId}/complete`,
        requestBody,
        {
          headers: getHeaders()
        }
      );

      if (response.data) {
        // Map the single event response to frontend format
        const mappedEvents = mapEventResponse([response.data]);
        return mappedEvents[0];
      }
      return response.data;
    } else {
      // For marking as incomplete, we need to update the event directly
      // First get the current event data
      const events = await getEventsByAccount(accountId, userId);
      const event = events.find(e => e.UniqueId === eventId);

      if (!event) {
        return null;
      }

      // Check if the event is already incomplete
      if (!event.completed) {
        return event;
      }

      // Update the event with the new completion status
      const updatedEvent = {
        ...event,
        completed: false
      };

      // Send the update to the API
      const response = await axios.put(
        `${API_BASE_URL}/events`,
        updatedEvent,
        {
          headers: getHeaders()
        }
      );

      if (response.data) {
        // Map the single event response to frontend format
        const mappedEvents = mapEventResponse([response.data]);
        return mappedEvents[0];
      }
      return response.data;
    }
  } catch (error: any) {
    console.error('Error updating event completion status:', error.message);
    return null;
  }
};

/**
 * Create a new task
 * @param task - The task to create
 * @returns Promise resolving to the created task
 */
export const createTask = async (task: Partial<ITTask>): Promise<ITTask> => {
  // Mock implementation
  const newTask: ITTask = {
    ...task,
    UniqueId: uuidv4(),
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
  } as ITTask;

  return Promise.resolve(newTask);
};

/**
 * Update an existing task
 * @param task - The task to update
 * @returns Promise resolving to the updated task
 */
export const updateTask = async (task: ITTask): Promise<ITTask> => {
  // Mock implementation
  const updatedTask: ITTask = {
    ...task,
    UpdateTimestamp: new Date().toISOString(),
  };

  return Promise.resolve(updatedTask);
};

/**
 * Delete a task
 * @param taskId - The ID of the task to delete
 * @returns Promise resolving to a success message
 */
export const deleteTask = async (): Promise<{ success: boolean }> => {
  // Mock implementation
  return Promise.resolve({ success: true });
};

/**
 * Get event times for an account
 * @param userId - The user ID to get event times for
 * @param accountId - The account ID (optional)
 * @returns Promise resolving to an array of event times
 */
export const getEventTimesByAccount = async (userId: string, accountId?: string): Promise<EventTime[]> => {
  try {
    console.log('[LIFE_TAB_DEBUG] 🌐 API CALL: GET /event-times/account/' + userId);
    // Get account ID from session storage/cookies if not provided
    let finalAccountId = accountId;
    if (!finalAccountId && typeof window !== 'undefined') {
      // Try localStorage first
      finalAccountId = localStorage.getItem('account_id') || undefined;

      // Try cookies if localStorage doesn't have it
      if (!finalAccountId) {
        const cookies = document.cookie.split(';');
        const accountCookie = cookies.find(cookie => cookie.trim().startsWith('account_id='));
        if (accountCookie) {
          finalAccountId = accountCookie.split('=')[1];
        }
      }
    }



    // If we still don't have an account ID, proceed without it and let the backend handle it
    if (!finalAccountId) {
      console.log('No account ID found in storage, proceeding without it');
      // TODO: Implement session refresh logic here if needed
    }

    let url = `${API_BASE_URL}/event-times/account/${userId}`;
    if (finalAccountId) {
      url += `?accountId=${encodeURIComponent(finalAccountId)}`;
    } else {
      console.warn('No account ID available for event times request');
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });
    console.log('[LIFE_TAB_DEBUG] ✅ API RESPONSE: GET /event-times/account/' + userId + ' - Success');

    if (response.data && response.data.eventTimes) {
      console.log('Successfully fetched event times:', response.data.eventTimes.length);
      // Map backend EventTime format to frontend format
      const mappedEventTimes = response.data.eventTimes.map((et: any) => ({
        UniqueId: et.id,
        Account_uniqueId: et.accountId,
        creationTimestamp: et.creationTimestamp,
        updateTimestamp: et.updateTimestamp,
        active: et.active,
        deleted: et.deleted,
        Event_uniqueId: et.eventId,
        EventTime: et.eventTime,
        Complete: false // Default to incomplete - backend should track this per instance
      }));
      return mappedEventTimes;
    } else {
      console.log('No event times data returned from API');
      return [];
    }
  } catch (error: any) {
    // Only log errors if they're not authentication-related during initial load
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Authentication required for event times - this is expected during initial load');
    } else {
      console.error('Error fetching event times by account:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
    }
    return [];
  }
};

/**
 * Get event times for an event
 * @param eventId - The event ID to get times for
 * @returns Promise resolving to an array of event times
 */
export const getEventTimes = async (): Promise<EventTime[]> => {
  // Mock implementation
  return Promise.resolve([]);
};

/**
 * Create a new file
 * @param file - The file data to create
 * @returns Promise resolving to the created file
 */
export const createFile = async (file: any): Promise<any> => {
  // Mock implementation
  const newFile = {
    ...file,
    UniqueId: uuidv4(),
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
  };

  return Promise.resolve(newFile);
};

/**
 * Create a new member file
 * @param file - The member file data to create
 * @returns Promise resolving to the created member file
 */
export const createMemberFile = async (file: any): Promise<any> => {
  // Mock implementation
  const newFile = {
    ...file,
    UniqueId: uuidv4(),
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
  };

  return Promise.resolve(newFile);
};

/**
 * Create a new tile file
 * @param file - The tile file data to create
 * @returns Promise resolving to the created tile file
 */
export const createTileFile = async (file: any): Promise<any> => {
  // Mock implementation
  const newFile = {
    ...file,
    UniqueId: uuidv4(),
    CreationTimestamp: new Date().toISOString(),
    UpdateTimestamp: new Date().toISOString(),
    Active: true,
    Deleted: false,
  };

  return Promise.resolve(newFile);
};

/**
 * Get all files for a user (using file-users endpoint)
 * @param userId - The user ID to get files for
 * @param accountId - The account ID (optional)
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of files
 */
export const getFilesByUser = async (userId: string, accountId?: string, includeOnlyThisWeeksItems?: boolean): Promise<any[]> => {
  try {


    // Updated per backend guidance: use query param style for user-specific files
    let url = `${API_BASE_URL}/files`;
    const params = new URLSearchParams();

    // Required user filter
    params.append('userId', userId);

    if (accountId) {
      params.append('accountId', accountId);
    }

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.files)) {
      return response.data.files;
    } else {
      console.warn('API response is not in expected format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching files by user:', error.message);
    return [];
  }
};

/**
 * Get all files (using files endpoint with accountId and userId)
 * @param accountId - The account ID
 * @param userId - The user ID
 * @param includeOnlyThisWeeksItems - Whether to include only this week's items (optional)
 * @returns Promise resolving to an array of files
 */
export const getFiles = async (accountId: string, userId: string, includeOnlyThisWeeksItems?: boolean): Promise<any[]> => {
  try {


    // Updated per backend guidance: account-wide files are keyed by accountId in the path
    let url = `${API_BASE_URL}/files/account/${accountId}`;
    const params = new URLSearchParams();

    // Required per backend: userId and includeDeleted=false
    params.append('userId', userId);
    params.append('includeDeleted', 'false');

    if (includeOnlyThisWeeksItems !== undefined) {
      params.append('includeOnlyThisWeeksItems', includeOnlyThisWeeksItems.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.files)) {
      return response.data.files;
    } else {
      console.warn('API response is not in expected format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching files:', error.message);
    return [];
  }
};

/**
 * Get all file-events for an account
 * @param accountId - The account ID
 * @returns Promise resolving to an array of file-events
 */
export const getFileEventsByAccount = async (accountId: string): Promise<any[]> => {
  try {
    console.log(`Fetching file-events for account: ${accountId}`);

    const response = await axios.get(`${API_BASE_URL}/file-events/account/${accountId}`, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`Successfully fetched ${response.data.length} file-events for account`);
      return response.data;
    } else {
      console.warn('API response is not in expected format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching file-events by account:', error.message);
    return [];
  }
};

/**
 * Get all activities for an account
 * @param accountId - The account ID
 * @param currentUserDateTime - Current user date time (optional)
 * @param numberOfActivities - Number of activities to fetch (optional, default 40)
 * @returns Promise resolving to an array of activities
 */
export const getActivitiesByAccount = async (
  accountId: string,
  currentUserDateTime?: string,
  numberOfActivities: number = 40
): Promise<any[]> => {
  try {
    console.log(`Fetching activities for account: ${accountId}, dateTime: ${currentUserDateTime}, limit: ${numberOfActivities}`);

    let url = `${API_BASE_URL}/activities/account?accountId=${encodeURIComponent(accountId)}`;

    if (currentUserDateTime) {
      url += `&CurrentUserDateTime=${encodeURIComponent(currentUserDateTime)}`;
    }

    url += `&NumberOfActivities=${numberOfActivities}`;

    const response = await axios.get(url, {
      headers: getHeaders()
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`Successfully fetched ${response.data.length} activities for account`);
      return response.data;
    } else if (response.data && Array.isArray(response.data.activities)) {
      console.log(`Successfully fetched ${response.data.activities.length} activities for account`);
      return response.data.activities;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log(`Successfully fetched ${response.data.data.length} activities for account`);
      return response.data.data;
    } else {
      console.warn('API response is not in expected format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching activities by account:', error.message);
    return [];
  }
};

/**
 * Get weekly statistics for an account or specific user
 * @param request - WeeklyStatsRequest containing accountId, optional userId, and includeUserBreakdown flag
 * @returns Promise<WeeklyStatsResponse> - Weekly statistics data
 */
export const getWeeklyStats = async (request: WeeklyStatsRequest): Promise<WeeklyStatsResponse> => {
  try {
    console.log('[LIFE_TAB_DEBUG] 🌐 API CALL: GET /stats/weekly-stats');
    console.log('Fetching weekly stats with request:', request);

    // Build query parameters
    const params = new URLSearchParams({
      accountId: request.accountId,
      includeUserBreakdown: (request.includeUserBreakdown ?? true).toString()
    });

    // Add userId if provided
    if (request.userId) {
      params.append('userId', request.userId);
    }

    // Add includeSampleItems if provided
    if (request.includeSampleItems !== undefined) {
      params.append('includeSampleItems', request.includeSampleItems.toString());
    }

    // Use local API route that properly handles server-side auth forwarding
    const url = `${API_BASE_URL}/stats/weekly-stats?${params.toString()}`;
    console.log('Weekly stats API URL:', url);

    const response = await axios.get(url, {
      headers: getHeaders()
    });
    console.log('[LIFE_TAB_DEBUG] ✅ API RESPONSE: GET /stats/weekly-stats - Success');

    if (response.data) {
      console.log('Successfully fetched weekly stats:', {
        dentsCount: response.data.dentsCount,
        weeklyStats: response.data.weeklyStats,
        userBreakdownsCount: response.data.userBreakdowns?.length || 0
      });

      // Debug log for sample items if includeSampleItems was requested
      if (request.includeSampleItems && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('🔍 [SAMPLE_ITEMS_DEBUG] includeSampleItems=true was requested');

        // Check for sample items in userBreakdowns
        if (response.data.userBreakdowns && response.data.userBreakdowns.length > 0) {
          const firstUser = response.data.userBreakdowns[0];
          console.log('🔍 [SAMPLE_ITEMS_DEBUG] First user breakdown:', firstUser.userName);
          console.log('🔍 [SAMPLE_ITEMS_DEBUG] Sample events:', firstUser.weeklyStats?.sampleEvents?.length || 0);
          console.log('🔍 [SAMPLE_ITEMS_DEBUG] Sample incomplete tasks:', firstUser.weeklyStats?.sampleIncompleteTasks?.length || 0);
          console.log('🔍 [SAMPLE_ITEMS_DEBUG] Sample completed tasks:', firstUser.weeklyStats?.sampleCompletedTasks?.length || 0);
        } else {
          console.log('❌ [SAMPLE_ITEMS_DEBUG] No userBreakdowns found in response');
        }
      }

      return response.data;
    } else {
      console.warn('Weekly stats API response is empty');
      throw new Error('Empty response from weekly stats API');
    }
  } catch (error: any) {
    console.error('Error fetching weekly stats:', error.message);

    // Return default structure on error
    return {
      dentsCount: {
        notes: 0,
        events: 0,
        tasks: 0,
        docs: 0
      },
      weeklyStats: {
        eventsUpcoming: 0,
        tasksIncomplete: 0,
        tasksDueThisWeek: 0,
        tasksCompletedThisWeek: 0,
        notesCreatedThisWeek: 0,
        docsUploadedThisWeek: 0
      },
      userBreakdowns: []
    };
  }
};

// Export DENTS service functions
export * from './dentsService';

// Export DENTS service functions
export * from './dentsService';
