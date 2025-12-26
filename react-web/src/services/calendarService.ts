import axios from 'axios';

// Use local Next.js API route as proxy to avoid CORS issues
const API_BASE_URL = '/api';

// Get auth headers (matches existing pattern in services.ts)
const getHeaders = () => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('auth_token')
    : null;

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// ============================================
// EXPORTED - App Domain Model
// ============================================
export interface Calendar {
  id: string;
  email: string;
  source: 'google' | 'microsoft' | 'apple' | 'eeva';
  color: string;
  isHidden: boolean;
}

// ============================================
// INTERNAL - API Types (not exported)
// ============================================
interface CalendarData {
  id: string;
  creationTimestamp: string;
  updateTimestamp: string;
  active: boolean;
  deleted: boolean;
  userId: string;
  accountId: string;
  calendarId: string;
  calendarEmail?: string;
  source: 'google' | 'microsoft' | 'apple' | 'eeva';
  authToken?: string;
  lastSyncTime?: string;
  syncCursor?: string;
  color?: string;
}

interface CalendarResponse {
  data: CalendarData[];
  response_code: number;
  message: string;
  success: boolean;
}

// ============================================
// INTERNAL - Transformation
// ============================================
const transformCalendar = (data: CalendarData): Calendar => {
  return {
    id: data.id,
    email: data.calendarEmail || '',
    source: data.source,
    color: data.color || '#4285F4',
    isHidden: !data.active,
  };
};

/**
 * Update calendar color
 * @param calendarId - Calendar ID to update
 * @param color - New color in hex format (#RRGGBB)
 * @returns Updated calendar
 */
export const updateCalendarColor = async (calendarId: string, color: string): Promise<Calendar> => {
  try {
    const url = `${API_BASE_URL}/calendars/${calendarId}/color`;
    const headers = getHeaders();

    const response = await axios.patch(url, { color }, { headers });

    // The API returns the full calendar response in the same format
    // Transform it using our existing function
    if (response.data.data) {
      return transformCalendar(response.data.data);
    }

    // Fallback: if response structure is different, return minimal calendar object
    return {
      id: calendarId,
      email: '',
      source: 'google',
      color: color,
      isHidden: false,
    };
  } catch (error: any) {
    console.error('[Calendar Service] ❌ Color update failed');
    console.error('[Calendar Service] Error:', error.response?.status, error.message);
    throw error;
  }
};

/**
 * Fetch calendars from calendar microservice
 * @param userId - User ID to fetch calendars for
 * @returns Array of transformed calendars
 */
export const fetchCalendars = async (userId: string): Promise<Calendar[]> => {
  try {
    // Use Next.js API route as proxy (avoids CORS)
    const url = `${API_BASE_URL}/calendars/all?userId=${userId}`;
    const headers = getHeaders();

    const response = await axios.get<CalendarResponse>(url, { headers });

    // Transform and filter calendars
    const calendars = (response.data.data || [])
      .filter(cal => !cal.deleted)
      .map(transformCalendar);

    return calendars;
  } catch (error: any) {
    console.error('[Calendar Service] ❌ Fetch failed');
    console.error('[Calendar Service] Error:', error.response?.status, error.message);

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('[Calendar Service] Auth token invalid or expired');
    } else if (error.response?.status === 404) {
      console.error('[Calendar Service] Calendar endpoint not found');
    }

    return [];
  }
};
