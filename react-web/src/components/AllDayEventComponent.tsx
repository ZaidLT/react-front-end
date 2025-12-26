import React from "react";
import { Colors, Typography } from "../styles";
import { convertTimeToProperFormat } from "../util/calendar";
import { ICalendarItem } from "../util/types";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import CustomText from "./CustomText";

interface AllDayEventComponentProps {
  item: ICalendarItem;
  hideTime?: boolean;
}

/**
 * AllDayEventComponent - A component for displaying all-day events in a calendar
 * 
 * This component displays an all-day event with its title and optionally its time range.
 * When clicked, it navigates to the event or task detail page.
 * 
 * @param item - The calendar item to display
 * @param hideTime - Whether to hide the time display
 */
const AllDayEventComponent: React.FC<AllDayEventComponentProps> = ({ 
  item, 
  hideTime = false 
}) => {
  const navigate = useNavigate();

  const handlePress = () => {
    if (item.type === "event") {
      if (item.originalDetails) {
        navigate(`/saved-event?fwdEvent=${encodeURIComponent(JSON.stringify({
          ...item.originalDetails,
        }))}`);
      } else {
        navigate(`/saved-event?fwdEvent=${encodeURIComponent(JSON.stringify({
          Title: item.title,
          Text: item.summary,
          UniqueId: item.id,
          Deadline_DateTime: item.deadlineDateTime,
          Scheduled_Time: item.start,
          Scheduled_Time_End: item.end,
          Priority: item.Priority,
          Reminder_Each_X_Days: item.Reminder_Each_X_Days,
          Reminder_Each_X_Months: item.Reminder_Each_X_Months,
          Reminder_Each_X_Weeks: item.Reminder_Each_X_Weeks,
          ImportEventId: item.ImportEventId,
          RecurringFreq: item.RecurringFreq,
          BlackListed_Family: item?.BlackListed_Family ?? [],
        }))}`);
      }
    } else if (item.type === "task") {
      // In a real implementation, we would use a task store to find the matched task
      const fallbackTask = {
        Title: item.title,
        Text: item.summary,
        Active: item.Active,
        UniqueId: item.UniqueId,
        Deadline_DateTime: item.deadlineDateTime,
        Scheduled_Time: moment(item.start).format("HH:mm"),
        Scheduled_Time_End: moment(item.end).format("HH:mm"),
        ...(item?.HomeMember_uniqueId && {
          HomeMember_uniqueId: item.HomeMember_uniqueId,
        }),
        Priority: item.Priority,
        Reminder_Each_X_Days: item.Reminder_Each_X_Days,
        Reminder_Each_X_Months: item.Reminder_Each_X_Months,
        Reminder_Each_X_Weeks: item.Reminder_Each_X_Weeks,
        RecurringFreq: item.RecurringFreq,
        BlackListed_Family: item?.BlackListed_Family ?? [],
      };
      
      navigate(`/saved-task?fwdTask=${encodeURIComponent(JSON.stringify(fallbackTask))}`);
    }
  };

  return (
    <div 
      onClick={handlePress}
      style={{
        ...styles.container,
        backgroundColor: item.color,
      }}
    >
      <div style={styles.topContainer}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {!hideTime && (
            <CustomText
              style={styles.eventTimeText}
              numberOfLines={1}
            >{`${convertTimeToProperFormat(
              item.start
            )} - ${convertTimeToProperFormat(item.end)}`}</CustomText>
          )}
        </div>
        <CustomText numberOfLines={1} style={styles.titleText}>
          {item.title || item.summary || ""}
        </CustomText>
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "41px",
    borderColor: Colors.BLUE,
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "5px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.15)",
    cursor: "pointer",
  },
  titleText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.BLUE,
  },
  topContainer: {
    flex: 1,
    paddingLeft: "10px",
    paddingRight: "10px",
    paddingTop: "5px",
    paddingBottom: "5px",
    marginLeft: "5px",
    borderRadius: "10px",
  },
  moreHoriz: {
    display: "flex",
    backgroundColor: Colors.WHITE,
    height: "100%",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  },
  eventTimeText: {
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    flex: 1,
  },
};

export default AllDayEventComponent;
