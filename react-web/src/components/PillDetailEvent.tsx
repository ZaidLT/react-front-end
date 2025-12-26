import React, { useMemo, useState } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEventStore,
  useEventUsersStore,
  useFamilyStore,
  useContactStore
} from "../context/store";
// Utility functions
import { findEventUsersByEventId, findFamilyByIds } from "../util/constants";
import { MONTH_NAMES, suffixifyNumber } from "../util/calendar";
import { useLanguageContext } from "../context/LanguageContext";
import moment from "moment";
import UnifiedItemCard from "./UnifiedItemCard";
import { useAuth } from "../context/AuthContext";

import CustomText from "./CustomText";
import Icon from "./Icon";
import { INestedTile } from "../util/types";
import { IEEvent } from "../services/types";
import { useIsMobileApp } from "../hooks/useMobileDetection";


interface PillDetailEventProps {
  tile?: INestedTile;
  memberId?: string;
  entityType?: 'contact' | 'tile' | 'user';
  dentsData?: IEEvent[]; // DENTS events data
  isLoading?: boolean;
  firstName?: string;
  lastName?: string;
}

/**
 * PillDetailEvent - A component for displaying events related to a home member
 *
 * This component shows a list of events associated with a home member,
 * with options to add new events.
 *
 * @param tile - The tile object
 * @param memberId - The ID of the member
 */

