import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";

interface DateData {
  year: number;
  month: number;
  day: number;
  timestamp: number;
  dateString: string;
}

interface DayProps {
  state?: string;
  marking?: {
    customStyles?: {
      container?: React.CSSProperties;
      text?: React.CSSProperties;
    };
    dots?: Array<{
      color: string;
    }>;
  };
}

interface CalendarDayComponentProps extends DayProps {
  date?: DateData;
  onDayPress: (date: DateData | undefined) => void;
}

/**
 * CalendarDayComponent - A component for rendering a single day in a calendar
 * 
 * This component displays a day number and optional markings for events.
 * It can be in different states (normal, disabled, today) and show dots for events.
 * 
 * @param date - The date data for this day
 * @param state - The state of the day (normal, disabled, today)
 * @param marking - Marking information for the day
 * @param onDayPress - Callback function when the day is pressed
 */
const CalendarDayComponent: React.FC<CalendarDayComponentProps> = ({ 
  date, 
  state, 
  marking, 
  onDayPress 
}) => {
  return (
    <div style={styles.dayContainer}>
      <div
        onClick={() => onDayPress(date)}
        style={{
          ...styles.defaultContainer,
          ...(marking?.customStyles?.container && {
            backgroundColor: '#F0F8FF', // Light blue background
            border: `2px solid ${Colors.PRIMARY_ELECTRIC_BLUE}`,
            borderRadius: '8px',
          }),
          // Show border for today's date (like monthly view)
          ...(state === "today" && !marking?.customStyles?.container && {
            border: `1px solid ${Colors.PRIMARY_ELECTRIC_BLUE}`,
            borderRadius: '8px',
          })
        }}
      >

        <CustomText
          style={{
            ...styles.defaultDayText,
            color:
              state === "disabled"
                ? Colors.GREY_COLOR
                : marking?.customStyles?.container
                ? '#000E50'
                : '#666E96',
            opacity: state === "disabled" ? 0.4 : 1,
            fontSize: marking?.customStyles?.container ? '16px' : '16px',
            fontWeight: marking?.customStyles?.container ? 700 : 400,
            lineHeight: '120%', /* 19.2px */
          }}
        >
          {date?.day}
        </CustomText>

        {/* Render single dot for events - similar to monthly view */}
        {marking?.dots && marking.dots.length > 0 && (
          <div
            style={{
              ...styles.dot,
              backgroundColor: marking.dots[0].color,
              borderColor: marking.dots[0].color,
            }}
          />
        )}
      </div>

      {marking?.dots && marking.dots.length > 0 && (
        <div style={styles.markingDotsContainer}>
          {marking.dots.map((dot, index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                borderColor: dot.color,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  dayContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  defaultContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: "10px",
    height: "40px",
    width: "40px",
    cursor: "pointer",
  },
  defaultDayText: {
    fontFamily: 'Poppins',
    fontSize: '16px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '120%', /* 19.2px */
    textAlign: "center",
  },
  markingDotsContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    gap: "2px",
  },
  dot: {
    position: "absolute",
    bottom: "4px",
    left: "50%",
    transform: "translateX(-50%)",
    height: "4px",
    width: "4px",
    borderRadius: "50%",
    borderWidth: "1px",
    borderStyle: "solid",
  },
};

export default CalendarDayComponent;
