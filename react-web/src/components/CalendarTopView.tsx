import React, { useState } from "react";
import { Colors, Typography } from "../styles";
import { monthNameFromISOString, MONTH_NAMES, CALENDAR_VIEW } from "../util/calendar";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";
import MenuHeader from "./MenuHeader";
import Icon from "./Icon";

interface CalendarTopViewProps {
  currentDate: string;
  onChangeView: () => void;
  onDateChange: (newDate: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  selectedView?: string;
  mobile?: boolean;
}

/**
 * CalendarTopView - A component for the top navigation of a calendar
 *
 * This component displays the current month/year with controls to change the date,
 * view type, and access calendar settings.
 *
 * @param currentDate - The current date in ISO format
 * @param onChangeView - Callback function to change the calendar view
 * @param onDateChange - Callback function to change the current date
 */
const CalendarTopView: React.FC<CalendarTopViewProps> = ({
  currentDate,
  onChangeView,
  onDateChange,
  onRefresh,
  isRefreshing = false,
  selectedView = 'calendar',
  mobile = false,
}) => {
  const { i18n } = useLanguageContext();
  const router = useRouter();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(
    monthNameFromISOString(currentDate)
  );
  const [tempSelectedYear, setTempSelectedYear] = useState(
    new Date(currentDate).getFullYear()
  );

  const monthName = monthNameFromISOString(currentDate);
  const currentYear = moment(currentDate).year();

  const togglePicker = () => {
    setTempSelectedMonth(monthNameFromISOString(currentDate));
    setTempSelectedYear(currentYear);
    setIsPickerVisible(!isPickerVisible);
  };

  const onSavePicker = () => {
    changeMonth(tempSelectedMonth, tempSelectedYear);
    setIsPickerVisible(false);
  };

  const onCancelPicker = () => {
    setIsPickerVisible(false);
  };

  const generateYears = (): number[] => {
    const currentYear = new Date().getFullYear();
    let years: number[] = [];
    for (let i = currentYear - 50; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };

  const changeMonth = (month: string, year: number) => {
    const date = moment(currentDate);
    const monthIndex = moment().month(month).month();
    date.year(year).month(monthIndex);
    const formattedDate = date.format("YYYY-MM-DD");
    onDateChange(formattedDate);
  };

  const handlePreviousMonth = () => {
    const prevMonth = moment(currentDate).subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
    onDateChange(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = moment(currentDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    onDateChange(nextMonth);
  };

  return (
    <div style={styles.container}>
      {/* Only show header and refresh button when not in mobile mode */}
      {!mobile && (
        <div
          style={{
            display: 'flex',
            width: '100%',
            paddingTop: '20px',
            paddingBottom: '20px',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Left side - empty space (no back button) */}
          <div style={{ width: '24px', height: '24px' }}></div>

          {/* Centered title */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CustomText
              style={{
                color: '#000E50',
                fontFamily: 'Poppins',
                fontSize: '20px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: 'normal',
                letterSpacing: '-0.408px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {i18n.t("Calendar")}
            </CustomText>
          </div>

          {/* Right side - empty space to balance layout */}
          <div style={{ width: '24px', height: '24px' }}></div>
        </div>
      )}
      <div style={{
        ...styles.optionsContainer,
        marginTop: '0px', // Removed 16px margin to reduce spacing
        marginBottom: '16px', // 16px to calendar/time view
      }}>
        <div style={styles.leftSection}>
          {/* Previous Month Chevron */}
          <button
            onClick={handlePreviousMonth}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Previous month"
          >
            <Icon name="chevron-left" width={20} height={20} color={Colors.BLUE} />
          </button>

          {/* Month Display - Clickable to open modal */}
          <div style={styles.monthContainer} onClick={togglePicker}>
            <CustomText style={{
              color: '#000E50',
              fontFamily: 'Poppins',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '120%', /* 19.2px */
            }}>
              {moment(currentDate).format('MMM YYYY')}
            </CustomText>
            <div style={styles.backArrow}>
              <img
                src="/icons/icon-menu-back.svg"
                width={15}
                height={15}
                alt="Dropdown"
              />
            </div>
          </div>

          {/* Next Month Chevron */}
          <button
            onClick={handleNextMonth}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Next month"
          >
            <Icon name="chevron-right" width={20} height={20} color={Colors.BLUE} />
          </button>
        </div>
        <div style={styles.rightSection}>
          <div
            onClick={() => {
              const today = moment().format("YYYY-MM-DD");
              onDateChange(today);
            }}
            style={{ cursor: 'pointer' }}
            title="Jump to today"
          >
            <img
              src="/icons/time/icon-time-calendar.svg"
              width={24}
              height={24}
              alt="Calendar"
            />
          </div>
          <div onClick={onChangeView} style={{ cursor: 'pointer' }}>
            {selectedView === CALENDAR_VIEW.calendar ? (
              // Show weekly icon when in monthly view (clicking will switch to weekly)
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Week view - horizontal lines */}
                <line x1="6" y1="14" x2="18" y2="14" stroke={Colors.BLUE} strokeWidth="1.5"/>
                <line x1="6" y1="17" x2="18" y2="17" stroke={Colors.BLUE} strokeWidth="1.5"/>
                <line x1="6" y1="20" x2="18" y2="20" stroke={Colors.BLUE} strokeWidth="1.5"/>
              </svg>
            ) : (
              // Show monthly icon when in weekly view (clicking will switch to monthly)
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Monthly view - grid dots */}
                <circle cx="7" cy="14" r="1" fill={Colors.BLUE}/>
                <circle cx="12" cy="14" r="1" fill={Colors.BLUE}/>
                <circle cx="17" cy="14" r="1" fill={Colors.BLUE}/>
                <circle cx="7" cy="18" r="1" fill={Colors.BLUE}/>
                <circle cx="12" cy="18" r="1" fill={Colors.BLUE}/>
                <circle cx="17" cy="18" r="1" fill={Colors.BLUE}/>
              </svg>
            )}
          </div>
          {/* In mobile mode, show refresh icon instead of settings icon */}
          {mobile && onRefresh ? (
            <div
              onClick={onRefresh}
              style={{
                cursor: 'pointer',
                opacity: isRefreshing ? 0.6 : 1,
              }}
              title="Refresh calendar data"
            >
              <img
                src="/icons/time/icon-time-refresh.svg"
                width={24}
                height={24}
                alt="Refresh"
                style={{
                  transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                  transition: 'transform 0.8s ease'
                }}
              />
            </div>
          ) : !mobile ? (
            <div onClick={() => router.push("/calendars")} style={{ cursor: 'pointer' }}>
              <img
                src="/icons/time/icon-time-settings.svg"
                width={24}
                height={24}
                alt="Settings"
              />
            </div>
          ) : null}
          {/* Refresh button - always show in non-mobile mode, positioned after settings */}
          {!mobile && onRefresh && (
            <div
              onClick={onRefresh}
              style={{
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                opacity: isRefreshing ? 0.6 : 1,
              }}
              title="Refresh calendar data"
            >
              <img
                src="/icons/time/icon-time-refresh.svg"
                width={24}
                height={24}
                alt="Refresh"
                style={{
                  transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)',
                  transition: 'transform 0.8s ease'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {isPickerVisible && (
        <div style={styles.pickerOverlay} onClick={onCancelPicker}>
          <div style={styles.pickerContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.pickersRow}>
              <select
                value={tempSelectedMonth}
                onChange={(e) => setTempSelectedMonth(e.target.value)}
                style={styles.picker}
              >
                {MONTH_NAMES.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={tempSelectedYear.toString()}
                onChange={(e) => setTempSelectedYear(Number(e.target.value))}
                style={styles.picker}
              >
                {generateYears().map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.modalButtonsContainer}>
              <button style={styles.saveButton} onClick={onSavePicker}>
                <CustomText style={styles.buttonText}>{i18n.t("Save")}</CustomText>
              </button>
              <button style={styles.cancelButton} onClick={onCancelPicker}>
                <CustomText style={styles.buttonText}>{i18n.t("Cancel")}</CustomText>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },
  headerContainer: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  monthContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
    minWidth: "100px",
    justifyContent: "center",
  },
  monthText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.BLUE,
  },
  backArrow: {
    transform: "rotate(-90deg)",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  leftSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  rightSection: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "10px",
  },
  avatarContainer: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as React.CSSProperties,
  pickerOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: "white",
    width: "80%",
    maxWidth: "400px",
    borderRadius: "10px",
    padding: "20px",
  },
  pickersRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    padding: "8px",
    margin: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  modalButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  saveButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    backgroundColor: Colors.BLUE,
    borderRadius: "5px",
    marginRight: "5px",
    border: "none",
    cursor: "pointer",
  },
  cancelButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    backgroundColor: "grey",
    borderRadius: "5px",
    marginLeft: "5px",
    border: "none",
    cursor: "pointer",
  },
  buttonText: {
    color: "white",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
  },
};

export default CalendarTopView;
