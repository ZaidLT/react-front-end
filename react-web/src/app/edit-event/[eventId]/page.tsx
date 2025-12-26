'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useEventStore, useTileStore } from '../../../context/store';
import { useLanguageContext } from '../../../context/LanguageContext';
import CustomText from '../../../components/CustomText';
import Button from '../../../components/Button';
import MenuListItem from '../../../components/MenuListItem';
import HorizontalLine from '../../../components/HorizontalLine';
import OverlayModal from '../../../components/OverlayModal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import HiveSelectionModal from '../../../components/HiveSelectionModal';
import FamilyMemberSelectionModal from '../../../components/FamilyMemberSelectionModal';
import DatetimeRangeInput from '../../../components/DatetimeRangeInput';
import { Colors, Typography } from '../../../styles/index';
import familyService from '../../../services/familyService';
import {
  FONT_FAMILY_POPPINS_REGULAR,
  FONT_FAMILY_POPPINS_MEDIUM,
  FONT_SIZE_16,
  FONT_SIZE_20,
} from '../../../styles/typography';
import {
  REMINDER_OPTIONS,
  RECURRING_FREQUENCY_ITEMS,
} from '../../../util/constants';
import { IEEvent, ITag, User } from '../../../services/types';
import { INestedTile, Tile } from '../../../util/types';
import { buildEventPayload, getPropertyFrequency, mapSyntheticTilesToRealTiles } from '../../../util/helpers';
import { trackEvent, AmplitudeEvents } from '../../../services/analytics';
import moment from 'moment';
import { deleteEvent } from '../../../services/services';

const EditEventPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params?.eventId as string;
  const { user } = useAuth();
  const { i18n } = useLanguageContext();

  // Store access
  const { events, setEvents, updateEvent } = useEventStore();
  const { tiles } = useTileStore();

  // Loading and error states
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(true);
  const [eventError, setEventError] = useState<string | null>(null);
  const [originalEvent, setOriginalEvent] = useState<IEEvent | null>(null);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [priority, setPriority] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Date and time state
  const [date, setDate] = useState<Date>(new Date());
  const [dateEnd, setDateEnd] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [timeEnd, setTimeEnd] = useState<Date>(new Date());
  const [isAllDayActive, setIsAllDayActive] = useState<boolean>(false);

  // Selection states
  const [selectedHives, setSelectedHives] = useState<INestedTile[]>([]);
  const [selectedHive, setSelectedHive] = useState<INestedTile | null>(null);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<User[]>([]);
  const [reminder, setReminder] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');
  const [tagList, setTagList] = useState<ITag[]>([]);

  // Modal states
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState<boolean>(false);
  const [showHiveSelectionModal, setShowHiveSelectionModal] = useState<boolean>(false);
  const [showFamilySelectionModal, setShowFamilySelectionModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Populate event data function
  const populateEventData = useCallback(async (event: IEEvent) => {
    // Set basic fields
    setTitle(event.Title || event.title || '');
    setNote(event.Text || event.text || '');
    setLocation(event.Location || event.location || '');
    setPriority(event.Priority || 1);

    // Determine all-day using new API field when available, otherwise fall back to scheduled times
    const scheduledStart = (event as any).scheduledTime || (event as any).Scheduled_Time;
    const scheduledEnd = (event as any).scheduledTimeEnd || (event as any).Scheduled_Time_End;
    const rawIsAllDay = (event as any).isAllDay ?? (event as any).IsAllDay;
    const hasIsAllDay = typeof rawIsAllDay === 'boolean';
    const derivedIsAllDay = hasIsAllDay ? (rawIsAllDay as boolean) : (scheduledStart === '00:00' && scheduledEnd === '23:59');
    setIsAllDayActive(derivedIsAllDay);

    // Extract local start/end times from deadlineDateTime fields (maintain UTC conversion logic)
    const startStr = (event as any).deadlineDateTime || (event as any).Deadline_DateTime;
    const endStr = (event as any).deadlineDateTimeEnd || (event as any).Deadline_DateTime_End;

    if (startStr) {
      const startLocal = moment.utc(startStr).local();
      setDate(startLocal.toDate());
      setTime(derivedIsAllDay ? startLocal.clone().startOf('day').toDate() : startLocal.toDate());
    }

    if (endStr) {
      const endLocal = moment.utc(endStr).local();
      setDateEnd(endLocal.toDate());
      setTimeEnd(derivedIsAllDay ? endLocal.clone().endOf('day').toDate() : endLocal.toDate());
    } else {
      const base = startStr ? moment.utc(startStr).local() : moment();
      const fallbackEnd = base.clone().add(1, 'hour');
      setDateEnd(fallbackEnd.toDate());
      setTimeEnd(fallbackEnd.toDate());
    }

    // Initialize frequency
    const eventFrequency = getPropertyFrequency(
      event.reminderEachXDays,
      event.reminderEachXWeeks,
      event.reminderEachXMonths,
      event.recurringFreq
    );
    setFrequency(eventFrequency || '');

    // Initialize reminder - check both reminderFrequency (new field) and reminderEachXWeek01 (legacy field)
    const reminderValue = event.reminderFrequency !== undefined ? event.reminderFrequency : event.reminderEachXWeek01;
    if (reminderValue !== undefined && typeof reminderValue === 'number' && reminderValue < REMINDER_OPTIONS.length) {
      setReminder(REMINDER_OPTIONS[reminderValue]);
    }

    // Initialize hive selection - use tileId field (homeMembers now contains user IDs, not tile IDs)
    const tileId = (event as any).tileId || event.titleId;

    if (tileId && user?.accountId) {
      // Load the primary tile
      try {
        const { default: tileService } = await import('../../../services/tileService');
        const tile = await tileService.getTileById(tileId, user.accountId, user.id);
        if (tile) {
          const hiveObject: INestedTile = {
            UniqueId: tile.UniqueId,
            Account_uniqueId: tile.Account_uniqueId,
            Active: tile.Active,
            CreationTimestamp: tile.CreationTimestamp,
            Deleted: tile.Deleted,
            Name: tile.Name,
            Type: tile.Type,
            UpdateTimestamp: tile.UpdateTimestamp,
            User_uniqueId: tile.User_uniqueId,
            AvatarImagePath: tile.AvatarImagePath,
            children: []
          };
          setSelectedHive(hiveObject);
          setSelectedHives([hiveObject]);
        }
      } catch (error) {
        console.error('Error fetching tile in edit event:', error);
        // Fallback to tiles from store
        const hive = tiles.find(tile => tile.UniqueId === tileId);
        if (hive) {
          setSelectedHive(hive);
          setSelectedHives([hive]);
        }
      }
    } else {
      // No tileId found - homeMembers now contains user IDs, not tile IDs
      console.log('🔍 EditEvent: No tileId found in event data');
      setSelectedHive(null);
      setSelectedHives([]);
    }

    // Initialize delegate selection from existing event data
    try {
      const existingDelegateId = (event as any).delegateUserId || (event as any).Delegate_User_uniqueId;
      if (existingDelegateId && user?.accountId && existingDelegateId !== user.id) {
        const members = await familyService.getActiveFamilyMembers(user.accountId);
        const match = members.find(m => m.id === existingDelegateId);
        if (match) {
          const converted = [{
            UniqueId: match.id,
            FirstName: match.firstName,
            LastName: match.lastName,
            EmailAddress: match.emailAddress,
            AvatarImagePath: match.avatarImagePath,
            Account_uniqueId: match.accountId,
            Language: match.language,
            DisplayMode: match.displayMode,
            ActiveUser: match.activeUser,
          } as User];
          setSelectedFamilyMembers(converted);
        } else {
          setSelectedFamilyMembers([]);
        }
      } else {
        setSelectedFamilyMembers([]);
      }
    } catch (err) {
      console.warn('Failed to initialize delegate from event', err);
    }
  }, [tiles, user]);

  // Load event data on component mount
  useEffect(() => {
    if (!eventId) {
      setEventError('No event ID provided');
      setIsLoadingEvent(false);
      return;
    }

    // Always fetch fresh data from API to ensure we have the latest information
    const fetchEvent = async () => {
      try {
        if (user?.accountId) {
          console.log('🔍 EditEvent: Fetching fresh event data from API for:', eventId);

          // First try to find in store
          let event = events.find((e) => e.UniqueId === eventId || (e as any).id === eventId);

          if (event) {
            console.log('🔍 EditEvent: Found event in store:', event);
            setOriginalEvent(event);
            populateEventData(event);
          } else {
            // If not in store, fetch from API
            console.log('🔍 EditEvent: Event not in store, fetching from API...');
            try {
              const { getEventsByUser } = await import('../../../services/services');
              const freshEvents = await getEventsByUser(user.id, user.accountId);
              console.log('🔍 EditEvent: Fetched events from API:', freshEvents);

              // Update the store with fresh data
              setEvents(freshEvents);

              // Find the event in the fresh data
              event = freshEvents.find((e) => e.UniqueId === eventId || (e as any).id === eventId);

              if (event) {
                console.log('🔍 EditEvent: Found event in fresh API data:', event);
                setOriginalEvent(event);
                populateEventData(event);
              } else {
                console.log('🔍 EditEvent: Event not found even after API fetch');
                setEventError('Event not found');
              }
            } catch (apiError) {
              console.error('🔍 EditEvent: Failed to fetch from API:', apiError);
              setEventError('Failed to load event');
            }
          }
        } else {
          setEventError('User account not available');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setEventError('Failed to load event');
      } finally {
        setIsLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [eventId, events, populateEventData, user?.accountId]);

  // Handler functions



  // Handle hive selection
  const handleHiveSelection = (selectedHives: (INestedTile | Tile | User)[], selectedHive?: INestedTile | User | null) => {
    if (selectedHive) {
      setSelectedHive(selectedHive as INestedTile);
      setSelectedHives([selectedHive as INestedTile]);
    } else if (selectedHives.length > 0) {
      setSelectedHives(selectedHives as INestedTile[]);
      setSelectedHive(selectedHives[0] as INestedTile);
    }
    setShowHiveSelectionModal(false);
  };



  // Handle event update
  const handleSaveEvent = async () => {
    if (!title.trim()) {
      alert("Please enter an event title");
      return;
    }

    if (!user?.id || !user?.accountId || !originalEvent) {
      alert("Missing required user information");
      return;
    }

    try {
      setIsLoading(true);

      // Combine date and time for start and end using precise local times, then convert to UTC
      const startLocal = moment(date).clone().set({
        hour: isAllDayActive ? 0 : moment(time).hour(),
        minute: isAllDayActive ? 0 : moment(time).minute(),
        second: isAllDayActive ? 0 : moment(time).second(),
        millisecond: 0,
      });

      const endLocal = moment(dateEnd).clone().set({
        hour: isAllDayActive ? 23 : moment(timeEnd).hour(),
        minute: isAllDayActive ? 59 : moment(timeEnd).minute(),
        second: isAllDayActive ? 59 : moment(timeEnd).second(),
        millisecond: 0,
      });

      // Convert to UTC for backend storage
      const utcStartDateTime = startLocal.clone().utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
      const utcEndDateTime = endLocal.clone().utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

      // Map synthetic tiles to real tiles
      const selectedHiveIds = selectedHives.map(hive => hive.UniqueId);
      const realHiveIds = await mapSyntheticTilesToRealTiles(selectedHiveIds, user.id, user.accountId);

      // Build event payload
      // Determine delegate (single-select): if a member is selected and it's not self, set delegateUserId
      const selectedDelegateUserId = (selectedFamilyMembers && selectedFamilyMembers.length > 0)
        ? (selectedFamilyMembers[0]?.UniqueId || undefined)
        : undefined;
      const hadExistingDelegate = Boolean((originalEvent as any)?.delegateUserId || (originalEvent as any)?.Delegate_User_uniqueId);

      const eventData = buildEventPayload({
        userId: user.id,
        accountId: user.accountId,
        title: title.trim(),
        text: note.trim(),
        location: location.trim(),
        priority,
        deadlineDateTime: utcStartDateTime,
        deadlineDateTimeEnd: utcEndDateTime,
        scheduledTime: isAllDayActive ? '00:00' : moment(time).format('HH:mm'),
        scheduledTimeEnd: isAllDayActive ? '23:59' : moment(timeEnd).format('HH:mm'),
        isAllDay: isAllDayActive,
        reminderOption: reminder,
        frequency,
        useJustInTime: Boolean(frequency && frequency !== 'None'), // Enable useJustInTime for recurring events
        // Pass tileId if exactly one hive is selected (now using real tile ID)
        tileId: realHiveIds.length === 1 ? realHiveIds[0] : undefined,
        // Assignment: creator is always associated via homeMembers; delegation via delegateUserId
        delegateUserId: selectedDelegateUserId && selectedDelegateUserId !== user.id ? selectedDelegateUserId : (hadExistingDelegate ? null : undefined),
        homeMembers: [user.id],
        peopleInvolved: [], // Not implemented yet
        color: originalEvent.Color || '#C3B7FF',
      });

      // Add the required 'id' field for updates
      eventData.id = (originalEvent as any)?.id || originalEvent!.UniqueId!;

      console.log('Updating event with API-compliant data:', eventData);

      const queryParams = user!.accountId ? `?accountId=${user!.accountId}` : '';
      const response = await fetch(`/api/events${queryParams}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        try {
          const updatedEvent = await response.json();
          console.log('Event updated successfully:', updatedEvent);
        } catch {
          console.log('Response parsing failed, but HTTP status is OK');
        }

          try { trackEvent(AmplitudeEvents.eventEdited, { eventId }); } catch {}

        // Refetch all events to get the latest data (without clearing store to avoid flash)
        console.log('Refreshing event data from API...');

        if (user?.id && user?.accountId) {
          try {
            const { getEventsByUser } = await import('../../../services/services');
            const freshEvents = await getEventsByUser(user.id, user.accountId);
            console.log('Refreshed events from API:', freshEvents);
            setEvents(freshEvents);
          } catch (error) {
            console.error('Failed to refresh events:', error);
            // Fallback: update with local data
            const updatedEventData = {
              ...originalEvent,
              Title: title.trim(),
              Text: note.trim(),
              Priority: priority,
              DeadlineDateTime: startLocal.format('YYYY-MM-DDTHH:mm:ss'),
              DeadlineDateTimeEnd: endLocal.format('YYYY-MM-DDTHH:mm:ss'),
              ScheduledTime: isAllDayActive ? '00:00' : moment(time).format('HH:mm'),
              ScheduledTimeEnd: isAllDayActive ? '23:59' : moment(timeEnd).format('HH:mm'),
              ReminderOption: reminder,
              Frequency: frequency,
              HomeMembers: [user.id],
              Delegate_User_uniqueId: (selectedFamilyMembers[0]?.UniqueId && selectedFamilyMembers[0]?.UniqueId !== user.id) ? selectedFamilyMembers[0]?.UniqueId : null,
              PeopleInvolved: [],
            };
            updateEvent(updatedEventData);
          }
        }

        console.log('✅ Event update successful - HTTP 200 received');

        // Navigate back to returnTo page if provided, otherwise go to view-event
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
          // Replace current page in history to fix back navigation
          router.replace(`/view-event/${eventId}`);
        }
      } else {
        console.error('Failed to update event:', response.status, response.statusText);
        alert("Something went wrong, please try again later");
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      alert("Something went wrong, please try again later");
    } finally {
      setIsLoading(false);
    }
  };



  // Early return for loading state
  if (isLoadingEvent) {
    return <LoadingSpinner />;
  }

  if (eventError || !originalEvent) {
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
          {eventError || 'Event not found'}
        </CustomText>
        <Button
          textProps={{
            text: "Go Back",
            fontSize: FONT_SIZE_16,
            color: Colors.WHITE,
            fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
          }}
          onButtonClick={() => router.push('/life')}
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: Colors.WHITE,
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
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
            {i18n.t('Edit')} {i18n.t('Event')}
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

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '100px',
      }}>
        {/* Form Container */}
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
            className="create-task-input"
            style={{
              fontSize: Typography.FONT_SIZE_20,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              border: 'none',
              outline: 'none',
              width: '100%',
              borderRadius: '12px',
              background: 'var(--primary-electric-3, #F7F9FF)',
              padding: '12px',
            }}
            placeholder={i18n.t('AddATitle') || 'Add a title'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          </div>

          {/* Location Section */}
          <div>
          {/* Location Label */}
          <div style={{
            color: '#666E96',
            fontFamily: 'Poppins',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: '500',
            lineHeight: '120%',
            marginBottom: '8px',
          }}>
            {i18n.t('Location') || 'Location'}
          </div>

          {/* Location Input Container */}
          <div style={{
            display: 'flex',
            height: '80px',
            padding: '12px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '10px',
            alignSelf: 'stretch',
            borderRadius: '12px',
            background: 'var(--primary-electric-3, #F7F9FF)',
          }}>
            <textarea
              style={{
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: '400',
                border: 'none',
                outline: 'none',
                width: '100%',
                background: 'transparent',
                resize: 'none',
                textAlign: 'left',
                color: location ? 'var(--primary-dark-blue-100, #000E50)' : 'var(--primary-dark-blue-40, #999FB9)',
                lineHeight: '21px',
                letterSpacing: '-0.408px',
              }}
              placeholder={i18n.t('AddLocation') || 'Add location'}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              rows={3}
            />
          </div>
          </div>

          {/* Date and Time Selection */}
          <div>
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
            />
          </div>

          {/* Reminder Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <CustomText style={{
              color: '#666E96',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '120%',
            }}>
              {i18n.t('Reminder') || 'Reminder'}
            </CustomText>
            <MenuListItem
              content={{
                icon: '/icon-create-task-reminder.svg',
                name: reminder ? i18n.t(reminder as any) : (i18n.t('AddReminder') || 'Select Reminder'),
              }}
              textColor={reminder ? Colors.BLUE : Colors.PEARL}
              onPress={() => setShowReminderModal(true)}
              isFullWidth={true}
            />
          </div>

          {/* Frequency Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <CustomText style={{
              color: '#666E96',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '120%',
            }}>
              {i18n.t('Frequency') || 'Frequency'}
            </CustomText>
            <MenuListItem
              content={{
                icon: '/dents/icon-task-frequency.svg',
                name: frequency ? i18n.t(frequency as any) : (i18n.t('AddFrequency') || 'Select Frequency'),
              }}
              textColor={frequency ? Colors.BLUE : Colors.PEARL}
              onPress={() => setShowFrequencyModal(true)}
              isFullWidth={true}
            />
          </div>

        {/* Assigned To */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
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
                    fontFamily: 'Poppins',
                    fontWeight: '500',
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
                fontFamily: 'Poppins',
                fontWeight: '500',
                color: Colors.BLACK,
                flex: 1,
              }}
            >
              {`${user?.firstName || i18n.t('You') || 'You'} ${user?.lastName || ''} (${i18n.t('You') || 'You'})`}
            </CustomText>
          </div>

          {selectedFamilyMembers.map((member) => (
            <div key={member.UniqueId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              backgroundColor: Colors.LIGHT_BLUE_BACKGROUND,
              borderRadius: '8px',
              border: `1px solid ${Colors.BLUE}`,
            }}>
              {member.AvatarImagePath ? (
                <img
                  src={member.AvatarImagePath}
                  alt={`${member.FirstName} ${member.LastName}`}
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
                    fontFamily: 'Poppins',
                    fontWeight: '500',
                    color: Colors.BLACK,
                  }}
                >
                  {member.FirstName?.charAt(0)}{member.LastName?.charAt(0)}
                </div>
              )}
              <CustomText
                style={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '500',
                  color: Colors.BLUE,
                  flex: 1,
                }}
              >
                {`${member.FirstName} ${member.LastName}`}
              </CustomText>
              <button
                onClick={() => {
                  setSelectedFamilyMembers(prev => prev.filter(m => m.UniqueId !== member.UniqueId));
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
                  <path d="M3 6H5H21" stroke={Colors.BLACK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={Colors.BLACK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          ))}

          {/* Change Assignment Button */}
          <MenuListItem
            content={{
              icon: '/assets/person-with-shadow.svg',
              name: i18n.t('ChangeAssignment') || 'Change Assignment',
            }}
            textColor={Colors.BLUE}
            onPress={() => setShowFamilySelectionModal(true)}
            isFullWidth={true}
          />
        </div>

          {/* Notes Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <CustomText style={{
              color: '#666E96',
              fontFamily: 'Poppins',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '120%',
            }}>
              Notes
            </CustomText>
            {/* Notes Input Container */}
            <div style={{
              display: 'flex',
              height: '100px',
              padding: '12px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              alignSelf: 'stretch',
              borderRadius: '12px',
              background: 'var(--primary-electric-3, #F7F9FF)',
            }}>
              <textarea
                style={{
                  fontSize: '16px',
                  fontFamily: 'Poppins',
                  fontWeight: '400',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  background: 'transparent',
                  resize: 'none',
                  textAlign: 'left',
                  color: note ? 'var(--primary-dark-blue-100, #000E50)' : 'var(--primary-dark-blue-40, #999FB9)',
                  lineHeight: '21px',
                  letterSpacing: '-0.408px',
                }}
                placeholder={i18n.t('TypeNoteHere') || 'Type note here...'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
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
          }}>
            <CustomText style={{
              color: 'var(--primary-dark-blue-60, #666E96)',
              fontSize: '12px',
              fontFamily: 'Poppins',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: '15px',
            }}>
              {i18n.t('Priority') || 'Priority'}
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
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t('None') || 'None'}
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
                  color: 'var(--Accent-Color-Green-1, #6CC47C)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t('Low') || 'Low'}
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
                  color: 'var(--Accent-Color-Orange-1, #FFA020)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t('Medium') || 'Medium'}
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
                  color: 'var(--Accent-Color-Red-1, #FF6961)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t('High') || 'High'}
                </CustomText>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <Button
              textProps={{
                text: isLoading ? (i18n.t('Saving...') || 'Saving...') : (i18n.t('UpdateEvent') || 'Save Event'),
                fontSize: FONT_SIZE_16,
                color: Colors.WHITE,
                fontFamily: FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={handleSaveEvent}
              backgroundColor={Colors.BLUE}
              borderProps={{
                width: 1,
                color: Colors.BLUE,
                radius: 8,
              }}
              disabled={isLoading}
              style={{
                opacity: isLoading ? 0.6 : 1,
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Hive Selection Modal */}
      <HiveSelectionModal
        isVisible={showHiveSelectionModal}
        onClose={() => setShowHiveSelectionModal(false)}
        onHiveSelect={handleHiveSelection}
        multiSelect={false}
        initialSelectedHives={selectedHives}
        initialSelectedHive={selectedHive}
      />

      {/* Reminder Selection Modal */}
      <OverlayModal
        selected={reminder ? i18n.t(reminder as any) : ''}
        onSelect={(display: string) => {
          // Map localized display back to the original English value for API
          const orig = REMINDER_OPTIONS.find(opt => i18n.t(opt as any) === display) || display;
          setReminder(orig);
        }}
        isVisible={showReminderModal}
        onRequestClose={() => setShowReminderModal(false)}
        headerText={i18n.t('Reminder') || 'Select Reminder'}
        items={REMINDER_OPTIONS.map(opt => i18n.t(opt as any))}
        actionButtons={[
          {
            textProps: {
              text: i18n.t('Cancel') || 'Cancel',
              color: Colors.BLUE,
            },
            backgroundColor: Colors.WHITE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowReminderModal(false),
          },
          {
            textProps: {
              text: i18n.t('Confirm') || 'Confirm',
              color: Colors.WHITE,
            },
            backgroundColor: Colors.BLUE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowReminderModal(false),
          },
        ]}
      />

      {/* Frequency Selection Modal */}
      <OverlayModal
        selected={frequency ? i18n.t(frequency as any) : ''}
        onSelect={(display: string) => {
          const orig = RECURRING_FREQUENCY_ITEMS.find(opt => i18n.t(opt as any) === display) || display;
          setFrequency(orig);
        }}
        isVisible={showFrequencyModal}
        onRequestClose={() => setShowFrequencyModal(false)}
        headerText={i18n.t('Frequency') || 'Select Frequency'}
        items={RECURRING_FREQUENCY_ITEMS.map(opt => i18n.t(opt as any))}
        actionButtons={[
          {
            textProps: {
              text: i18n.t('Cancel') || 'Cancel',
              color: Colors.BLUE,
            },
            backgroundColor: Colors.WHITE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowFrequencyModal(false),
          },
          {
            textProps: {
              text: i18n.t('Confirm') || 'Confirm',
              color: Colors.WHITE,
            },
            backgroundColor: Colors.BLUE,
            borderProps: {
              color: Colors.BLUE,
            },
            onPress: () => setShowFrequencyModal(false),
          },
        ]}
      />

      {/* Family Member Selection Modal */}
      <FamilyMemberSelectionModal
        isVisible={showFamilySelectionModal}
        onClose={() => setShowFamilySelectionModal(false)}
        onMemberSelect={(members, member) => {
          const converted = member ? [{
            UniqueId: member.id,
            FirstName: member.firstName,
            LastName: member.lastName,
            EmailAddress: member.emailAddress,
            AvatarImagePath: member.avatarImagePath,
            Account_uniqueId: member.accountId,
            Language: member.language,
            DisplayMode: member.displayMode,
            ActiveUser: member.activeUser,
          } as User] : [];
          setSelectedFamilyMembers(converted);
          try {
            if (member && member.id) {
              trackEvent(AmplitudeEvents.eventAssigned, { eventId, delegateUserId: member.id });
            }
          } catch {}
          setShowFamilySelectionModal(false);
        }}
        multiSelect={false}
        initialSelectedMembers={[
          // Convert current user to FamilyMember format
          {
            id: user?.id || '',
            accountId: user?.accountId || '',
            emailAddress: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            displayName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            language: 0,
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
          },
          // Convert selected family members back to FamilyMember format
          ...selectedFamilyMembers.map(member => ({
            id: member.UniqueId || '',
            accountId: member.Account_uniqueId || '',
            emailAddress: member.EmailAddress || '',
            firstName: member.FirstName || '',
            lastName: member.LastName || '',
            displayName: member.DisplayName || '',
            language: member.Language || 0,
            avatarImagePath: member.AvatarImagePath || '',
            displayMode: member.DisplayMode || 0,
            activeUser: member.ActiveUser || true,
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
          }))
        ]}
        initialSelectedMember={null}
      />
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: Colors.WHITE,
              padding: '20px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
            }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_18,
                fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                color: Colors.MIDNIGHT,
                marginTop: '10px',
                marginBottom: '10px',
                textAlign: 'left',
              }}
            >
              Are you sure you want to delete this event?
            </CustomText>
            <div
              style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.DARK_GREY,
                textAlign: 'left',
                marginBottom: '16px',
              }}
            >
              This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-start' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: Colors.LIGHT_GREY,
                  color: Colors.MIDNIGHT,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
              >
                {i18n.t('Cancel')}
              </button>
              <button
                onClick={async () => {
                  if (!originalEvent || !user?.id || !user?.accountId) return;
                  try {
                    setDeleting(true);
                    await deleteEvent(originalEvent.UniqueId!, user.accountId!, user.id!);
                    const currentEvents = useEventStore.getState().events;
                    const updatedEvents = currentEvents.filter((e) => e.UniqueId !== originalEvent.UniqueId);
                    useEventStore.getState().setEvents(updatedEvents);
                    router.back();
                  } catch (error) {
                    console.error('Error deleting event:', error);
                    alert('Failed to delete event. Please try again.');
                  } finally {
                    setDeleting(false);
                    setShowDeleteModal(false);
                  }
                }}
                disabled={deleting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: Colors.RED,
                  color: Colors.WHITE,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                }}
              >
                {deleting ? i18n.t('Deleting') + '...' : i18n.t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EditEventPage;
