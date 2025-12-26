import React, { useMemo } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useNoteStore,
  useUserStore,
  useContactStore,
  useFamilyStore,
  useUserProfileStore
} from "../context/store";
import { MONTH_NAMES, suffixifyNumber } from "../util/calendar";
import moment from "moment";
import UnifiedItemCard from "./UnifiedItemCard";
import CustomText from "./CustomText";
import Icon from "./Icon";
import { INote } from "../services/types";
import { useIsMobileApp } from "../hooks/useMobileDetection";
import { useLanguageContext } from "../context/LanguageContext";

interface PillDetailsNoteProps {
  memberId?: string;
  entityType?: 'contact' | 'tile' | 'user';
  dentsData?: INote[]; // DENTS notes data
  isLoading?: boolean;
  firstName?: string;
  lastName?: string;
}

/**
 * PillDetailsNote - A component for displaying notes related to a home member
 *
 * This component shows a list of notes associated with a home member,
 * with options to add new notes.
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

const PillDetailsNote: React.FC<PillDetailsNoteProps> = ({
  memberId,
  entityType,
  dentsData,
  isLoading = false,
  firstName: passedFirstName,
  lastName: passedLastName,
}) => {
  // Language context for translations
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobileApp = useIsMobileApp();
  const { i18n } = useLanguageContext();

  // Unused variables commented out to fix lint warnings
  const family = useFamilyStore((state) => state.family);
  const notes = useNoteStore((state) => state.notes);
  const user = useUserStore((state) => state.user);
  const contacts = useContactStore((state) => state.contacts);

  const matchingNotes = useMemo(() => {
    // Use DENTS data if available, otherwise fall back to store data
    if (dentsData) {
      return dentsData;
    }

    if (!notes || !memberId) return [];

    return notes.filter((note) => {
      return (
        note.HomeMember_uniqueId === memberId ||
        (note.HomeMembers && note.HomeMembers.includes(memberId))
      );
    });
  }, [dentsData, notes, memberId]);

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
          <CustomText>{i18n.t('LoadingNotes')}</CustomText>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.providerContainer}>
      {matchingNotes && matchingNotes.length > 0 && (
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
          <Button
            textProps={{
              text: i18n.t('AddNewNote'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={() => {
              const tileName = sanitizeNameParam(searchParams.get('name') || '');
              if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                console.log('🔗 PillDetailsNote Button Click:', {
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
                  const targetId = memberId || '';
                  if ((!first || !last) && targetId) {
                    const fm = family?.find((f) => f.UniqueId === targetId);
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
                const deeplink = `eeva://create/note?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                const url = `/create-note?${paramName}=${memberId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`;
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
      )}

      {!matchingNotes || matchingNotes.length === 0 ? (
        <div style={styles.emptyNotesContainer}>
          <CustomText style={styles.noNoteText}>
            {i18n.t('YouHaventAddedAnyNotesYet')}
          </CustomText>
          <CustomText style={styles.addNoteText}>{i18n.t('ClickTheButtonToAdd')}</CustomText>

          <Button
            textProps={{
              text: i18n.t('AddNewNote'),
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.WHITE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            }}
            onButtonClick={() => {
              const tileName = sanitizeNameParam(searchParams.get('name') || '');
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
                  const targetId = memberId || '';
                  if ((!first || !last) && targetId) {
                    const fm = family?.find((f) => f.UniqueId === targetId);
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
                const deeplink = `eeva://create/note?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                router.push(`/create-note?${paramName}=${memberId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`);
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
        <div style={styles.notesContainer}>
          {matchingNotes
            .sort((a, b) => moment(b.CreationTimestamp).valueOf() - moment(a.CreationTimestamp).valueOf())
            .map((note, index) => {
              const date = moment(note.CreationTimestamp);
              const dateString = date.isValid()
                ? `${MONTH_NAMES[date.month()]} ${suffixifyNumber(date.date())}`
                : "";

              return (
                <UnifiedItemCard
                  key={note.UniqueId || (note as any).id || `note-${index}`}
                  UniqueId={note.UniqueId || (note as any).id || `note-${index}`}
                  Title={note.Title || (note as any).title || "Untitled Note"}
                  Text={note.Text || (note as any).text || `${dateString} ${date.format("LT")}`}
                  type="Note"
                  Priority={(note as any).Priority ?? (note as any).priority ?? null}
                  Deadline_DateTime={(note as any).Deadline_DateTime ?? (note as any).deadlineDateTime ?? null}
                  CreationTimestamp={(note as any).CreationTimestamp ?? (note as any).creationTimestamp}
                  User_uniqueId={(note as any).User_uniqueId || (note as any).userId}
                  onPress={() => {
                    const noteId = note.UniqueId || (note as any).id;
                    if (noteId) {
                      const currentPath = window.location.pathname + window.location.search;
                      router.push(`/edit-note/${noteId}?returnTo=${encodeURIComponent(currentPath)}`);
                    } else {
                      console.error('Note ID not found:', note);
                    }
                  }}
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
  notesContainer: {
    marginBottom: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  emptyNotesContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "10%",
  },
  emptyNotesIconContainer: {
    backgroundColor: "rgba(250, 78, 78, 0.1)",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "32px",
  },
  noNoteText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  addNoteText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
};

export default PillDetailsNote;
