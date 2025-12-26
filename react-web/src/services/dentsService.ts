import { IEEvent, ITTask, INote } from './types';

/**
 * Helper function to map API task response to frontend format
 * Maps backend field names to React Web format
 * @param tasks - Array of tasks from API response
 * @returns Array of tasks with mapped field names
 */
const mapTaskResponse = (tasks: any[]): ITTask[] => {
  if (!Array.isArray(tasks)) return [];

  return tasks.map((apiTask: any) => ({
    UniqueId: apiTask.id,
    CreationTimestamp: apiTask.creationTimestamp,
    UpdateTimestamp: apiTask.updateTimestamp,
    Active: apiTask.active,
    Deleted: apiTask.deleted,
    completed: apiTask.completed,
    Account_uniqueId: apiTask.accountId,
    User_uniqueId: apiTask.userId,
    Delegate_User_uniqueId: apiTask.delegateUserId,
    Title: apiTask.title, // Map lowercase 'title' to uppercase 'Title'
    Text: apiTask.text || '', // Map lowercase 'text' to uppercase 'Text'
    Priority: apiTask.priority,
    Color: apiTask.color,
    Tile_uniqueId: apiTask.tileId,
    Event_uniqueId: apiTask.eventId,
    contactId: apiTask.contactId,
    Deadline_DateTime: apiTask.deadlineDateTime,
    Deadline_DateTime_End: apiTask.deadlineDateTimeEnd,
    Scheduled_Time: apiTask.scheduledTime || '',
    Scheduled_Time_End: apiTask.scheduledTimeEnd || '',
    // All-day flags from API
    isAllDay: apiTask.isAllDay,
    IsAllDay: apiTask.isAllDay,
    Duration_In_Seconds: apiTask.durationInSeconds,
    Reminder_Each_X_Months: apiTask.reminderEachXMonths,
    Reminder_Each_X_Weeks: apiTask.reminderEachXWeeks,
    Reminder_Each_X_Days: apiTask.reminderEachXDays,
    RecurringFreq: apiTask.recurringFreq || 0,
    HomeMembers: apiTask.homeMembers || [],
    BlackListed_Family: apiTask.blacklistedFamily || [],
    People_Involved: apiTask.peopleInvolved || [],
    HomeMember_uniqueId: apiTask.tileId, // For backward compatibility
  }));
};

/**
 * Helper function to map API note response to frontend format
 * Maps backend field names to React Web format
 * @param notes - Array of notes from API response
 * @returns Array of notes with mapped field names
 */
const mapNoteResponse = (notes: any[]): INote[] => {
  if (!Array.isArray(notes)) return [];

  return notes.map((apiNote: any) => ({
    UniqueId: apiNote.id,
    CreationTimestamp: apiNote.creationTimestamp,
    UpdateTimestamp: apiNote.updateTimestamp,
    Active: apiNote.active,
    Deleted: apiNote.deleted,
    Account_uniqueId: apiNote.accountId,
    User_uniqueId: apiNote.userId,
    Title: apiNote.title || '', // Map lowercase 'title' to uppercase 'Title'
    Text: apiNote.text || '', // Map lowercase 'text' to uppercase 'Text'
    Priority: apiNote.priority,
    Color: apiNote.color,
    tileId: apiNote.tileId,
    HomeMember_uniqueId: apiNote.tileId, // For backward compatibility
    Task_uniqueId: apiNote.taskId,
    Event_uniqueId: apiNote.eventId,
    contactId: apiNote.contactId,
    Deadline_DateTime: apiNote.deadlineDateTime,
    Scheduled_Time: apiNote.scheduledTime || '',
    Scheduled_Time_End: apiNote.scheduledTimeEnd || '',
    Reminder_Each_X_Months: apiNote.reminderEachXMonths,
    Reminder_Each_X_Weeks: apiNote.reminderEachXWeeks,
    Reminder_Each_X_Days: apiNote.reminderEachXDays,
    HomeMembers: apiNote.homeMembers || [],
    BlackListed_Family: apiNote.blacklistedFamily || [],
    Checklist_Data: apiNote.checklistData,
  }));
};

