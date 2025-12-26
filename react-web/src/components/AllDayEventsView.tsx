import React from "react";
import { Colors, Typography } from "../styles";
import moment from "moment";
import CustomText from "./CustomText";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useLanguageContext } from "../context/LanguageContext";

interface AllDayEventsViewProps {
  events: Record<string, any[]>;
  selectedDay: string;
}

/**
 * AllDayEventsView - A component for displaying all-day events in a horizontal list
 *
 * This component displays a horizontal scrollable list of all-day events for a selected day.
 * It shows up to 5 events and indicates if there are more with a "+X" indicator.
 *
 * @param events - Object containing events grouped by day
 * @param selectedDay - The selected day to display events for
 */
const AllDayEventsView: React.FC<AllDayEventsViewProps> = ({
  events,
  selectedDay,
}) => {
  const router = useRouter();
  const { i18n } = useLanguageContext();

  const EventScrollItem = ({ item }: { item: any }) => {
    const handlePress = () => {
      if (item.type === "event") {
        const eventId = item.UniqueId || item.id;
        if (eventId) {
          // Get current pathname to determine return route
          const currentPath = window.location.pathname;
          const returnTo = currentPath.startsWith('/time') ? '/time' : '/life';

          // Preserve mobile app parameters and add returnTo
          let url = `/edit-event/${eventId}?returnTo=${returnTo}`;
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
        // Navigate to the existing edit-task page using the task ID
        const taskId = item.UniqueId || item.id;
        if (taskId) {
          // Get current pathname to determine return route
          const currentPath = window.location.pathname;
          const returnTo = currentPath.startsWith('/time') ? '/time' : '/life';

          // Preserve mobile app parameters and add returnTo
          let url = `/edit-task/${taskId}?returnTo=${returnTo}`;
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
    };

    return (
      <div
        onClick={handlePress}
        style={{
          minWidth: "200px",
          height: "60px",
          maxWidth: "300px",
          display: "flex",
          padding: "8px 12px 8px 8px",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderRadius: "6px",
          border: "1px solid #E6E7EE",
          background: "#FFF",
          boxShadow: "0 4px 8px 0 rgba(0, 14, 80, 0.12)",
          cursor: "pointer",
        }}>
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          flex: "1 0 0",
          alignSelf: "stretch",
        }}>
          <div style={{
            width: "4px",
            alignSelf: "stretch",
            background: item.colorMark || "#8980B3",
          }} />
          <div style={{
            display: "flex",
            padding: "2px 0",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "4px",
            flex: 1,
          }}>
            <div style={{
              color: "#000E50",
              fontFamily: "Poppins",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "120%",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {item.title}
            </div>
            <div style={{
              color: "#666E96",
              fontFamily: "Poppins",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "120%",
            }}>
              {i18n.t('AllDay') || 'All Day'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredEvents =
    events[selectedDay]?.filter((event: any) => {
      // Prefer API boolean isAllDay when present; fallback to boundary check
      const apiIsAllDay = (event as any).isAllDay ?? (event as any).IsAllDay;
      const boundaryAllDay = moment(event.start).format("HH:mm") === moment().startOf("day").format("HH:mm") &&
        moment(event.end).format("HH:mm") === moment().endOf("day").format("HH:mm");
      return typeof apiIsAllDay === 'boolean' ? apiIsAllDay : boundaryAllDay;
    }) || [];

  const eventCount = filteredEvents.length;

  // Don't render anything if there are no all-day events
  if (eventCount === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.dateContainer}>
        <CustomText style={styles.dateText}>All Day</CustomText>
      </div>
      <div style={styles.eventsContainer}>
        {filteredEvents.slice(0, 5).map((item) => (
          <EventScrollItem key={`${item.id}+${uuidv4()}`} item={item} />
        ))}
        {eventCount > 5 && (
          <div style={styles.moreItems}>
            <CustomText style={styles.moreText}>{`+${eventCount - 5}`}</CustomText>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "80px",
    display: "flex",
    flexDirection: "column",
    marginRight: "24px",
    overflow: "visible", // Allow shadows to render outside container
  },
  dateContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "flex-start",
  },
  dateText: {
    color: "#666E96", // var(--Primary-Bleu-Lighter, #666E96)
    fontSize: "12px",
    fontFamily: "Poppins",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "120%", // 14.4px
    textAlign: "left", // Left aligned instead of center
  },
  eventsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    paddingRight: "24px",
    overflowX: "auto",
    overflowY: "visible", // Allow shadows to render vertically
    justifyContent: "flex-start", // Left align instead of center
  },
  moreItems: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
    borderRadius: "100px",
    width: "35px",
    height: "35px",
  },
  moreText: {
    color: Colors.WHITE,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
  },
};

export default AllDayEventsView;
