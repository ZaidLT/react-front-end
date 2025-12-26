'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import CustomText from '../../../components/CustomText';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DateTimeDisplay from '../../../components/DateTimeDisplay';
import { Colors, Typography } from '../../../styles';
import { useLanguageContext } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import { IEEvent, User } from '../../../services/types';
import { getEventsByUser, deleteEvent } from '../../../services/services';
import { useEventStore, useFamilyStore } from '../../../context/store';
import { PRIORITY_ITEMS, REMINDER_OPTIONS } from '../../../util/constants';
import { getPropertyFrequency } from '../../../util/helpers';
import { ETileType } from '../../../util/types';
import tileService from '../../../services/tileService';

import { trackEvent, AmplitudeEvents } from '../../../services/analytics';

// Helper function to map tile type to icon path
const getTileIconByType = (tileType: number): string => {
  switch (tileType) {
    case ETileType.Kitchen:
      return '/hive-icons/kitchen.svg';
    case ETileType.Living_space:
      return '/hive-icons/living-room.svg';
    case ETileType.Bedroom:
      return '/hive-icons/bedroom.svg';
    case ETileType.Bathroom:
      return '/hive-icons/bathroom.svg';
    case ETileType.Garage:
      return '/hive-icons/garage.svg';
    case ETileType.Garden:
      return '/hive-icons/garden.svg';
    case ETileType.House:
      return '/hive-icons/house.svg';
    default:
      return '/hive-icons/house.svg';
  }
};