/**
 * Helper function to map API event response to frontend format
 * Maps backend field names to React Web format
 * @param events - Array of events from API response
 * @returns Array of events with mapped field names
 */
const mapEventResponse = (events: any[]): IEEvent[] => {
  if (!Array.isArray(events)) return [];

  return events.map((apiEvent: any) => ({
    UniqueId: apiEvent.id,
    id: apiEvent.id, // Keep both for compatibility
    CreationTimestamp: apiEvent.creationTimestamp,
    UpdateTimestamp: apiEvent.updateTimestamp,
    Active: apiEvent.active,
    Deleted: apiEvent.deleted,
    Account_uniqueId: apiEvent.accountId,
    accountId: apiEvent.accountId, // Keep both for compatibility
    User_uniqueId: apiEvent.userId,
    userId: apiEvent.userId, // Keep both for compatibility
    Title: apiEvent.title || '', // Map lowercase 'title' to uppercase 'Title'
    title: apiEvent.title || '', // Keep both for compatibility
    Text: apiEvent.text || '', // Map lowercase 'text' to uppercase 'Text'
    text: apiEvent.text || '', // Keep both for compatibility
    Priority: apiEvent.priority,
    priority: apiEvent.priority, // Keep both for compatibility
    Location: apiEvent.location || '',
    location: apiEvent.location || '', // Keep both for compatibility
    titleId: apiEvent.tileId,
    taskId: apiEvent.taskId,
    contactId: apiEvent.contactId,
    delegateUserId: apiEvent.delegateUserId,
    Deadline_DateTime: apiEvent.deadlineDateTime,
    deadlineDateTime: apiEvent.deadlineDateTime, // Keep both for compatibility
    Deadline_DateTime_End: apiEvent.deadlineDateTimeEnd,
    deadlineDateTimeEnd: apiEvent.deadlineDateTimeEnd, // Keep both for compatibility
    Scheduled_Time: apiEvent.scheduledTime || '',
    scheduledTime: apiEvent.scheduledTime || '', // Keep both for compatibility
    Scheduled_Time_End: apiEvent.scheduledTimeEnd || '',
    scheduledTimeEnd: apiEvent.scheduledTimeEnd || '', // Keep both for compatibility
    color: apiEvent.color,
    durationInSeconds: apiEvent.durationInSeconds,
    meetingUrl: apiEvent.meetingUrl,
    locationType: apiEvent.locationType,
    locationMeta: apiEvent.locationMeta,
    importCalendarId: apiEvent.importCalendarId,
    importEventId: apiEvent.importEventId,
    rruleString: apiEvent.rruleString,
    recurringPattern: apiEvent.recurringPattern || {},
    useJustInTime: apiEvent.useJustInTime || false,
    completed: apiEvent.completed || false,
    // All-day flags from API
    isAllDay: apiEvent.isAllDay,
    IsAllDay: apiEvent.isAllDay,
  }));
};

// Base URL for API - use Next.js API route to proxy requests
const API_BASE_URL = '/api';

/**
 * DENTS (Documents, Events, Notes, Tasks) Service
 * 
 * This service provides unified access to all content types associated with contacts.
 * It uses the new DENTS API endpoint to fetch all related content in a single request.
 */

export interface FileWithBlacklist {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  storageProviderId: string;
  accountId: string;
  userId: string;
  creationTimestamp: string;
  updateTimestamp: string;
  active: boolean;
  deleted: boolean;
  blacklistedFamily: string[]; // Array of user IDs who cannot see this file
}

export interface DentsResponse {
  dents: {
    files?: FileWithBlacklist[];
    notes?: INote[];
    events?: IEEvent[];
    tasks?: ITTask[];
  };
  counts: {
    files: number;
    notes: number;
    events: number;
    tasks: number;
  };
  entityType: string;
  entityId: string;
  metadata?: {
    requestedContentTypes: string[];
    includeDeleted: boolean;
    totalItems: number;
  };
}

export interface DentsRequestOptions {
  accountId: string;
  userId: string;
  contentTypes?: string[]; // ['files', 'notes', 'events', 'tasks']
  includeDeleted?: boolean;
}

/**
 * Fallback function to get DENTS data using individual API endpoints
 * This is used when the unified DENTS API is not available
 */
