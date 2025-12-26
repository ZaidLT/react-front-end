import React, { useMemo, useState } from "react";
import { Colors, Typography } from "../styles";
import { useRouter } from "next/navigation";
import {
  useEventUsersStore,
  useFamilyStore,
  useNoteStore
} from "../context/store";
import { INestedTile } from "../util/types";
import { MONTH_NAMES, suffixifyNumber } from "../util/calendar";
import { findEventUsersByEventId, findFamilyByIds } from "../util/constants";
// Utility functions
import moment from "moment";
import Button from "./Button";
import HouseHiveBlankState from "./HouseHiveBlankState";
import ListViewCard from "./ListViewCard";
import CustomText from "./CustomText";

interface PillDetailsNoteProps {
  tile: INestedTile | undefined;
  memberId?: string;
  entityType?: 'contact' | 'tile' | 'user';
}

/**
 * PillDetailsNote - A component for displaying notes related to a home member
 *
 * This component shows a list of notes associated with a home member,
 * with options to create new notes.
 *
 * @param tile - The tile object representing the home member
 * @param memberId - The ID of the member
 */
const PillDetailsNote: React.FC<PillDetailsNoteProps> = ({
  tile,
  memberId,
  entityType,
}) => {
  // Language context for translations
  const router = useRouter();

  const defaultNotes = useNoteStore((state) => state.notes);
  const eventUsers = useEventUsersStore((state) => state.eventUsers);
  const family = useFamilyStore((state) => state.family);

  const [sortedNote] = useState<any[]>([]);

  const filterNote = (sortedNote?.length ? sortedNote : defaultNotes).filter(
    (note: any) =>
      (note.Active && note.HomeMembers?.includes(tile?.UniqueId)) ||
      note.HomeMember_uniqueId === tile?.UniqueId
  );

  const userNotes = useMemo(
    () =>
      (sortedNote?.length ? sortedNote : defaultNotes).filter((note) => {
        // Get all the event users associated with the current note
        const matchedEventUsers = findEventUsersByEventId(
          eventUsers,
          note.UniqueId ?? ""
        );

        // Extract the user IDs from the event users
        const eventUserIds = matchedEventUsers.map(
          (eventUser) => eventUser.User_FamilyMember_uniqueId
        );

        const selectedUserId = memberId ?? "";

        // If the note is part of the event, return it only if the selected user is in the eventUserIds
        const isUserInEvent = eventUserIds.includes(selectedUserId);

        // If the note is not part of the event, return it only if it directly matches the user's UniqueId
        const isUserDirectlyAssigned = note.User_uniqueId === selectedUserId;

        // Ensure notes not related to the event are filtered out unless assigned directly to the user
        return (
          isUserInEvent || (!matchedEventUsers.length && isUserDirectlyAssigned)
        );
      }),
    [sortedNote, defaultNotes, eventUsers, memberId]
  );

  const displayNotes = userNotes.length > 0 ? userNotes : filterNote;

  return (
    <div style={styles.mainContainer}>
      {displayNotes.length > 0 && (
        <>
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
            <Button
              textProps={{
                text: "Create note",
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.BLUE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              onButtonClick={() => {
                {
                  const paramName = entityType === 'user' ? 'delegateUserId' :
                                   entityType === 'contact' ? 'contactId' : 'tileId';
                  const id = memberId || tile?.UniqueId;
                  router.push(`/create-note?${paramName}=${id}`);
                }
              }}
              backgroundColor={Colors.WHITE_LILAC}
              borderProps={{
                width: 1,
                color: Colors.WHITE_LILAC,
                radius: 8,
              }}
            />
          </div>

          <div style={styles.taskHeader}>
            <CustomText style={styles.taskHeading}>
              All Notes({displayNotes.length})
            </CustomText>
          </div>
        </>
      )}

      {displayNotes.length === 0 ? (
        <HouseHiveBlankState
          heading="You haven't created any note yet"
          subHeading="click the button to create"
          buttonText={"Create Note"}
          onButtonPress={() => {
            const paramName = entityType === 'user' ? 'delegateUserId' :
                             entityType === 'contact' ? 'contactId' : 'tileId';
            const id = memberId || tile?.UniqueId;
            router.push(`/create-note?${paramName}=${id}`);
          }}
        />
      ) : (
        <div style={styles.notesContainer}>
          {displayNotes.map((note) => {
            const date = moment(note.UpdateTimestamp);
            const dateString = date.isValid()
              ? `${MONTH_NAMES[date.month()]} ${suffixifyNumber(date.date())}`
              : "";

            const matchedEventUsers = findEventUsersByEventId(
              eventUsers,
              note.UniqueId ?? ""
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
              <ListViewCard
                key={note.UniqueId}
                nameNote={note.Title}
                type={"Note"}
                priority={note.Priority || 4}
                avatar={avatarImagePaths}
                date={dateString}
                time={date.format("LT")}
                timeCreationText={"Updated"}
                isShowItemTile={true}
                item={note}
                description={note?.Text}
                onPress={() => {
                  const currentPath = window.location.pathname + window.location.search;
                  navigate(`/edit-note/${note.UniqueId}?returnTo=${encodeURIComponent(currentPath)}`);
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
  mainContainer: {
    marginTop: "20px",
    paddingBottom: "20%",
    paddingLeft: "20px",
    paddingRight: "20px",
    marginBottom: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  taskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "row",
    padding: "10px",
  },
  taskHeading: {
    color: Colors.BLUE,
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
  },
  notesContainer: {
    marginBottom: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default PillDetailsNote;
