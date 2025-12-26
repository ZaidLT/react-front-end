'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { Colors, Typography } from '../../styles';
import CustomText from '../../components/CustomText';
import { useLanguageContext } from '../../context/LanguageContext';

import { useMobileAppDetection } from '../../hooks/useMobileAppDetection';
import TimeEmptyState from '../../components/TimeEmptyState';
import TimePageSkeleton from './TimePageSkeleton';
import './time.css';

import TabBar from '../../components/TabBar';
import CalendarTopView from '../../components/CalendarTopView';
import CalendarProvider from '../../components/CalendarProvider';
import WeekCalendar from '../../components/WeekCalendar';
import AllDayEventsView from '../../components/AllDayEventsView';
import TimelineList from '../../components/TimelineList';
import Calendar from '../../components/Calendar';
import UnifiedItemCard from '../../components/UnifiedItemCard';
import moment from 'moment';
import {
  CALENDAR_VIEW,
  TIMELINE_PROPS,
  mapCalendarEvents,
  mapMarkedDates,
  convertTimeToProperFormat
} from '../../util/calendar';
import { useAuth } from '../../context/AuthContext';
import { getEventsByUser, getTasksByUser } from '../../services/services';
import { fetchCalendars, Calendar as CalendarType } from '../../services/calendarService';
import { ICalendarItem } from '../../util/types';
import taskService from '../../services/taskService';
import { useEventStore, useTaskStore, useEventMonthCacheStore } from '../../context/store';


interface TimePageProps {}

/**
 * Time Tab Page - Main calendar and time management interface
 *
 * This page provides calendar functionality including:
 * - Daily agenda view
 * - Weekly timeline view
 * - Monthly calendar view
 * - Event and task management
 */