// Ensure we only use the intended 'name' value (strip accidental extra query or encoded delimiters)
const sanitizeNameParam = (raw: string): string => {
  let v = raw || '';
  try { v = decodeURIComponent(v); } catch {}
  const q = v.indexOf('?');
  const a = v.indexOf('&');
  const cut = Math.min(q === -1 ? Number.POSITIVE_INFINITY : q, a === -1 ? Number.POSITIVE_INFINITY : a);
  return (cut === Number.POSITIVE_INFINITY ? v : v.slice(0, cut)).trim();
};
const PillDetailEvent: React.FC<PillDetailEventProps> = ({
  tile,
  memberId,
  entityType,
  dentsData,
  isLoading = false,
  firstName: passedFirstName,
  lastName: passedLastName,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobileApp = useIsMobileApp();
  const contacts = useContactStore((state) => state.contacts);

  const { user: authUser } = useAuth();
  const family = useFamilyStore((state) => state.family);
  const events = useEventStore((state) => state.events);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const eventUsers = useEventUsersStore((state) => state.eventUsers);



  const matchingEvents = useMemo(() => {
    // Use DENTS data if available, otherwise fall back to store data
    if (dentsData) {
      return dentsData;
    }

    if (!events || !memberId) return [];

    return events.filter((event) => {
      return (
        event.titleId === memberId ||
        (event.HomeMembers && event.HomeMembers.includes(memberId))
      );
    });
  }, [dentsData, events, memberId]);

  // Show loading state when DENTS data is being fetched
  if (isLoading) {
    return (
      <div style={styles.providerContainer}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <CustomText>{i18n.t('LoadingEvents')}</CustomText>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.providerContainer}>
      {matchingEvents && matchingEvents.length > 0 && (
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
          <Button
            textProps={{
              text: i18n.t('AddNewEvent'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={() => {
              const tileName = sanitizeNameParam(searchParams.get('name') || '');
              const paramName = entityType === 'user' ? 'delegateUserId' :
                               entityType === 'contact' ? 'contactId' : 'tileId';
              if (isMobileApp) {
                const currentParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
                if (memberId) currentParams.set(paramName, memberId);
                if (tileName) currentParams.set('name', tileName);
                // Include names
                if (entityType === 'user') {
                  // Prefer explicitly-provided props from parent (page already loaded member)
                  let first = passedFirstName;
                  let last = passedLastName;
                  if ((!first || !last) && family && memberId) {
                    const fm = family.find((m: any) => (m.UniqueId === memberId));
                    first = first || fm?.FirstName;
                    last = last || fm?.LastName;
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                } else if (entityType === 'contact') {
                  // Prefer explicitly-provided props from parent (page already loaded contact)
                  let first = passedFirstName;
                  let last = passedLastName;
                  if ((!first || !last) && contacts) {
                    const contactId = currentParams.get('contactId') || memberId || '';
                    const contact = contacts.find(c => (c.UniqueId || c.User_uniqueId) === contactId);
                    if (contact) {
                      first = first || contact.FirstName;
                      last = last || contact.LastName;
                    }
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                }
                const deeplink = `eeva://create/event?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                router.push(`/create-event?${paramName}=${memberId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`);
              }
            }}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />
        </div>
      )}

      {!matchingEvents || matchingEvents.length === 0 ? (
        <div style={styles.emptyEventsContainer}>
          <CustomText style={styles.noEventText}>
            {i18n.t('YouHaventAddedAnyEventsYet')}
          </CustomText>
          <CustomText style={styles.addEventText}>{i18n.t('ClickTheButtonToAdd')}</CustomText>

          <Button
            textProps={{
              text: i18n.t('AddNewEvent'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={() => {
              const tileName = sanitizeNameParam(searchParams.get('name') || '');
              if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                console.log('🔗 PillDetailEvent Button Click:', {
                  memberId,
                  tileName,
                  isMobileApp,
                  searchParamsName: searchParams.get('name')
                });
              }

              const paramName = entityType === 'user' ? 'delegateUserId' :
                               entityType === 'contact' ? 'contactId' : 'tileId';

              if (isMobileApp) {
                // Start with current URL parameters to preserve context
                const currentParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
                // Set the main parameter (delegateUserId, contactId, or tileId)
                if (memberId) {
                  currentParams.set(paramName, memberId);
                }
                // Add name if available
                if (tileName) currentParams.set('name', tileName);
                // Conditionally include first/last name for user/contact
                if (entityType === 'user') {
                  // Prefer explicitly-provided props from parent (page already loaded member)
                  let first = passedFirstName;
                  let last = passedLastName;
                  if ((!first || !last) && family && memberId) {
                    const fm = family.find((m: any) => (m.UniqueId === memberId));
                    first = first || fm?.FirstName;
                    last = last || fm?.LastName;
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                } else if (entityType === 'contact') {
                  // Prefer explicitly-provided props from parent (page already loaded contact)
                  let first = passedFirstName;
                  let last = passedLastName;
                  if ((!first || !last) && contacts) {
                    const contactId = currentParams.get('contactId') || (memberId || '');
                    const contact = contacts.find(c => (c.UniqueId || c.User_uniqueId) === contactId);
                    if (contact) {
                      first = first || contact.FirstName;
                      last = last || contact.LastName;
                    }
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                }
                const deeplink = `eeva://create/event?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                const url = `/create-event?${paramName}=${memberId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('🌐 Navigating to web URL:', url);
                }
                router.push(url);
              }
            }}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              color: Colors.BLUE,
              radius: 8,
            }}
          />
        </div>
      ) : (
        <div style={styles.eventsContainer}>
          {matchingEvents
            .sort((a, b) => moment(b.CreationTimestamp).valueOf() - moment(a.CreationTimestamp).valueOf())
            .map((event, index) => {
              const date = moment(event.CreationTimestamp);
              const dateString = date.isValid()
                ? `${MONTH_NAMES[date.month()]} ${suffixifyNumber(date.date())}`
                : "";

              const matchedEventUsers = findEventUsersByEventId(
                eventUsers,
                String(event.UniqueId ?? "")
              );

              const eventUserIds = matchedEventUsers.map(
                (eventUser) => eventUser.User_FamilyMember_uniqueId
              );

              const matchedFamily = findFamilyByIds(family, eventUserIds);

              const avatarImagePaths = matchedFamily.map((member) => ({
                AvatarImagePath: member.AvatarImagePath,
                FirstName: member.FirstName,
                LastName: member.LastName,
                Email: member.EmailAddress,
              }));

              return (
                <UnifiedItemCard
                  key={event.UniqueId || event.id || `event-${index}`}
                  UniqueId={event.UniqueId || event.id || `event-${index}`}
                  Title={event.Title || (event as any).title || 'Untitled Event'}
                  Text={(event as any).Text || (event as any).text || ''}
                  type="Event"
                  Priority={(event as any).Priority ?? (event as any).priority ?? null}
                  Deadline_DateTime={(event as any).Deadline_DateTime ?? (event as any).deadlineDateTime ?? null}
                  CreationTimestamp={(event as any).CreationTimestamp ?? (event as any).creationTimestamp}
                  User_uniqueId={(event as any).User_uniqueId || (event as any).userId}
                  completed={false}
                  isAllDay={(() => {
                    const raw = (event as any).isAllDay ?? (event as any).IsAllDay;
                    if (typeof raw === 'boolean') return raw;
                    const s = (event as any).scheduledTime ?? (event as any).Scheduled_Time;
                    const e = (event as any).scheduledTimeEnd ?? (event as any).Scheduled_Time_End;
                    return s === '00:00' && e === '23:59';
                  })()}
                  onPress={() => {
                    const eventId = event.UniqueId || event.id;
                    if (eventId) {
                      const currentPath = window.location.pathname + window.location.search;
                      router.push(`/edit-event/${eventId}?returnTo=${encodeURIComponent(currentPath)}`);
                    } else {
                      console.error('Event ID not found:', event);
                    }
                  }}
                  onToggle={undefined}
                />
              );
            })}
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  providerContainer: {
    marginTop: "20px",
    paddingBottom: "20%",
    paddingLeft: 0,
    paddingRight: 0,
    marginBottom: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  eventsContainer: {
    marginBottom: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  emptyEventsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "10%",
  },
  emptyEventsIconContainer: {
    backgroundColor: "rgba(250, 78, 78, 0.1)",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "32px",
  },
  noEventText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  addEventText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
};

export default PillDetailEvent;
