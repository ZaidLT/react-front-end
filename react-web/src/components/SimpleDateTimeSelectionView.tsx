import React, { useState } from "react";
import { Colors, Typography } from "../styles";
import Toggle from "./Toggle";
import moment from "moment";
import CustomText from "./CustomText";
import Icon from "./Icon";
import { useLanguageContext } from '../context/LanguageContext';

interface SimpleDateTimeSelectionViewProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange?: (date: Date) => void;
  onEndDateChange?: (date: Date) => void;
  onStartTimeChange?: (time: string) => void;
  onEndTimeChange?: (time: string) => void;
}

/**
 * SimpleDateTimeSelectionView - A simplified version of DateTimeSelectionView for demo purposes
 * 
 * This component displays date and time selection fields for events.
 * 
 * @param startDate - The start date
 * @param endDate - The end date
 * @param onStartDateChange - Callback for start date changes
 * @param onEndDateChange - Callback for end date changes
 * @param onStartTimeChange - Callback for start time changes
 * @param onEndTimeChange - Callback for end time changes
 */
const SimpleDateTimeSelectionView: React.FC<SimpleDateTimeSelectionViewProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  const { i18n } = useLanguageContext();
  const [allDayActive, setAllDayActive] = useState(false);
  
  return (
    <div style={styles.container}>
      <div
        style={styles.allDayContainer}
        onClick={() => setAllDayActive(!allDayActive)}
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
              onClick={() => onStartDateChange && onStartDateChange(startDate)}
            >
              <Icon name="calendar" width={24} height={24} />
              <CustomText style={styles.menuItemText}>
                {moment(startDate).format("ddd, MMM D")}
              </CustomText>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {!allDayActive && (
              <div 
                style={styles.menuItem}
                onClick={() => onStartTimeChange && onStartTimeChange(moment(startDate).format("HH:mm"))}
              >
                <Icon name="clock-alarm" width={24} height={24} />
                <CustomText style={styles.menuItemText}>
                  {moment(startDate).format("HH:mm")}
                </CustomText>
              </div>
            )}
          </div>
        </div>
        <div style={styles.dateTimeContainer}>
          <CustomText style={styles.subHeadingText}>End</CustomText>
          <div style={{ flex: 1 }}>
            <div 
              style={styles.menuItem}
              onClick={() => onEndDateChange && onEndDateChange(endDate)}
            >
              <Icon name="calendar" width={24} height={24} />
              <CustomText style={styles.menuItemText}>
                {moment(endDate).format("ddd, MMM D")}
              </CustomText>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {!allDayActive && (
              <div 
                style={styles.menuItem}
                onClick={() => onEndTimeChange && onEndTimeChange(moment(endDate).format("HH:mm"))}
              >
                <Icon name="clock-alarm" width={24} height={24} />
                <CustomText style={styles.menuItemText}>
                  {moment(endDate).format("HH:mm")}
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

export default SimpleDateTimeSelectionView;