const TimePage: React.FC<TimePageProps> = () => {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const t = i18n.t;


  // Store access
  const { setEvents } = useEventStore();
  const { tasks, setTasks } = useTaskStore();
  const { getMonthEvents, setMonthEvents } = useEventMonthCacheStore();

  // Mobile detection using comprehensive detection (includes WebView detection)
  const { isMobileApp } = useMobileAppDetection();

  // State management - toggle between monthly and weekly views
  const [selectedView, setSelectedView] = useState(CALENDAR_VIEW.calendar); // Default to monthly view
  // Ensure we always initialize with today's date
  const [currentDate, setCurrentDate] = useState(() => moment().format("YYYY-MM-DD"));
  const [selectedDay, setSelectedDay] = useState(() => moment().format("YYYY-MM-DD"));
  const [calendarEvents, setCalendarEvents] = useState<any>({});
  const [markedDates, setMarkedDates] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial data fetch
  const [calendarsLoaded, setCalendarsLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  // Cache per-month events to provide instant loads when revisiting months
  const getMonthKey = useCallback((dateStr: string) => moment(dateStr).format('YYYY-MM'), []);

  // Fetch calendars for color mapping
  useEffect(() => {
    const loadCalendars = async () => {
      if (!authUser?.id) {
        setCalendarsLoaded(true); // Mark as loaded even if no user (prevents infinite loading)
        return;
      }

      try {
        const fetchedCalendars = await fetchCalendars(authUser.id);
        setCalendars(fetchedCalendars);
        setCalendarsLoaded(true);
      } catch (error) {
        console.error('[Time Page] Failed to fetch calendars:', error);
        setCalendarsLoaded(true); // Mark as loaded even on error
      }
    };

    loadCalendars();
  }, [authUser?.id]);

  // Create calendar color map for efficient lookup
  // KEY: Use calendar.email because event.importCalendarId contains the email, not the UUID
  const calendarColorMap = useMemo(() => {
    const map = new Map<string, string>();
    calendars.forEach(cal => map.set(cal.email, cal.color));
    return map;
  }, [calendars]);

  // Update loading state when both calendars and events are loaded
  useEffect(() => {
    if (calendarsLoaded && eventsLoaded) {
      setIsLoading(false);
    }
  }, [calendarsLoaded, eventsLoaded]);

  const mapAndSetFromEvents = useCallback((eventsArr: any[]) => {
    const mappedEvents = mapCalendarEvents(eventsArr, tasks, calendarColorMap);
    const mappedMarkedDates = mapMarkedDates(mappedEvents);
    setCalendarEvents(mappedEvents);
    setMarkedDates(mappedMarkedDates);
  }, [tasks, calendarColorMap]);

  const loadMonthData = useCallback(async (dateStr: string) => {
    if (!authUser?.id) return;

    const monthKey = getMonthKey(dateStr);
    const cached = getMonthEvents(authUser.id, authUser.accountId, monthKey);

    // If cached, show immediately while we fetch in background
    if (cached) {
      mapAndSetFromEvents(cached);
    }

    setIsRefreshing(true);
    try {
      const start = moment(dateStr).startOf('month').format('MM/DD/YYYY');
      const end = moment(dateStr).endOf('month').format('MM/DD/YYYY');
      const events = await getEventsByUser(authUser.id, authUser.accountId, undefined, start, end);

      // Update global store and cache
      setEvents(events);
      setMonthEvents(authUser.id, authUser.accountId, monthKey, events);

      // Update UI with fresh data
      mapAndSetFromEvents(events);
    } catch (e) {
      // Optional: surface error state
      // setError(t('FailedToLoadEventsPleaseTryAgain'));
    } finally {
      setIsRefreshing(false);
    }
  }, [authUser?.id, authUser?.accountId, getMonthKey, setEvents, mapAndSetFromEvents]);

  // Track last loaded month; whenever currentDate month changes (incl. modal Save), auto-fetch
  const prevMonthKeyRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!authUser?.id || selectedView !== CALENDAR_VIEW.calendar) return;
    const monthKey = getMonthKey(currentDate);
    if (prevMonthKeyRef.current === null) {
      // Initialize without fetching to avoid double-load on first mount
      prevMonthKeyRef.current = monthKey;
      return;
    }
    if (prevMonthKeyRef.current !== monthKey) {
      prevMonthKeyRef.current = monthKey;
      void loadMonthData(currentDate);
    }
  }, [currentDate, selectedView, authUser?.id, authUser?.accountId, getMonthKey, loadMonthData]);


  // Suppress lint warnings - these are used in useEffect
  void error;

  // Refresh function to reload calendar data
  const refreshData = useCallback(async () => {
    if (isRefreshing || !authUser?.id) return;

    setIsRefreshing(true);
    try {
      const start = selectedView === CALENDAR_VIEW.calendar ? moment(currentDate).startOf('month').format('MM/DD/YYYY') : undefined;
      const end = selectedView === CALENDAR_VIEW.calendar ? moment(currentDate).endOf('month').format('MM/DD/YYYY') : undefined;
      const [eventsData, tasksData] = await Promise.allSettled([
        getEventsByUser(authUser.id, authUser.accountId, undefined, start, end),
        getTasksByUser(authUser.id, authUser.accountId, false, false) // includeDeleted=false, includeCompleted=false
      ]);

      // Extract successful results
      const events = eventsData.status === 'fulfilled' ? eventsData.value : [];
      const tasks = tasksData.status === 'fulfilled' ? tasksData.value : [];

      // Update global stores so other pages can access the data
      setEvents(events);
      setTasks(tasks);

      // Update month cache for current month (calendar view)
      const monthKey = getMonthKey(currentDate);
      if (selectedView === CALENDAR_VIEW.calendar) {
        setMonthEvents(authUser.id, authUser.accountId, monthKey, events);
      }

      // Map to calendar format
      const mappedEvents = mapCalendarEvents(events, tasks, calendarColorMap);
      const mappedMarkedDates = mapMarkedDates(mappedEvents);

      setCalendarEvents(mappedEvents);
      setMarkedDates(mappedMarkedDates);

      // Handle any failed requests
      if (eventsData.status === 'rejected') {
        setError(t('FailedToLoadEventsPleaseTryAgain'));
      }
      if (tasksData.status === 'rejected') {
        setError(t('FailedToLoadTasksPleaseTryAgain'));
      }
    } catch (error: any) {
      setError(t('FailedToRefreshCalendarDataPleaseTryAgain'));
    } finally {
      setIsRefreshing(false);
    }
  }, [authUser?.id, authUser?.accountId, isRefreshing, selectedView, currentDate, calendarColorMap]);

  // Handle task completion toggle
  const handleTaskToggle = useCallback(async (item: ICalendarItem, isCompleted: boolean) => {
    if (!authUser?.id || !authUser?.accountId || item.type !== 'task') {
      return;
    }

    const taskId = item.UniqueId || item.id;
    if (!taskId) {
      console.warn('Task missing UniqueId/id:', item);
      return;
    }

    try {
      const result = await taskService.updateTaskCompletionStatus(
        taskId,
        authUser.id,
        authUser.accountId,
        isCompleted
      );

      if (result) {
        // Update the calendar events to reflect the change
        setCalendarEvents((prevEvents: any) => {
          const updatedEvents = { ...prevEvents };
          Object.keys(updatedEvents).forEach(date => {
            updatedEvents[date] = updatedEvents[date].map((event: any) =>
              (event.UniqueId === taskId || event.id === taskId)
                ? { ...event, completed: isCompleted, Active: !isCompleted }
                : event
            );
          });
          return updatedEvents;
        });
      }
    } catch (error) {
      // Silently handle error - task completion update failed
    }
  }, [authUser?.id, authUser?.accountId]);

  // Navigation handlers - matching React Native structure
  const onDateChanged = useCallback((date: string) => {
    setCurrentDate(date);
    setSelectedDay(date); // Also update selectedDay when date changes

    // Update marked dates to show the new date as selected using functional update
    setMarkedDates((prevMarkedDates: any) => {
      const updatedMarkedDates: any = { ...prevMarkedDates };

      // Clear previous selections
      Object.keys(updatedMarkedDates).forEach((dateKey) => {
        updatedMarkedDates[dateKey] = {
          ...updatedMarkedDates[dateKey],
          selected: false,
          customStyles: {},
        };
      });

      // Mark the new date as selected
      if (!updatedMarkedDates.hasOwnProperty(date)) {
        updatedMarkedDates[date] = {};
      }

      updatedMarkedDates[date] = {
        ...updatedMarkedDates[date],
        selected: true,
        customStyles: {
          container: {
            backgroundColor: '#F0F8FF',
            border: `2px solid ${Colors.PRIMARY_ELECTRIC_BLUE}`,
            borderRadius: '8px',
          },
          text: {
            color: Colors.PRIMARY_ELECTRIC_BLUE,
            fontWeight: '600',
          }
        },
      };

      return updatedMarkedDates;
    });
  }, []);

  const onDayPress = useCallback((day: any) => {
    if (!day) return;
    const selectedDate = day.dateString;
    setSelectedDay(selectedDate);
    setCurrentDate(selectedDate);

    // Update marked dates to show selection - matching React Native logic
    setMarkedDates((prevMarkedDates: any) => {
      const updatedMarkedDates: any = { ...prevMarkedDates };

      if (!updatedMarkedDates.hasOwnProperty(selectedDate)) {
        updatedMarkedDates[selectedDate] = {};
      }

      Object.keys(updatedMarkedDates).forEach((date) => {
        if (date === selectedDate) {
          updatedMarkedDates[date] = {
            ...updatedMarkedDates[date],
            selected: true,
            customStyles: {
              container: {
                backgroundColor: '#F0F8FF',
                border: `2px solid ${Colors.PRIMARY_ELECTRIC_BLUE}`,
                borderRadius: '8px',
              },
              text: {
                color: Colors.PRIMARY_ELECTRIC_BLUE,
                fontWeight: '600',
              }
            },
          };
        } else {
          updatedMarkedDates[date] = {
            ...updatedMarkedDates[date],
            selected: false,
            customStyles: {},
          };
        }
      });

      return updatedMarkedDates;
    });

    onDateChanged(selectedDate);
  }, [onDateChanged]);

  const onMonthChange = useCallback((month: any) => {
    const monthString = typeof month === 'string' ? month : month.dateString;
    setCurrentDate(monthString);
  }, []);

  // Initialize calendar with today's date and marked dates
  useEffect(() => {
    const today = moment().format("YYYY-MM-DD");

    // Ensure we always start with today's date
    setCurrentDate(today);
    setSelectedDay(today);

    // Only set initial marked dates if we don't have any yet
    setMarkedDates((prevMarkedDates: any) => {
      if (Object.keys(prevMarkedDates).length === 0) {
        return {
          [today]: {
            selected: true,
            customStyles: {
              container: {
                backgroundColor: '#F0F8FF',
                border: `2px solid ${Colors.PRIMARY_ELECTRIC_BLUE}`,
                borderRadius: '8px',
              },
              text: {
                color: Colors.PRIMARY_ELECTRIC_BLUE,
                fontWeight: '600',
              }
            },
          }
        };
      }
      return prevMarkedDates;
    });
  }, []);

  // Toggle function between monthly and weekly views
  const toggleView = () => {
    setSelectedView(selectedView === CALENDAR_VIEW.calendar ? CALENDAR_VIEW.time : CALENDAR_VIEW.calendar);
  };

  // Load calendar data - only when user/account changes, not when date changes
  useEffect(() => {
    const loadCalendarData = async () => {
      // Wait for calendars to load first to ensure colors are available
      if (!calendarsLoaded || !authUser?.id || !authUser?.accountId) {
        // Set empty data when not authenticated or calendars not loaded yet
        setCalendarEvents({});
        setMarkedDates({});
        return;
      }

      setError(null);

      // If in calendar view and month cached, show immediately before fetching
      if (selectedView === CALENDAR_VIEW.calendar) {
        const monthKey = getMonthKey(currentDate);
        const cached = getMonthEvents(authUser.id, authUser.accountId, monthKey);
        if (cached) {
          mapAndSetFromEvents(cached);
        }
      }

      try {
        // Fetch events and tasks in parallel
        const start = selectedView === CALENDAR_VIEW.calendar ? moment(currentDate).startOf('month').format('MM/DD/YYYY') : undefined;
        const end = selectedView === CALENDAR_VIEW.calendar ? moment(currentDate).endOf('month').format('MM/DD/YYYY') : undefined;
        const [eventsData, tasksData] = await Promise.allSettled([
          getEventsByUser(authUser.id, authUser.accountId, undefined, start, end),
          getTasksByUser(authUser.id, authUser.accountId, false, false) // includeDeleted=false, includeCompleted=false
        ]);

        // Extract successful results
        const events = eventsData.status === 'fulfilled' ? eventsData.value : [];
        const tasks = tasksData.status === 'fulfilled' ? tasksData.value : [];

        // Update global stores so other pages can access the data
        setEvents(events);
        setTasks(tasks);

        // Map to calendar format
        const mappedEvents = mapCalendarEvents(events, tasks, calendarColorMap);
        const mappedMarkedDates = mapMarkedDates(mappedEvents);

        setCalendarEvents(mappedEvents);
        setMarkedDates(mappedMarkedDates);

        // Handle any failed requests
        if (eventsData.status === 'rejected') {
          setError(t('FailedToLoadEventsPleaseTryAgain'));
        }
        if (tasksData.status === 'rejected') {
          setError(t('FailedToLoadTasksPleaseTryAgain'));
        }

      } catch (error: any) {
        setError(t('FailedToLoadCalendarDataPleaseTryAgain'));
      } finally {
        setEventsLoaded(true);
      }
    };

    loadCalendarData();
  }, [authUser?.id, authUser?.accountId, calendarsLoaded]); // Wait for calendars to load before fetching events





  // Event scroll item component with task toggle functionality
  const EventScrollItem: React.FC<{ item: ICalendarItem; isDailyView?: boolean }> = ({
    item,
  }) => {
    // Format date for display
    const formatDateForDisplay = (item: any): string => {
      const dateToUse = item.start || item.Deadline_DateTime || item.CreationTimestamp;
      if (!dateToUse) return '';

      const date = moment(dateToUse);
      const now = moment();

      if (date.isSame(now, 'day')) {
        return `${t('Today')} ${convertTimeToProperFormat(dateToUse)}`;
      } else if (date.isSame(now.clone().add(1, 'day'), 'day')) {
        return `${t('Tomorrow')} ${convertTimeToProperFormat(dateToUse)}`;
      } else if (date.isSame(now.clone().subtract(1, 'day'), 'day')) {
        return `${t('Yesterday')} ${convertTimeToProperFormat(dateToUse)}`;
      } else {
        return `${date.format('MMM D')} ${convertTimeToProperFormat(dateToUse)}`;
      }
    };

    return (
      <UnifiedItemCard
        UniqueId={item.UniqueId || item.id || ''}
        Title={item.title || item.summary || ''}
        Text={(item as any).summary || (item as any).description || (item as any).Text || (item as any).text || ''}
        type={item.type === 'task' ? 'Task' : item.type === 'event' ? 'Event' : 'Note'}
        Priority={item.Priority || null}
        Deadline_DateTime={item.start || (item as any).Deadline_DateTime || null}
        CreationTimestamp={(item as any).CreationTimestamp || null}
        User_uniqueId={(item as any).User_uniqueId || null}
        completed={item.type === "task" ? ((item as any).completed === true) : false}
        color={item.color}
        isAllDay={(item as any).isAllDay === true || (item as any).IsAllDay === true}
        onPress={() => {
          // Handle navigation to event/task details
          if (item.type === "event") {
            const eventId = item.UniqueId || item.id;
            if (eventId) {
              // Preserve mobile app parameters and add returnTo
              let url = `/edit-event/${eventId}?returnTo=/time`;
              if (typeof window !== 'undefined') {
                const currentParams = new URLSearchParams(window.location.search);
                const mobile = currentParams.get('mobile');
                const token = currentParams.get('token');

                if (mobile || token) {
                  const urlObj = new URL(url, window.location.origin);
                  if (mobile) urlObj.searchParams.set('mobile', mobile);
                  if (token) urlObj.searchParams.set('token', token);
                  url = urlObj.pathname + urlObj.search;
                }
              }
              router.push(url);
            } else {
              console.warn('Event missing UniqueId/id:', item);
            }
          } else if (item.type === "task") {
            const taskId = item.UniqueId || item.id;
            if (taskId) {
              // Preserve mobile app parameters and add returnTo
              let url = `/edit-task/${taskId}?returnTo=/time`;
              if (typeof window !== 'undefined') {
                const currentParams = new URLSearchParams(window.location.search);
                const mobile = currentParams.get('mobile');
                const token = currentParams.get('token');

                if (mobile || token) {
                  const urlObj = new URL(url, window.location.origin);
                  if (mobile) urlObj.searchParams.set('mobile', mobile);
                  if (token) urlObj.searchParams.set('token', token);
                  url = urlObj.pathname + urlObj.search;
                }
              }
              router.push(url);
            } else {
              console.warn('Task missing UniqueId/id:', item);
            }
          }
        }}
        onToggle={item.type === "task" ? (completed) => handleTaskToggle(item, completed) : undefined}
        formatDateForDisplay={formatDateForDisplay}
      />
    );
  };



  // Show skeleton while loading initial data
  if (isLoading) {
    return <TimePageSkeleton selectedView={selectedView as 'calendar' | 'time'} />;
  }

  return (
    <div style={{
        minHeight: '100vh',
        backgroundColor: 'white',
        // paddingBottom: '80px', // Space for tab bar
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Content Container with width restriction matching other tabs */}
        <div style={styles.contentContainer}>
        {/* Calendar Top View - matching React Native header */}
        <CalendarTopView
          currentDate={currentDate}
          onChangeView={toggleView}
          onDateChange={(date: string) => {
            // Use the same logic as manual date selection to ensure proper clearing
            onDateChanged(date);
          }}
          onRefresh={refreshData}
          isRefreshing={isRefreshing}
          selectedView={selectedView}
          mobile={isMobileApp}
        />


        {/* Weekly Timeline View - matching React Native structure */}
        {selectedView === CALENDAR_VIEW.time && (
          <CalendarProvider
            date={currentDate}
            onDateChanged={onDateChanged}
            onMonthChange={onMonthChange}
          >
            <WeekCalendar
              key={`week-calendar-${selectedDay}`}
              markingType="multi-dot"
              date={currentDate}
              firstDay={0}
              markedDates={markedDates}
              onDayPress={onDayPress}
              allowShadow={false}
            />
            <AllDayEventsView
              events={calendarEvents}
              selectedDay={selectedDay}
            />
            <TimelineList
              timelineProps={TIMELINE_PROPS}
              events={calendarEvents && Object.entries(calendarEvents).reduce((acc, [date, events]) => {
                const filteredEvents = (events as any[]).filter((event: any) => {
                  // Prefer API boolean isAllDay when present; fallback to boundary check
                  const apiIsAllDay = (event as any).isAllDay ?? (event as any).IsAllDay;
                  const boundaryAllDay = moment(event.start).format('HH:mm') === '00:00' && moment(event.end).format('HH:mm') === '23:59';
                  const isAllDay = typeof apiIsAllDay === 'boolean' ? apiIsAllDay : boundaryAllDay;
                  // Exclude all-day events from the hourly timeline
                  return !isAllDay;
                });
                acc[date] = filteredEvents;
                return acc;
              }, {} as any) || {}}
              selectedDay={selectedDay}
              showNowIndicator={true}
              scrollToFirst={true}
              onToggle={handleTaskToggle}
            />
          </CalendarProvider>
        )}

        {/* Monthly Calendar View - matching React Native structure */}
        {selectedView === CALENDAR_VIEW.calendar && (
          <div style={styles.calendarViewContainer}>
            <CalendarProvider
              style={styles.calendarProvider}
              date={currentDate}
              onDateChanged={onDateChanged}
              onMonthChange={onMonthChange}
            >
              <Calendar
                key={currentDate} // Force re-render when date changes
                selectedDate={(() => {
                  // Parse date string as local time to avoid timezone issues
                  const [year, month, day] = currentDate.split('-').map(Number);
                  return new Date(year, month - 1, day); // month is 0-indexed
                })()}
                onDateSelect={(date) => {
                  const dateString = moment(date).format('YYYY-MM-DD');
                  onDayPress({
                    dateString,
                    year: date.getFullYear(),
                    month: date.getMonth() + 1,
                    day: date.getDate(),
                    timestamp: date.getTime()
                  });
                }}
                markedDates={markedDates}
                style={styles.calendar}
              />
            </CalendarProvider>
          </div>
        )}

        {/* Events List for Calendar View - matching React Native structure */}
        {selectedView === CALENDAR_VIEW.calendar && (
          <div style={{
            ...styles.eventsScrollContainer,
            alignSelf: 'stretch',
            marginTop: '0',
            paddingTop: '10px'
          }}>
            {calendarEvents ? (
              (() => {
                const dayEvents = calendarEvents[selectedDay];
                if (!dayEvents || dayEvents.length === 0) {
                  return <TimeEmptyState isMobileApp={isMobileApp} />;
                }

                return dayEvents
                  .sort((a: any, b: any) => {
                    return moment(a.start).diff(moment(b.start));
                  })
                  .map((item: any) => (
                    <EventScrollItem
                      key={`${item.id}+${Math.random()}`}
                      item={item}
                    />
                  ));
              })()
            ) : (
              <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
                {t('NoEventsFound')}
              </div>
            )}
          </div>
        )}


      </div>

        {/* Tab Bar */}
        <TabBar />
      </div>
  );
};

