import React from "react";
import { Colors, Typography } from "../styles";
import Toggle from "./Toggle";
import moment from "moment";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import Icon from "./Icon";

interface DateTimeSelectionViewProps {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  allDayActive: boolean;
  onDatePressed: () => void;
  onTimePressed: () => void;
  setIsStartTime: (value: boolean) => void;
  setIsAllDayActive: (value: boolean) => void;
}

/**
 * DateTimeSelectionView - A component for selecting date and time ranges
 * 
 * This component allows users to select start and end dates and times for events,
 * with an option to toggle all-day events.
 * 
 * @param startDate - The start date in MM-DD-YYYY format
 * @param endDate - The end date in MM-DD-YYYY format
 * @param startTime - The start time
 * @param endTime - The end time
 * @param allDayActive - Whether the event is an all-day event
 * @param onDatePressed - Callback function when a date field is pressed
 * @param onTimePressed - Callback function when a time field is pressed
 * @param setIsStartTime - Function to set whether the start or end time is being edited
 * @param setIsAllDayActive - Function to toggle the all-day status
 */
const DateTimeSelectionView: React.FC<DateTimeSelectionViewProps> = ({
  onDatePressed,
  onTimePressed,
  startDate,
  endDate,
  startTime,
  endTime,
  allDayActive,
  setIsStartTime,
  setIsAllDayActive,
}) => {
  const { i18n } = useLanguageContext();
  
  return (
    <div style={styles.container}>
      <div
        style={styles.allDayContainer}
        onClick={() => setIsAllDayActive(!allDayActive)}
      >
        <CustomText style={{ ...styles.subHeadingText, flex: 1 }}>
          {i18n.t('AllDay')}
        </CustomText>
        <Toggle
          isActive={allDayActive}
          containerStyle={{
            ...styles.toggleContainer,
            borderColor: allDayActive ? "#2DBE2A" : Colors.BLUE_GREY,
            backgroundColor: allDayActive ? "#2DBE2A" : Colors.BLUE_GREY,
          }}
          thumbStyle={styles.toggleThumb}
        />
      </div>

      <div>
        <div style={styles.dateTimeContainer}>
          <CustomText style={styles.subHeadingText}>{i18n.t('Start')}</CustomText>
          <div style={{ flex: 1 }}>
            <div 
              style={styles.menuItem}
              onClick={() => {
                onDatePressed && onDatePressed();
                setIsStartTime(true);
              }}
            >
              <Icon name="calendar" width={24} height={24} />
              <CustomText style={styles.menuItemText}>
                {moment(startDate, "MM-DD-YYYY").format("ddd, MMM D") || ""}
              </CustomText>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {!allDayActive && (
              <div 
                style={styles.menuItem}
                onClick={() => {
                  onTimePressed && onTimePressed();
                  setIsStartTime(true);
                }}
              >
                <Icon name="clock-alarm" width={24} height={24} />
                <CustomText style={styles.menuItemText}>
                  {startTime || ""}
                </CustomText>
              </div>
            )}
          </div>
        </div>
        <div style={styles.dateTimeContainer}>
          <CustomText style={styles.subHeadingText}>{i18n.t('End')}</CustomText>
          <div style={{ flex: 1 }}>
            <div 
              style={styles.menuItem}
              onClick={() => {
                onDatePressed && onDatePressed();
                setIsStartTime(false);
              }}
            >
              <Icon name="calendar" width={24} height={24} />
              <CustomText style={styles.menuItemText}>
                {moment(endDate, "MM-DD-YYYY").format("ddd, MMM D") || i18n.t('SelectDate')}
              </CustomText>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {!allDayActive && (
              <div 
                style={styles.menuItem}
                onClick={() => {
                  onTimePressed && onTimePressed();
                  setIsStartTime(false);
                }}
              >
                <Icon name="clock-alarm" width={24} height={24} />
                <CustomText style={styles.menuItemText}>
                  {endTime || ""}
                </CustomText>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: { 
    display: "flex",
    flexDirection: "column",
    gap: "20px", 
    marginTop: "20px" 
  },
  subHeadingText: {
    color: Colors.BLUE,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    width: "50px",
  },
  toggleContainer: {
    width: "35px",
    height: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
  },
  toggleThumb: {
    width: "10px",
    height: "10px",
    backgroundColor: Colors.WHITE,
    borderRadius: "10px",
    margin: "0 3px",
  },
  allDayContainer: { 
    display: "flex", 
    flexDirection: "row", 
    alignItems: "center",
    cursor: "pointer",
  },
  dateTimeContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "30px",
  },
  menuItem: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    cursor: "pointer",
  },
  menuItemText: {
    color: Colors.BLUE,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
};

export default DateTimeSelectionView;
