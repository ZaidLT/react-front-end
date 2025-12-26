import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";

interface SimpleTimelineItemProps {
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  onPress?: () => void;
}

/**
 * SimpleTimelineItem - A simplified version of TimelineItem for demo purposes
 * 
 * This component displays an event with its title and time range.
 * 
 * @param title - The title of the event
 * @param startTime - The start time of the event
 * @param endTime - The end time of the event
 * @param color - The color of the event
 * @param onPress - The function to call when the event is pressed
 */
const SimpleTimelineItem: React.FC<SimpleTimelineItemProps> = ({ 
  title, 
  startTime, 
  endTime, 
  color,
  onPress 
}) => {
  return (
    <div 
      onClick={onPress}
      style={{
        ...styles.container,
        borderLeftColor: color,
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
      }}
    >
      <div style={styles.topContainer}>
        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          <CustomText
            style={styles.eventTimeText}
            numberOfLines={1}
          >{`${startTime} - ${endTime}`}</CustomText>
        </div>
        <CustomText numberOfLines={1} style={styles.titleText}>
          {title}
        </CustomText>
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    height: "60px",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.05)",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: Colors.WHITE,
    overflow: 'hidden',
  },
  titleText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
  },
  topContainer: {
    flex: 1,
    paddingLeft: "10px",
    paddingRight: "10px",
    paddingTop: "8px",
    paddingBottom: "8px",
    backgroundColor: Colors.WHITE,
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  eventTimeText: {
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.DARK_GREY,
  },
};

export default SimpleTimelineItem;