// Styles matching React Native structure
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'transparent',
    paddingBottom: '80px', // Space for tab bar
  } as React.CSSProperties,

  contentContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    padding: '0 24px 10px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    flex: 1,
    minHeight: 0,
  } as React.CSSProperties,

  calendarViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  } as React.CSSProperties,

  calendarProvider: {
    marginTop: '0px',
    marginBottom: '0px',
  } as React.CSSProperties,

  calendar: {
    height: '100%',
  } as React.CSSProperties,

  eventsScrollContainer: {
    padding: '10px 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  } as React.CSSProperties,

  emptyStateContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    minHeight: '300px',
  } as React.CSSProperties,

  emptyStateCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: '16px',
    padding: '32px 24px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxWidth: '320px',
    width: '100%',
  } as React.CSSProperties,

  emptyStateHeading: {
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    marginBottom: '8px',
  } as React.CSSProperties,

  emptyStateSubtitleContainer: {
    marginBottom: '24px',
  } as React.CSSProperties,

  emptyStateSubheading: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: '#000E50',
    marginBottom: '4px',
    display: 'block',
  } as React.CSSProperties,

  addEventButton: {
    backgroundColor: Colors.BLUE,
    color: Colors.WHITE,
    border: 'none',
    borderRadius: '25px',
    padding: '12px 24px',
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    width: '100%',
  } as React.CSSProperties,

  plusIcon: {
    marginRight: '4px',
  } as React.CSSProperties,

  plusIconContainer: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
  } as React.CSSProperties,

};

export default TimePage;
