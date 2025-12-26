import React, { useMemo } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useContactFileStore,
  useEventUsersStore,
  useFamilyStore,
  useFileStore,
  useMemberFileStore,
  useTileFileStore
  // useUserStore - Unused
} from "../context/store";
import { emitSnackbar, getMatchingFiles } from "../util/helpers";
import { findEventUsersByEventId, findFamilyByIds } from "../util/constants";
import { MONTH_NAMES, suffixifyNumber } from "../util/calendar";
import { useLanguageContext } from "../context/LanguageContext";
import moment from "moment";
import UnifiedItemCard from "./UnifiedItemCard";
import CustomText from "./CustomText";
import Icon from "./Icon";
import { FileWithBlacklist } from "../services/dentsService";
import { useIsMobileApp } from "../hooks/useMobileDetection";
import { useContactStore } from "../context/store";

interface PillDetailDocsProps {
  addFilePressed: () => void;
  homeMemberId?: string;
  entityType?: 'contact' | 'tile' | 'user';
  dentsData?: FileWithBlacklist[]; // DENTS files data
  isLoading?: boolean;
  firstName?: string;
  lastName?: string;
}

/**
 * PillDetailDocs - A component for displaying documents related to a home member
 *
 * This component shows a list of documents associated with a home member,
 * with options to add new documents.
 *
 * @param addFilePressed - Callback function when the add file button is pressed
 * @param homeMemberId - The ID of the home member
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

const PillDetailDocs: React.FC<PillDetailDocsProps> = ({
  homeMemberId,
  entityType,
  addFilePressed, // eslint-disable-line @typescript-eslint/no-unused-vars
  dentsData,
  isLoading = false,
  firstName: passedFirstName,
  lastName: passedLastName,
}) => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobileApp = useIsMobileApp();
  const contacts = useContactStore((state) => state.contacts);

  const family = useFamilyStore((state) => state.family);
  const tileFiles = useTileFileStore((state) => state.tileFiles);
  const memberFiles = useMemberFileStore((state) => state.memberFiles);
  const contactFiles = useContactFileStore((state) => state.contactFiles);
  const files = useFileStore((state) => state.files);
  const eventUsers = useEventUsersStore((state) => state.eventUsers);

  const matchingTileFiles = useMemo(
    () => getMatchingFiles(tileFiles, "HomeMember_UniqueId", files, homeMemberId),
    [tileFiles, homeMemberId, files]
  );

  const matchingMemberFiles = useMemo(
    () => getMatchingFiles(memberFiles, "AffectedUser_UniqueId", files, homeMemberId),
    [memberFiles, homeMemberId, files]
  );

  const matchingContactFiles = useMemo(
    () => getMatchingFiles(contactFiles, "Contact_UniqueId", files, homeMemberId),
    [contactFiles, homeMemberId, files]
  );

  const displayDocs = useMemo(() => {
    // Use DENTS data if available, otherwise fall back to store data
    if (dentsData) {
      return dentsData;
    }

    return matchingMemberFiles.length > 0
      ? matchingMemberFiles
      : matchingContactFiles.length > 0
      ? matchingContactFiles
      : matchingTileFiles;
  }, [dentsData, matchingMemberFiles, matchingContactFiles, matchingTileFiles]);

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
          <CustomText>{i18n.t('LoadingDocuments')}</CustomText>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.providerContainer}>
      {displayDocs && displayDocs.length > 0 && (
        <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
          <Button
            textProps={{
              text: i18n.t('AddNewFile'),
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
                if (homeMemberId) {
                  currentParams.set(paramName, homeMemberId);
                }
                // Add name if available
                if (tileName) currentParams.set('name', tileName);
                // Conditionally include first/last name for user/contact
                if (entityType === 'user') {
                  // Prefer explicitly-provided props from parent (page already loaded member)
                  let first = passedFirstName;
                  let last = passedLastName;
                  const targetId = homeMemberId || '';
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
                    const contactId = currentParams.get('contactId') || (homeMemberId || '');
                    const contact = contacts.find(c => (c.UniqueId || c.User_uniqueId) === contactId);
                    if (contact) {
                      first = first || contact.FirstName;
                      last = last || contact.LastName;
                    }
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                }
                const deeplink = `eeva://create/document?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                router.push(`/create-doc?${paramName}=${homeMemberId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`);
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

      {!displayDocs || displayDocs.length === 0 ? (
        <div style={styles.emptyDocsContainer}>
          <CustomText style={styles.noDocText}>
            {i18n.t('YouHaventAddedAnyDocumentsYet')}
          </CustomText>
          <CustomText style={styles.addDocText}>{i18n.t('ClickTheButtonToAdd')}</CustomText>

          <Button
            textProps={{
              text: i18n.t("AddNewFile"),
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
                if (homeMemberId) {
                  currentParams.set(paramName, homeMemberId);
                }
                // Add name if available
                if (tileName) currentParams.set('name', tileName);
                // Conditionally include first/last name for user/contact
                if (entityType === 'user') {
                  // Prefer explicitly-provided props from parent (page already loaded member)
                  let first = passedFirstName;
                  let last = passedLastName;
                  const targetId = homeMemberId || '';
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
                    const contactId = currentParams.get('contactId') || (homeMemberId || '');
                    const contact = contacts.find(c => (c.UniqueId || c.User_uniqueId) === contactId);
                    if (contact) {
                      first = first || contact.FirstName;
                      last = last || contact.LastName;
                    }
                  }
                  if (first) currentParams.set('firstName', first);
                  if (last) currentParams.set('lastName', last);
                }
                const deeplink = `eeva://create/document?${currentParams.toString()}`;
                if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
                  console.log('📱 Opening mobile deeplink (with passthrough params):', deeplink, { params: Array.from(currentParams.entries()) });
                }
                window.location.href = deeplink;
              } else {
                router.push(`/create-doc?${paramName}=${homeMemberId}${tileName ? `&name=${encodeURIComponent(tileName)}` : ''}`);
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
        <div style={styles.docsContainer}>
          {displayDocs
            .sort((a, b) => {
              const getTs = (d: any) => {
                const raw = d?.CreationTimestamp || d?.creationTimestamp || d?.created || d?.createdAt || d?.UpdateTimestamp || d?.updateTimestamp;
                const m = raw ? moment(raw) : null;
                return m && m.isValid() ? m.valueOf() : 0;
              };
              return getTs(b) - getTs(a);
            })
            .map((doc, index) => {
              const url = (doc as any).FileURL || (doc as any).fileUrl || (doc as any).url;
              const docName = (doc as any).Filename || (doc as any).FileName || (doc as any).filename || (doc as any).originalFilename || 'Document';
              const rawTs = (doc as any).CreationTimestamp || (doc as any).creationTimestamp || (doc as any).created || (doc as any).createdAt;
              const date = moment(rawTs);
              const dateString = date.isValid()
                ? `${MONTH_NAMES[date.month()]} ${suffixifyNumber(date.date())}`
                : "";

              const matchedEventUsers = findEventUsersByEventId(
                eventUsers,
                String(doc.UniqueId ?? "")
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
                  key={doc.UniqueId || doc.id || `doc-${index}`}
                  UniqueId={doc.UniqueId || doc.id || `doc-${index}`}
                  Title={docName}
                  Text={`${dateString} ${date.format("LT")} - Uploaded`}
                  type="Document"
                  Priority={null}
                  Deadline_DateTime={(doc as any).Deadline_DateTime ?? (doc as any).deadlineDateTime ?? null}
                  CreationTimestamp={(doc as any).CreationTimestamp ?? (doc as any).creationTimestamp}
                  User_uniqueId={(doc as any).User_uniqueId || (doc as any).userId}
                  onPress={async () => {
                    try {
                      router.push(`/document-viewer?fwdDoc=${encodeURIComponent(JSON.stringify({
                        UniqueIdForFile: doc?.UniqueId,
                        HomeMember_UniqueId: homeMemberId,
                        FileName: doc?.Filename,
                        url: encodeURIComponent(url as string),
                      }))}`);
                    } catch {
                      emitSnackbar({
                        message: <CustomText>{i18n.t('SomethingWentWrongTryAgainLater')}</CustomText>,
                        type: "error",
                        duration: 3000,
                      });
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
  docsContainer: {
    marginBottom: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  emptyDocsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    marginBottom: "10%",
  },
  emptyDocsIconContainer: {
    backgroundColor: "rgba(250, 78, 78, 0.1)",
    width: "42px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "32px",
  },
  noDocText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
  },
  addDocText: {
    color: Colors.MIDNIGHT,
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
};

export default PillDetailDocs;