const getContactDentsFallback = async (
  contactId: string,
  options: DentsRequestOptions
): Promise<DentsResponse> => {
  const { accountId, userId, contentTypes = ['files', 'notes', 'events', 'tasks'] } = options;

  console.log('[DENTS_SERVICE] Using fallback method for contact:', contactId);

  const results: any = {
    files: [],
    notes: [],
    events: [],
    tasks: []
  };

  const counts = {
    files: 0,
    notes: 0,
    events: 0,
    tasks: 0
  };

  // For now, return empty data structure until individual endpoints are implemented
  // TODO: Implement individual API calls when contact-specific endpoints are available

  return {
    dents: results,
    counts,
    entityType: 'contact',
    entityId: contactId,
    metadata: {
      requestedContentTypes: contentTypes,
      includeDeleted: false,
      totalItems: 0
    }
  };
};

/**
 * Get all DENTS (Documents, Events, Notes, Tasks) for a specific contact
 *
 * @param contactId - The UUID of the contact
 * @param options - Request options including accountId, userId, contentTypes, includeDeleted
 * @returns Promise<DentsResponse> - All related content for the contact
 */
export const getContactDents = async (
  contactId: string,
  options: DentsRequestOptions
): Promise<DentsResponse> => {
  try {
    const { accountId, userId, contentTypes, includeDeleted = false } = options;

    // Build query parameters
    const params = new URLSearchParams({
      accountId,
      userId,
      includeDeleted: includeDeleted.toString(),
    });

    // Add content types if specified
    if (contentTypes && contentTypes.length > 0) {
      params.append('contentTypes', contentTypes.join(','));
    }

    const url = `${API_BASE_URL}/dents/contacts/${contactId}?${params.toString()}`;

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] Fetching contact dents (using contacts plural):', {
        contactId,
        url,
        options
      });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('[DENTS_SERVICE] DENTS API not available (status:', response.status, '), using fallback method');
      // Fall back to individual API calls
      return await getContactDentsFallback(contactId, options);
    }

    const data: DentsResponse = await response.json();

    // Map task data to frontend format
    if (data.dents.tasks) {
      data.dents.tasks = mapTaskResponse(data.dents.tasks);
    }

    // Map note data to frontend format
    if (data.dents.notes) {
      data.dents.notes = mapNoteResponse(data.dents.notes);
    }

    // Map event data to frontend format
    if (data.dents.events) {
      data.dents.events = mapEventResponse(data.dents.events);
    }

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] Contact dents fetched successfully:', {
        contactId,
        counts: data.counts,
        totalItems: data.metadata?.totalItems || 0
      });
    }

    return data;

  } catch (error) {
    console.log('[DENTS_SERVICE] Error with DENTS API, using fallback method:', error);
    // Fall back to individual API calls
    return await getContactDentsFallback(contactId, options);
  }
};

/**
 * Fallback function to get DENTS data for tiles using individual API endpoints
 */
const getTileDentsFallback = async (
  tileId: string,
  options: DentsRequestOptions
): Promise<DentsResponse> => {
  const { accountId, userId, contentTypes = ['files', 'notes', 'events', 'tasks'] } = options;

  if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
    console.log('[DENTS_SERVICE] Using fallback method for tile:', tileId);
  }

  const results: any = {
    files: [],
    notes: [],
    events: [],
    tasks: []
  };

  const counts = {
    files: 0,
    notes: 0,
    events: 0,
    tasks: 0
  };

  // For now, return empty data structure until individual endpoints are implemented
  // TODO: Implement individual API calls when tile-specific endpoints are available

  return {
    dents: results,
    counts,
    entityType: 'tile',
    entityId: tileId,
    metadata: {
      requestedContentTypes: contentTypes,
      includeDeleted: false,
      totalItems: 0
    }
  };
};

/**
 * Get all DENTS for a specific tile/hive member
 *
 * @param tileId - The UUID of the tile
 * @param options - Request options including accountId, userId, contentTypes, includeDeleted
 * @returns Promise<DentsResponse> - All related content for the tile
 */
