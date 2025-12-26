'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomText from '../../components/CustomText';

import Button from '../../components/Button';
import MenuListItem from '../../components/MenuListItem';
import HiveSelectionModal from '../../components/HiveSelectionModal';
import FamilyMemberSelectionModal from '../../components/FamilyMemberSelectionModal';
import OverlayModal from '../../components/OverlayModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import DatetimeRangeInput from '../../components/DatetimeRangeInput';
import { Colors, Typography } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { createEvent } from '../../services/services';
import { useEventStore, useTileStore } from '../../context/store';
import { IEEvent, User } from '../../services/types';
import { INestedTile } from '../../util/types';
import {
  roundTimeToNextHour
} from '../../util/calendar';
import {
  buildEventPayload
} from '../../util/helpers';
import { emitSnackbar } from '../../util/helpers';
import {
  REMINDER_OPTIONS,
  RECURRING_FREQUENCY_ITEMS
} from '../../util/constants';
import moment from 'moment';
import './create-event.css';
import { trackEvent, AmplitudeEvents } from '../../services/analytics';


const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { i18n } = useLanguageContext();
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [dateEnd, setDateEnd] = useState<Date>(moment().add(1, 'hour').toDate());
  const [time, setTime] = useState<Date>(roundTimeToNextHour(moment()).toDate());
  const [timeEnd, setTimeEnd] = useState<Date>(roundTimeToNextHour(moment()).add(30, 'minutes').toDate());
  const [isAllDayActive, setIsAllDayActive] = useState<boolean>(false);
  const [priority, setPriority] = useState<number>(0); // Default to No priority
  const [reminder, setReminder] = useState<string>('');
  const [frequency, setFrequency] = useState<string>('');

  // Selection state
  const [selectedHives, setSelectedHives] = useState<INestedTile[]>([]);
  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<any[]>([]);

  // Store data
  const tiles = useTileStore((state) => state.tiles);

  // Modal state
  const [showHiveSelectionModal, setShowHiveSelectionModal] = useState<boolean>(false);
  const [showFamilySelectionModal, setShowFamilySelectionModal] = useState<boolean>(false);
  const [showReminderSelectionModal, setShowReminderSelectionModal] = useState<boolean>(false);
  const [showFrequencySelectionModal, setShowFrequencySelectionModal] = useState<boolean>(false);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Parse URL parameters for editing existing event
  const eventParam = searchParams.get('event');
  const parsedEvent: IEEvent | undefined = eventParam ? JSON.parse(decodeURIComponent(eventParam)) : undefined;

  // Initialize form with existing event data if editing
  useEffect(() => {
    if (parsedEvent) {
      setTitle(parsedEvent.title || parsedEvent.Title || '');
      setDescription(parsedEvent.text || parsedEvent.Text || '');
      setLocation(parsedEvent.location || parsedEvent.Location || '');
      setPriority(parsedEvent.priority ?? parsedEvent.Priority ?? 0);

      if (parsedEvent.deadlineDateTime || parsedEvent.Deadline_DateTime) {
        const eventDate = new Date(parsedEvent.deadlineDateTime || parsedEvent.Deadline_DateTime!);
        setDate(eventDate);
      }

      if (parsedEvent.scheduledTime || parsedEvent.Scheduled_Time) {
        const eventTime = new Date(`${moment().format('YYYY-MM-DD')} ${parsedEvent.scheduledTime || parsedEvent.Scheduled_Time}`);
        setTime(eventTime);
      }

      if (parsedEvent.scheduledTimeEnd || parsedEvent.Scheduled_Time_End) {
        const eventTimeEnd = new Date(`${moment().format('YYYY-MM-DD')} ${parsedEvent.scheduledTimeEnd || parsedEvent.Scheduled_Time_End}`);
        setTimeEnd(eventTimeEnd);
      }

      // Determine all-day using new API field when available, otherwise fall back to scheduled times
      const apiIsAllDay = (parsedEvent as any).isAllDay ?? (parsedEvent as any).IsAllDay;
      const scheduledStart = (parsedEvent as any).scheduledTime || (parsedEvent as any).Scheduled_Time;
      const scheduledEnd = (parsedEvent as any).scheduledTimeEnd || (parsedEvent as any).Scheduled_Time_End;
      setIsAllDayActive(Boolean(apiIsAllDay) || (scheduledStart === '00:00' && scheduledEnd === '23:59'));
    }
  }, [parsedEvent]);

  // Get initial data from URL params for preselection
  useEffect(() => {
    const tileId = searchParams.get('tileId');
    const homeMemberId = searchParams.get('homeMemberId');
    let tileName = searchParams.get('name') || '';

    // Debug logging
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🔍 Create Event URL Params:', {
        tileId,
        homeMemberId,
        tileName,
        allParams: Object.fromEntries(searchParams.entries())
      });
    }

    // Sanitize name parameter
    try { tileName = decodeURIComponent(tileName); } catch {}
    const q = tileName.indexOf('?');
    const a = tileName.indexOf('&');
    const cut = Math.min(q === -1 ? Number.POSITIVE_INFINITY : q, a === -1 ? Number.POSITIVE_INFINITY : a);
    const cleanName = (cut === Number.POSITIVE_INFINITY ? tileName : tileName.slice(0, cut)).trim();

    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🎯 Create Event Processing:', {
        tileId,
        homeMemberId,
        tilesLength: tiles.length,
        cleanName,
        foundTile: tiles.find(tile => tile.UniqueId === tileId)
      });
    }

    // Handle homeMemberId parameter (user attribution)
    if (homeMemberId) {
      // For user attribution, we don't preselect a hive, but we'll add the user to homeMembers during save
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
        console.log('👤 Create Event: User attribution detected, homeMemberId:', homeMemberId);
      }
    } else if (tileId) {
      if (tiles.length > 0) {
        const hive = tiles.find(tile => tile.UniqueId === tileId);
        if (hive) {
          setSelectedHives([hive]);
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('✅ Create Event: Found and set hive:', hive);
          }
        } else if (cleanName) {
          // Create mock hive if tile not found in loaded tiles but we have tileId and name
          const mockHive = {
            UniqueId: tileId,
            id: tileId,
            Name: cleanName,
            Type: 'Selected'
          } as any;
          setSelectedHives([mockHive]);
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('🔧 Create Event: Tile not in store, created mock hive:', mockHive);
          }
        } else {
          if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
            console.log('❌ Create Event: No hive found for tileId:', tileId);
          }
        }
      } else if (cleanName) {
        // Create mock hive if tiles not loaded yet but we have tileId and name
        const mockHive = {
          UniqueId: tileId,
          id: tileId,
          Name: cleanName,
          Type: 'Selected'
        } as any;
        setSelectedHives([mockHive]);
        if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
          console.log('🔧 Create Event: Tiles not loaded, created mock hive:', mockHive);
        }
      }
    }
  }, [searchParams, tiles]);

  const resetValues = () => {
    setTitle('');
    setDescription('');
    setDate(new Date());
    setDateEnd(moment().add(1, 'hour').toDate());
    setTime(roundTimeToNextHour(moment()).toDate());
    setTimeEnd(roundTimeToNextHour(moment()).add(30, 'minutes').toDate());
    setReminder('');
    setFrequency('');
    setPriority(0); // Default to No priority
    setSelectedFamilyMembers([]);
    setSelectedHives([]);
    setIsAllDayActive(false);
  };

  // Handle hive selection (single-select only)
  const handleHiveSelect = (hives: (INestedTile | User)[], selectedHive?: INestedTile | User | null) => {
    // For single-select, use the selectedHive parameter or take the first item
    if (selectedHive) {
      const tile = selectedHive as INestedTile;

      setSelectedHives([tile]);
    } else if (hives.length > 0) {
      const tile = hives[0] as INestedTile;

      setSelectedHives([tile]); // Only keep the first/latest selection
    } else {

      setSelectedHives([]);
    }
    setShowHiveSelectionModal(false);
  };

  // Handle event creation/update
  const handleSaveEvent = async () => {
    if (!title.trim()) {
      emitSnackbar({
        message: i18n.t('PleaseEnterEventTitle'),
        type: 'error',
        duration: 3000
      });
      return;
    }

    if (!user?.id || !user?.accountId) {
      emitSnackbar({
        message: i18n.t('UserNotAuthenticated') || 'User not authenticated',
        type: 'error',
        duration: 3000
      });
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time and convert to UTC for backend
      const combinedStartDateTime = moment(date).format('YYYY-MM-DD') + 'T' + moment(time).format('HH:mm:ss');
      const combinedEndDateTime = moment(dateEnd).format('YYYY-MM-DD') + 'T' + moment(timeEnd).format('HH:mm:ss');

      // Convert to UTC for backend storage
      const utcStartDateTime = moment(combinedStartDateTime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      const utcEndDateTime = moment(combinedEndDateTime).utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z';

      // Get tile IDs - all tiles (utilities, property info, etc.) are now real tiles
      const selectedHiveIds = selectedHives.map(hive => hive.UniqueId);
      // All tiles can be used directly now - no more synthetic mapping needed
      const realHiveIds: string[] = selectedHiveIds;

      // Handle user attribution from homeMemberId parameter
      const homeMemberIdParam = searchParams.get('homeMemberId');
      const selectedAssignee = selectedFamilyMembers[0];
      const homeMembers = [user.id];
      if (homeMemberIdParam && !homeMembers.includes(homeMemberIdParam)) {
        homeMembers.push(homeMemberIdParam);
      }

      // Build event payload using the new API structure
      const eventPayload = buildEventPayload({
        userId: user.id,
        accountId: user.accountId,
        title: title.trim(),
        text: description.trim(),
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
        // Pass contactId for contact attribution
        contactId: (searchParams.get('contactId') || undefined) as string | undefined,
        // Single-select logic: delegate if assigning to another member
        delegateUserId: (selectedAssignee && selectedAssignee.id !== user.id) ? selectedAssignee.id : undefined,
        homeMembers: homeMembers,
        peopleInvolved: [], // Do not use peopleInvolved for delegation; rely on delegateUserId only
        color: '#C3B7FF', // Default event color
      });



      // Create the event
      const createdEvent = await createEvent(eventPayload);

      // Update the event store with the new event
      const addEvent = useEventStore.getState().addEvent;
      addEvent(createdEvent);

      // Show success message
      emitSnackbar({
        message: i18n.t('EventCreatedSuccessfully'),
        type: 'success',
        duration: 3000
      });

      // Reset form and navigate back
      resetValues();
      router.back();

    } catch (error) {
      console.error('Error creating event:', error);
      emitSnackbar({
        message: i18n.t('ErrorCreatingEvent'),
        type: 'error',
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
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
            resetValues();
            router.back();
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
            alt={i18n.t('Back')}
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
            {parsedEvent ? i18n.t('EditEvent') : i18n.t('CreateEvent')}
          </CustomText>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <LoadingSpinner />
        </div>
      )}

      {/* Main Content */}
      <div style={styles.content}>
        {/* Form Container */}
        <div style={{
          marginLeft: '24px',
          marginRight: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Title Field */}
          <div key="title-section" style={{
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
            {i18n.t('Title')}
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
            placeholder={i18n.t("AddATitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          </div>

          {/* Location Input */}
          <div key="location-section" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {/* Location Label */}
            <div style={styles.locationLabelStyle}>
              {i18n.t('Location')}
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
                placeholder={i18n.t("AddLocation")}
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
          <div key="reminder-section" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {/* Reminder Label */}
            <div style={styles.locationLabelStyle}>
              {i18n.t('Reminder')}
            </div>

            <MenuListItem
              content={{
                icon: '/icon-create-task-reminder.svg',
                name: reminder || i18n.t('Reminder') || 'Reminder',
              }}
              textColor={reminder ? Colors.BLUE : Colors.PEARL}
              onPress={() => setShowReminderSelectionModal(true)}
              isFullWidth={true}
            />
          </div>

          {/* Frequency Section */}
          <div key="frequency-section" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {/* Frequency Label */}
            <div style={styles.locationLabelStyle}>
              {i18n.t('Frequency')}
            </div>

            <MenuListItem
              content={{
                icon: '/dents/icon-task-frequency.svg',
                name: frequency || i18n.t('Frequency') || 'Frequency',
              }}
              textColor={frequency ? Colors.BLUE : Colors.PEARL}
              onPress={() => setShowFrequencySelectionModal(true)}
              isFullWidth={true}
            />
          </div>

          {/* Assigned To */}
          <div key="assigned-to-section" style={{
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
              {`${i18n.t('AssignedTo')} ${selectedFamilyMembers.length + 1} ${selectedFamilyMembers.length + 1 > 1 ? i18n.t('Members') : i18n.t('Member')}`}
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
                {`${user?.firstName || i18n.t('You')} ${user?.lastName || ''} (${i18n.t('You')})`}
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
                      fontFamily: 'Poppins',
                      fontWeight: '500',
                      color: Colors.BLACK,
                    }}
                  >
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
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
                  <img
                    src="/icons/trash-can.svg"
                    alt={i18n.t('Remove')}
                    style={{
                      width: '16px',
                      height: '16px',
                    }}
                  />
                </button>
              </div>
            ))}

            {/* Change Assignment Button */}
            <MenuListItem
              content={{
                icon: '/assets/person-with-shadow.svg',
                name: i18n.t('ChangeAssignment'),
              }}
              textColor={Colors.BLUE}
              onPress={() => setShowFamilySelectionModal(true)}
              isFullWidth={true}
            />
          </div>

          {/* Notes Input */}
          <div key="notes-section" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={styles.locationLabelStyle}>
              {i18n.t('Notes')}
            </div>
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
                  color: description ? 'var(--primary-dark-blue-100, #000E50)' : 'var(--primary-dark-blue-40, #999FB9)',
                  lineHeight: '21px',
                  letterSpacing: '-0.408px',
                }}
                placeholder={`${i18n.t('TypeNoteHere') || 'Type note here'}...`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Priority Section */}
          <div key="priority-section" style={{
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
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
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
                  color: 'var(--Accent-Color-Green-1, #6CC47C)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
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
                  color: 'var(--Accent-Color-Orange-1, #FFA020)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
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
                  color: 'var(--Accent-Color-Red-1, #FF6961)',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontStyle: 'normal',
                  fontWeight: '400',
                  lineHeight: '19px',
                  letterSpacing: '-0.084px',
                }}>
                  {i18n.t('High')}
                </CustomText>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div key="save-button-section" style={{ marginBottom: '40px' }}>
            <Button
              textProps={{
                text: parsedEvent
                  ? i18n.t('UpdateEvent') || 'Update Event'
                  : i18n.t('CreateEvent') || 'Create Event',
                color: Colors.WHITE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                fontSize: Typography.FONT_SIZE_16,
              }}
              backgroundColor={Colors.BLUE}
              disabled={title.trim().length === 0 || isLoading}
              onButtonClick={handleSaveEvent}
              loading={isLoading}
              style={{
                width: '100%',
                borderRadius: '8px',
                height: '52px',
              }}
            />
          </div>
        </div>
      </div>

      {/* Hive Selection Modal */}
      <HiveSelectionModal
        isVisible={showHiveSelectionModal}
        onClose={() => setShowHiveSelectionModal(false)}
        onHiveSelect={handleHiveSelect}
        multiSelect={false}
        initialSelectedHives={selectedHives}
        initialSelectedHive={selectedHives[0] || null}
      />

      {/* Family Member Selection Modal */}
      <FamilyMemberSelectionModal
        isVisible={showFamilySelectionModal}
        onClose={() => setShowFamilySelectionModal(false)}
        onMemberSelect={(_, member) => {
          setSelectedFamilyMembers(member ? [member] : []);
          try {
            if (member && member.id) {
              trackEvent(AmplitudeEvents.eventAssigned, { delegateUserId: member.id });
            }
          } catch {}
          setShowFamilySelectionModal(false);
        }}
        multiSelect={false}
        initialSelectedMembers={[]}
        initialSelectedMember={selectedFamilyMembers[0] || null}
      />

      {/* Reminder Selection Modal */}
      <OverlayModal
        selected={reminder}
        onSelect={setReminder}
        isVisible={showReminderSelectionModal}
        onRequestClose={() => setShowReminderSelectionModal(false)}
        headerText={i18n.t('Reminder') || 'Reminder'}
        items={REMINDER_OPTIONS}
        actionButtons={[
          {
            buttonWidth: 150,
            textProps: {
              text: i18n.t('Cancel') || 'Cancel',
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
              text: i18n.t('Confirm') || 'Confirm',
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

      {/* Frequency Selection Modal */}
      <OverlayModal
        onSelect={setFrequency}
        selected={frequency}
        isVisible={showFrequencySelectionModal}
        onRequestClose={() => setShowFrequencySelectionModal(false)}
        headerText={i18n.t('Frequency') || 'Frequency'}
        items={RECURRING_FREQUENCY_ITEMS}
        actionButtons={[
          {
            buttonWidth: 150,
            textProps: {
              text: i18n.t('Cancel') || 'Cancel',
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
              text: i18n.t('Confirm') || 'Confirm',
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
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: Colors.WHITE,
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  },
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: '20px',
  },
  titleInputStyle: {
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    border: 'none',
    outline: 'none',
    width: '100%',
    backgroundColor: 'transparent',
  },
  descriptionInputStyle: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: 'none',
    outline: 'none',
    width: '100%',
    backgroundColor: 'transparent',
    resize: 'none' as const,
  },
  locationLabelStyle: {
    color: '#666E96',
    fontFamily: 'Poppins',
    fontSize: '12px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '120%',
  },
  locationContainerStyle: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '4px',
    alignSelf: 'stretch',
  },
  locationIconAndTextStyle: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
  },
  locationIconStyle: {
    width: '24px',
    height: '24px',
    flexShrink: 0,
  },
  locationInputStyle: {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    resize: 'none' as const,
    flex: 1,
    color: '#666E96',
    fontFamily: 'Poppins',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: '120%',
    padding: 0,
  },
  requiredText: {
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
  },
  peopleInvolvedContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '10px',
    padding: '16px',
    cursor: 'pointer',
  },
  icon: {
    width: '24px',
    height: '24px',
  },
};

const CreateEventPageWrapper: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CreateEventPage />
    </Suspense>
  );
};

export default CreateEventPageWrapper;

