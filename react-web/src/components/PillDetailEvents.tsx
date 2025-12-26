import React, { useMemo, useState } from "react";
import { Colors, Typography } from "../styles";
import { useNavigate } from "react-router-dom";
import {
  useEventStore,
  useEventUsersStore,
  useFamilyStore
} from "../context/store";
import { IEEvent } from "../services/types";
import HouseHiveBlankState from "./HouseHiveBlankState";
import { MONTH_NAMES, suffixifyNumber } from "../util/calendar";
import { findEventUsersByEventId } from "../util/constants";
// Utility functions
import moment from "moment";
import Button from "./Button";
import ListViewCard from "./ListViewCard";
import CustomText from "./CustomText";

interface PillDetailEventProps {
  tile: any;
  memberId?: string;
}

/**
 * PillDetailEvent - A component for displaying events related to a home member
 *
 * This component shows a list of events associated with a home member,
 * with options to create new events.
 *
 * @param tile - The tile object representing the home member
 * @param memberId - The ID of the member
 */
const PillDetailEvent: React.FC<PillDetailEventProps> = ({
  tile,
  memberId,
}) => {
  // Language context for translations
  const navigate = useNavigate();

  const defaultEvents = useEventStore((state) => state.events);
  const eventUsers = useEventUsersStore((state) => state.eventUsers);
  const family = useFamilyStore((state) => state.family);

  const [sortedEvents] = useState<IEEvent[]>([]);

  const filterTask = (
    sortedEvents?.length > 0 ? sortedEvents : defaultEvents
  ).filter(
    (event: IEEvent) =>
      event.HomeMembers?.includes(tile?.UniqueId) ||
      event.titleId === tile?.UniqueId
  );

  const userEvent = useMemo(
    () =>
      (sortedEvents?.length > 0 ? sortedEvents : defaultEvents).filter(
        (event) => {
          // Get all the event users associated with the current event
          const matchedEventUsers = findEventUsersByEventId(
            eventUsers,
            event.UniqueId ?? ""
          );

          // Extract the user IDs from the event users
          const eventUserIds = matchedEventUsers.map(
            (eventUser) => eventUser.User_FamilyMember_uniqueId
          );

          // If the event has participants, return it only if the selected user is part of the eventUserIds
          const isUserInEvent = eventUserIds.includes(memberId ?? "");

          // If the event has no participants, return it only if it's directly assigned to the selected user
          const isUserDirectlyAssigned = event.User_uniqueId === memberId;

          // Ensure events not related to the event users are filtered out unless directly assigned to the user
          return (
            isUserInEvent ||
            (!matchedEventUsers.length && isUserDirectlyAssigned)
          );
        }
      ),
    [sortedEvents, defaultEvents, eventUsers, memberId]
  );

  // Prefer userEvent if it has data, otherwise fall back to filterTask
  const displayEvents = userEvent.length > 0 ? userEvent : filterTask;

  return (
    <div style={styles.mainContainer}>
      {displayEvents.length > 0 ? (
        <>
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "center" }}>
            <Button
              textProps={{
                text: "Create Event",
                fontSize: Typography.FONT_SIZE_16,
                color: Colors.BLUE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              }}
              backgroundColor={Colors.WHITE_LILAC}
              borderProps={{
                width: 1,
                color: Colors.WHITE_LILAC,
                radius: 8,
              }}
              onButtonClick={() => {
                navigate(`/create-event${tile ? `?homeMemberId=${tile.UniqueId}` : ''}${memberId ? `&memberId=${memberId}` : ''}`);
              }}
            />
          </div>

          <div style={styles.taskHeader}>
            <CustomText style={styles.taskHeading}>
              All Event({displayEvents.length})
            </CustomText>
          </div>

          <div style={styles.eventsContainer}>
            {displayEvents.map((event) => {
              const date = moment(event.Deadline_DateTime);
              const dateString = date.isValid()
                ? `${MONTH_NAMES[date.month()]} ${suffixifyNumber(date.date())}`
                : "";

              const avatarImagePaths = family
                .filter((user) => user.UniqueId === event.User_uniqueId)
                .map((member) => ({
                  AvatarImagePath: member.AvatarImagePath,
                  FirstName: member.FirstName,
                  LastName: member.LastName,
                  Email: member.EmailAddress,
                }));

              return (
                <ListViewCard
                  key={`${event.UniqueId}-${moment().valueOf()}`}
                  nameNote={event.Title || 'Untitled Event'}
                  type={"Event"}
                  priority={event?.Priority || 4}
                  avatar={avatarImagePaths}
                  date={dateString}
                  time={date.format("LT")}
                  timeCreationText={"Due"}
                  isComplete={event.Active}
                  description={event?.Text}
                  isShowItemTile={true}
                  item={event}
                  onPress={() => {
                    const eventId = event.UniqueId || event.id;
                    if (eventId) {
                      const currentPath = window.location.pathname + window.location.search;
                      navigate(`/edit-event/${eventId}?returnTo=${encodeURIComponent(currentPath)}`);
                    } else {
                      console.warn('Event missing UniqueId/id:', event);
                    }
                  }}
                />
              );
            })}
          </div>
        </>
      ) : (
        <HouseHiveBlankState
          heading="You haven't created any event yet"
          subHeading="click the button to create"
          buttonText={"Add Event"}
          onButtonPress={() => {
            navigate(`/create-event${tile ? `?homeMemberId=${tile.UniqueId}` : ''}${memberId ? `&memberId=${memberId}` : ''}`);
          }}
        />
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  mainContainer: {
    marginTop: "20px",
    width: "100%",
    paddingLeft: "20px",
    paddingRight: "20px",
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
  eventsContainer: {
    marginBottom: "5%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default PillDetailEvent;