const ViewEventContent: React.FC = () => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();

  const eventId = params.eventId as string;

  // Store states
  const events = useEventStore((state) => state.events);
  const family = useFamilyStore((state) => state.family);

  // Local state
  const [event, setEvent] = useState<IEEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHives, setSelectedHives] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<User[]>([]);

  // Load event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);

        // First try to find in store
        let foundEvent = events.find((e) => e.UniqueId === eventId);

        // Only fetch from API if we have auth info and haven't found the event
        if (!foundEvent && authUser?.id && authUser?.accountId) {
          // If not in store, fetch from API
          console.log('Event not found in store, fetching from API...');
          try {
            const fetchedEvents = await getEventsByUser(
              authUser.id,
              authUser.accountId
            );
            console.log('Fetched events from API:', fetchedEvents);
            console.log('Looking for event ID:', eventId);
            console.log(
              'Event IDs in fetched events:',
              fetchedEvents.map((e) => ({
                UniqueId: e.UniqueId,
                id: e.id,
                title: e.Title || e.title,
              }))
            );

            foundEvent = fetchedEvents.find((e) => e.UniqueId === eventId);
            console.log('Found event after API fetch:', foundEvent);

            if (foundEvent) {
              // Update store with fetched events
              const setEvents = useEventStore.getState().setEvents;
              setEvents(fetchedEvents);
            }
          } catch (apiError) {
            console.error('Failed to fetch events from API:', apiError);
            // Don't set error state here, let it try again when dependencies change
          }
        }

        if (foundEvent) {
          setEvent(foundEvent);

          try { trackEvent(AmplitudeEvents.eventViewed, { eventId }); } catch {}

          // Load hive data from tileId field (HomeMembers now contains user IDs, not tile IDs)
          const tileId = (foundEvent as any).tileId || (foundEvent as any).Tile_uniqueId;
          if (tileId && authUser?.accountId && authUser?.id) {
            try {
              console.log('🔍 ViewEvent: Loading hive data for tileId:', tileId);
              const hive = await tileService.getTileById(
                tileId,
                authUser.accountId,
                authUser.id
              );
              if (hive) {
                console.log('🔍 ViewEvent: Successfully loaded hive:', hive.Name);
                setSelectedHives([hive]);
              } else {
                console.log('🔍 ViewEvent: No hive data found for tileId:', tileId);
                setSelectedHives([]);
              }
            } catch (error) {
              console.error('🔍 ViewEvent: Error loading hive data:', error);
              setSelectedHives([]);
            }
          } else {
            console.log('🔍 ViewEvent: No tileId found in event data');
            setSelectedHives([]);
          }

          // Set family members involved in the event
          if (foundEvent.User_uniqueId) {
            const involvedMember = family.find(
              (member) => member.UniqueId === foundEvent.User_uniqueId
            );
            if (involvedMember) {
              setSelectedFamily([involvedMember]);
            }
          }
        } else if (authUser?.id && authUser?.accountId) {
          // Only log error if we have auth info (meaning we should have been able to find/fetch the event)
          console.error('Event not found:', eventId);
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only run if we have eventId and either the event is in store or we have auth info to fetch it
    if (
      eventId &&
      (events.some((e) => e.UniqueId === eventId) ||
        (authUser?.id && authUser?.accountId))
    ) {
      loadEvent();
    }
  }, [eventId, authUser?.id, authUser?.accountId, events, family]);

  // Additional useEffect to update local event state when store changes
  useEffect(() => {
    if (eventId && events.length > 0) {
      const updatedEvent = events.find((e) => e.UniqueId === eventId);
      if (updatedEvent && event && updatedEvent.UniqueId === event.UniqueId) {
        // Only update if we have a current event and found an updated version
        setEvent(updatedEvent);
      }
    }
  }, [events, eventId, event]);

  const handleEdit = () => {
    if (event) {
      const lang = searchParams.get('lang');
      const returnTo = searchParams.get('returnTo');
      let url = `/edit-event/${event.UniqueId}`;

      const params = new URLSearchParams();
      if (lang) params.set('lang', lang);
      if (returnTo) params.set('returnTo', returnTo);

      const query = params.toString();
      if (query) url += `?${query}`;

      router.push(url);
    }
  };

  const handleDelete = async () => {
    if (!event || !authUser?.id || !authUser?.accountId) return;

    try {
      setDeleting(true);

      await deleteEvent(event.UniqueId!, authUser.accountId!, authUser.id!);

      // Remove from store
      const currentEvents = useEventStore.getState().events;
      const updatedEvents = currentEvents.filter(
        (e) => e.UniqueId !== event.UniqueId
      );
      useEventStore.getState().setEvents(updatedEvents);

      // Navigate back
      router.back();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(i18n.t('FailedToDeleteEvent'));
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Priority mapping to match backend API (0=None, 1=Low, 2=Medium, 3=High)
  const priorityToTitleColorMap: Record<
    number,
    { title: string; color: string }
  > = {
    0: { title: i18n.t('None'), color: Colors.GREY_COLOR },
    1: { title: i18n.t('Low'), color: Colors.PISTACHIO_GREEN },
    2: { title: i18n.t('Medium'), color: Colors.MUSTARD },
    3: { title: i18n.t('High'), color: Colors.RED },
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: Colors.WHITE,
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: Colors.WHITE,
          padding: '20px',
        }}
      >
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.GREY_COLOR,
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {i18n.t('EventNotFound')}
        </CustomText>
        <button
          onClick={() => router.back()}
          style={{
            backgroundColor: Colors.BLUE,
            color: Colors.WHITE,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            cursor: 'pointer',
          }}
        >
          {i18n.t('GoBack')}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: Colors.WHITE,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px',
          borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
          backgroundColor: Colors.WHITE,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M19 12H5'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M12 19L5 12L12 5'
              stroke={Colors.BLUE}
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <CustomText
            style={{
              color: Colors.BLUE,
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
          >
            {i18n.t('Back')}
          </CustomText>
        </button>

        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_18,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            textAlign: 'center',
            flex: 1,
            marginLeft: '20px',
            marginRight: '20px',
          }}
        >
          {i18n.t('View')} {i18n.t('Event')}
        </CustomText>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleEdit}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '4px',
            }}
            title={i18n.t('Edit')}
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z'
                stroke={Colors.BLUE}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '4px',
            }}
            title={i18n.t('Delete')}
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
                stroke={Colors.LIGHT_RED}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z'
                stroke={Colors.LIGHT_RED}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M10 11V17'
                stroke={Colors.LIGHT_RED}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M14 11V17'
                stroke={Colors.LIGHT_RED}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          width: '100%',
          padding: '40px 20px',
          boxSizing: 'border-box',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* Event Title */}
        <div>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_20,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.MIDNIGHT,
              lineHeight: '1.3',
              marginBottom: '20px',
            }}
          >
            {event.Title}
          </CustomText>
        </div>

        {/* Event Description */}
        <div>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.BLUE,
              lineHeight: '1.5',
            }}
          >
            {event.Text || i18n.t('NoEventDescription')}
          </CustomText>
        </div>

        {/* Event Location */}
        {(event.Location || event.location) && (
          <div style={{ marginBottom: '16px' }}>
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
              {i18n.t('Location')}
            </div>

            {/* Location Content */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '4px',
              alignSelf: 'stretch',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                width: '100%',
              }}>
                <img
                  src="/icon-location.svg"
                  alt={i18n.t('Location')}
                  style={{
                    width: '24px',
                    height: '24px',
                    flexShrink: 0,
                  }}
                />
                <CustomText
                  style={{
                    color: '#666E96',
                    fontFamily: 'Poppins',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: '120%',
                    flex: 1,
                  }}
                >
                  {event.Location || event.location}
                </CustomText>
              </div>
            </div>
          </div>
        )}

        {/* Date & Time Display */}

        <DateTimeDisplay
          deadlineStartDateTime={event.deadlineDateTime}
          deadlineEndDateTime={event.deadlineDateTimeEnd}
          scheduledTime={event.scheduledTime}
          scheduledTimeEnd={event.scheduledTimeEnd}
          frequency={getPropertyFrequency(
            event.reminderEachXDays,
            event.reminderEachXWeeks,
            event.reminderEachXMonths,
            event.recurringFreq
          )}
          reminder={(() => {
            // Get reminder value from either reminderFrequency (new field) or reminderEachXWeek01 (legacy field)
            const reminderValue = event.reminderFrequency !== undefined ? event.reminderFrequency : event.reminderEachXWeek01;
            const reminderIndex = typeof reminderValue === 'number' ? reminderValue : parseInt(String(reminderValue), 10);
            if (!isNaN(reminderIndex) && reminderIndex >= 0 && reminderIndex < REMINDER_OPTIONS.length) {
              return REMINDER_OPTIONS[reminderIndex];
            }
            return REMINDER_OPTIONS[0]; // Default to "None"
          })()}
        />

        {/* Priority with Circular Flag Icon - matching view task page */}
        {event.Priority !== undefined &&
          PRIORITY_ITEMS.find((item) => item.value === event.Priority) && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_12,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: Colors.BLUE,
                }}
              >
                {i18n.t('Priority')}
              </CustomText>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                {/* Circular flag icon matching view task page */}
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 10 10'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M1.66699 5.83337V8.75004'
                    stroke={
                      PRIORITY_ITEMS.find(
                        (item) => item.value === event.Priority
                      )?.iconColor
                    }
                    strokeWidth='0.625'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M4.89932 1.59955C3.52214 0.887438 2.2074 1.41554 1.66699 1.84177V6.17725C2.07103 5.713 3.28315 4.99337 4.89932 5.82904C6.34366 6.57587 7.75216 6.16567 8.33366 5.843V1.67005C7.21266 2.17983 6.00753 2.17258 4.89932 1.59955Z'
                    stroke={
                      PRIORITY_ITEMS.find(
                        (item) => item.value === event.Priority
                      )?.iconColor
                    }
                    strokeWidth='0.625'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    fill='none'
                  />
                </svg>
                <CustomText
                  style={{
                    fontSize: Typography.FONT_SIZE_16,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    color: Colors.BLUE,
                  }}
                >
                  {event.Priority !== null && event.Priority !== undefined
                    ? priorityToTitleColorMap[event.Priority]?.title ||
                      i18n.t('Unknown')
                    : i18n.t('Unknown')}
                </CustomText>
              </div>
            </div>
          )}

        {/* Hives */}
        {selectedHives.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                color: Colors.BLACK,
                marginBottom: '12px',
              }}
            >
              {i18n.t('Hive')}
            </CustomText>
            {selectedHives.map((hive, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <img
                  src={getTileIconByType(hive.Type)}
                  alt={hive.Name}
                  style={{
                    width: '24px',
                    height: '24px',
                    marginRight: '12px',
                  }}
                />
                <CustomText
                  style={{
                    fontSize: Typography.FONT_SIZE_14,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    color: Colors.BLACK,
                  }}
                >
                  {hive.Name}
                </CustomText>
              </div>
            ))}
          </div>
        )}

        {/* People Involved */}
        {selectedFamily.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                color: Colors.BLACK,
                marginBottom: '12px',
              }}
            >
              {i18n.t('PeopleInvolved')}
            </CustomText>
            {selectedFamily.map((member, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: Colors.BLUE,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                  }}
                >
                  <CustomText
                    style={{
                      fontSize: Typography.FONT_SIZE_12,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                      color: Colors.WHITE,
                    }}
                  >
                    {member.FirstName.charAt(0)}
                    {member.LastName.charAt(0)}
                  </CustomText>
                </div>
                <CustomText
                  style={{
                    fontSize: Typography.FONT_SIZE_14,
                    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    color: Colors.BLACK,
                  }}
                >
                  {member.FirstName} {member.LastName}
                </CustomText>
              </div>
            ))}
          </div>
        )}
      </div>

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
              borderRadius: '12px',
              padding: '40px',
              maxWidth: '400px',
              width: '90%',
              height: 'auto',
              textAlign: 'center',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.DARK_GREY,
              }}
            >
              {i18n.t('AreYouSureDeleteEvent')}
            </CustomText>
            <div
              style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}
            >
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
                onClick={handleDelete}
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

const ViewEventPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: Colors.WHITE,
          }}
        >
          <LoadingSpinner />
        </div>
      }
    >
      <ViewEventContent />
    </Suspense>
  );
};

export default ViewEventPage;
