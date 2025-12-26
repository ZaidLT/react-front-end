'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCalendars, Calendar } from '../../services/calendarService';
import CalendarsList, { CalendarListSkeleton } from '../../components/CalendarsList';
import { Colors } from 'styles';

/**
 * Calendars Settings Page - Client Component
 *
 * Fetches calendar data from the microservice and displays in settings
 * This page provides calendar management functionality including:
 * - Calendar visibility toggles
 * - Calendar color selection
 * - Add new calendars (Google, Microsoft, Apple)
 * - Remove calendars
 */
const CalendarsPage = () => {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCalendars = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const fetchedCalendars = await fetchCalendars(user.id);
        setCalendars(fetchedCalendars);
      } catch (error) {
        console.error('[Calendars Page] Failed to fetch calendars:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendars();
  }, [user?.id]);

  // Show skeleton while loading
  if (loading) {
    return <CalendarListSkeleton />;
  }

  // Mocked Eeva calendar (always present)
  const eevaCalendar: Calendar = {
    id: 'eeva-calendar',
    email: '', // Empty shows default text in UI
    source: 'eeva',
    color: Colors.PRIMARY_ELECTRIC_BLUE,
    isHidden: false,
  };

  return (
    <CalendarsList
      eevaCalendar={eevaCalendar}
      googleCalendars={calendars}
    />
  );
};

export default CalendarsPage;