export const getTileDents = async (
  tileId: string,
  options: DentsRequestOptions
): Promise<DentsResponse> => {
  try {
    const { accountId, userId, contentTypes, includeDeleted = false } = options;

    // Build query parameters
    const params = new URLSearchParams({
      accountId,
      userId,
      includeDeleted: includeDeleted.toString(),
    });

    // Add content types if specified
    if (contentTypes && contentTypes.length > 0) {
      params.append('contentTypes', contentTypes.join(','));
    }

    const url = `${API_BASE_URL}/dents/tiles/${tileId}?${params.toString()}`;

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] Fetching tile dents:', {
        tileId,
        url,
        options
      });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('[DENTS_SERVICE] DENTS API not available, using fallback method');
      }
      // Fall back to individual API calls
      return await getTileDentsFallback(tileId, options);
    }

    const data: DentsResponse = await response.json();

    // Map task data to frontend format
    if (data.dents.tasks) {
      data.dents.tasks = mapTaskResponse(data.dents.tasks);
    }

    // Map note data to frontend format
    if (data.dents.notes) {
      data.dents.notes = mapNoteResponse(data.dents.notes);
    }

    // Map event data to frontend format
    if (data.dents.events) {
      data.dents.events = mapEventResponse(data.dents.events);
    }

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] Tile dents fetched successfully:', {
        tileId,
        counts: data.counts,
        totalItems: data.metadata?.totalItems || 0
      });
    }

    return data;

  } catch (error) {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] Error with DENTS API, using fallback method:', error);
    }
    // Fall back to individual API calls
    return await getTileDentsFallback(tileId, options);
  }
};

/**
 * Get all DENTS (Documents, Events, Notes, Tasks) for a specific user
 *
 * @param targetUserId - The UUID of the target user
 * @param options - Request options including accountId, userId, contentTypes, includeDeleted
 * @returns Promise<DentsResponse> - All related content for the user
 */
export const getUserDents = async (
  targetUserId: string,
  options: DentsRequestOptions
): Promise<DentsResponse> => {
  try {
    const { accountId, userId, contentTypes, includeDeleted = false } = options;

    // Build query parameters
    const params = new URLSearchParams({
      accountId,
      userId,
      includeDeleted: includeDeleted.toString(),
    });

    // Add content types if specified
    if (contentTypes && contentTypes.length > 0) {
      params.append('contentTypes', contentTypes.join(','));
    }

    const url = `${API_BASE_URL}/dents/users/${targetUserId}?${params.toString()}`;

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] Fetching user dents:', {
        targetUserId,
        url,
        options
      });
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DentsResponse = await response.json();

    // Map task data to frontend format
    if (data.dents.tasks) {
      data.dents.tasks = mapTaskResponse(data.dents.tasks);
    }

    // Map note data to frontend format
    if (data.dents.notes) {
      data.dents.notes = mapNoteResponse(data.dents.notes);
    }

    // Map event data to frontend format
    if (data.dents.events) {
      data.dents.events = mapEventResponse(data.dents.events);
    }

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] User dents fetched successfully:', {
        targetUserId,
        counts: data.counts,
        totalItems: data.metadata?.totalItems || 0
      });
    }

    return data;

  } catch (error) {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('[DENTS_SERVICE] Error with user DENTS API:', error);
    }
    // For now, return empty response if user DENTS fails
    // Could implement fallback later if needed
    return {
      entityType: 'user',
      entityId: targetUserId,
      dents: {
        files: [],
        notes: [],
        events: [],
        tasks: []
      },
      counts: {
        files: 0,
        notes: 0,
        events: 0,
        tasks: 0
      },
      metadata: {
        requestedContentTypes: contentTypes || ['files', 'notes', 'events', 'tasks'],
        includeDeleted,
        totalItems: 0
      }
    };
  }
};

/**
 * Helper function to get content types based on filter pill selection
 *
 * @param selectedPillText - The text of the selected filter pill
 * @returns string[] - Array of content types to fetch
 */
export const getContentTypesFromPill = (selectedPillText: string): string[] => {
  switch (selectedPillText.toLowerCase()) {
    case 'tasks':
      return ['tasks'];
    case 'notes':
      return ['notes'];
    case 'docs':
    case 'documents':
      return ['files'];
    case 'events':
      return ['events'];
    default:
      return ['files', 'notes', 'events', 'tasks']; // All types
  }
};
