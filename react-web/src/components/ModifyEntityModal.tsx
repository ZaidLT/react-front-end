import React from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";
import PrioritySelectionView from "./PrioritySelectionView";
import UserAvatarsGroup from "./UserAvatarsGroup";

// Define interfaces for the component props
interface IActionButton {
  textProps: {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: number;
  };
  buttonWidth?: number;
  backgroundColor?: string;
  borderProps: {
    color: string;
  };
  onPress: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ITileData {
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  name?: string;
}

interface INestedTile {
  UniqueId?: string;
  Name: string;
  Type: string;
}

interface Tile {
  UniqueId?: string;
  Name: string;
  Type: string;
}

interface User {
  FirstName: string;
  LastName: string;
  Email?: string;
  AvatarImagePath?: string;
}

interface ModifyEntityModalProps {
  onRequestClose: () => void;
  isOpen: boolean;
  actionButtons: IActionButton[];
  selectedHives: (INestedTile | Tile)[];
  selectedHive: (INestedTile | Tile);
  priority: number;
  setPriority: React.Dispatch<React.SetStateAction<number>>;
  peopleInvolved: User[] | undefined;
  setPeopleInvolved?: React.Dispatch<React.SetStateAction<User[]>>;
  date: Date;
  dateEnd: Date;
  startTime: Date;
  endTime: Date;
  setDateTimePickerMode: React.Dispatch<React.SetStateAction<"date" | "time">>;
  setDateTimePickerVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setIsStartTime: React.Dispatch<React.SetStateAction<boolean>>;
  isAllDayActive: boolean;
  setIsAllDayActive: React.Dispatch<React.SetStateAction<boolean>>;
  reminder: string;
  setShowReminderSelectionModal: React.Dispatch<React.SetStateAction<boolean>>;
  frequency: string;
  setShowFrequencySelectionModal: React.Dispatch<React.SetStateAction<boolean>>;
  isPrivacyEnabled: boolean;
  setIsPrivacyEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  hideFromPeople: User[];
  setHideFromPeople: React.Dispatch<React.SetStateAction<User[]>>;
  onSelectHive?: () => void;
  onSelectPeople?: () => void;
  onTogglePrivacy?: () => void;
}

/**
 * ModifyEntityModal - A modal for modifying entity properties
 *
 * This component displays a modal with various settings for modifying an entity,
 * such as priority, people involved, privacy settings, date/time, reminders, and frequency.
 */
const ModifyEntityModal: React.FC<ModifyEntityModalProps> = ({
  onRequestClose,
  isOpen,
  actionButtons,
  selectedHives,
  selectedHive,
  priority,
  setPriority,
  peopleInvolved,
  date,
  dateEnd,
  startTime,
  endTime,
  setDateTimePickerMode,
  setDateTimePickerVisible,
  setIsStartTime,
  isAllDayActive,
  setIsAllDayActive,
  reminder,
  setShowReminderSelectionModal,
  frequency,
  setShowFrequencySelectionModal,
  isPrivacyEnabled,
  setIsPrivacyEnabled,
  hideFromPeople,
  setHideFromPeople,
  onSelectHive,
  onSelectPeople,
  onTogglePrivacy,
}) => {
  const { i18n } = useLanguageContext();

  // Helper component for horizontal line
  const Line = () => (
    <div style={{ width: "100%", opacity: 0.1 }}>
      <HorizontalLine color={Colors.TROUT} />
    </div>
  );

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Modal
      isVisible={isOpen}
      onClose={onRequestClose}
      contentStyle={{
        width: "100%",
        maxWidth: "500px",
        borderRadius: "20px",
        padding: "0",
        position: "fixed",
        bottom: "0",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <CustomText style={styles.headerText}>{i18n.t('Settings')}</CustomText>
        </div>

        <Line />

        <div style={styles.scrollContainer}>
          {/* Hive Selection */}
          <div
            style={styles.menuItem}
            onClick={onSelectHive || onRequestClose}
          >
            <div style={styles.menuItemContent}>
              <div style={styles.iconContainer}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12H15V22" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <CustomText
                style={{
                  ...styles.menuItemText,
                  color: !!selectedHive ? Colors.BLUE : Colors.PEARL,
                }}
              >
                {(selectedHives?.length ?? 0) > 1
                  ? i18n.t('MultipleHivesSelected')
                  : selectedHives?.[0]?.Name ||
                    (selectedHive as INestedTile)?.Name ||
                    (selectedHive as unknown as User)?.FirstName ||
                    i18n.t('SelectHive')}
              </CustomText>
            </div>
          </div>

          {/* Priority Selection */}
          <PrioritySelectionView
            currentPriority={priority}
            onSelect={setPriority}
          />

          {/* People Involved */}
          {peopleInvolved && peopleInvolved.length > 0 ? (
            <div
              style={styles.peopleContainer}
              onClick={onSelectPeople || onRequestClose}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <UserAvatarsGroup
                users={peopleInvolved}
                size={10}
                style={{ width: 32, height: 32 }}
              />
            </div>
          ) : (
            <div
              style={styles.menuItem}
              onClick={onSelectPeople || onRequestClose}
            >
              <div style={styles.menuItemContent}>
                <div style={styles.iconContainer}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke={Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <CustomText
                  style={{
                    ...styles.menuItemText,
                    color: Colors.PEARL,
                  }}
                >
                  {i18n.t('PeopleInvolved')}
                </CustomText>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          <div
            style={styles.privacyContainer}
            onClick={onTogglePrivacy || (() => setIsPrivacyEnabled(!isPrivacyEnabled))}
          >
            <div style={styles.privacyContent}>
              <Icon name="lock" width={24} height={24} />
              <CustomText style={styles.privacyText}>
                {i18n.t('Privacy')}
              </CustomText>
            </div>
            <div style={styles.toggleContainer}>
              <div
                style={{
                  ...styles.toggle,
                  backgroundColor: isPrivacyEnabled ? Colors.BLUE : Colors.LIGHT_GREY,
                }}
              >
                <div
                  style={{
                    ...styles.toggleHandle,
                    transform: isPrivacyEnabled ? 'translateX(20px)' : 'translateX(0)',
                  }}
                />
              </div>
            </div>
          </div>

          <Line />

          {/* Date/Time Selection */}
          <div style={styles.dateTimeContainer}>
            {/* Date Selection */}
            <div
              style={styles.dateTimeRow}
              onClick={() => {
                setDateTimePickerMode("date");
                onRequestClose();
                setDateTimePickerVisible(true);
              }}
            >
              <Icon name="calendar" width={24} height={24} />
              <CustomText style={styles.dateTimeText}>
                {formatDate(date)}
              </CustomText>
            </div>

            {/* All Day Toggle */}
            <div style={styles.allDayContainer}>
              <CustomText style={styles.allDayText}>
                {i18n.t('AllDay')}
              </CustomText>
              <div
                style={styles.toggleContainer}
                onClick={() => setIsAllDayActive(!isAllDayActive)}
              >
                <div
                  style={{
                    ...styles.toggle,
                    backgroundColor: isAllDayActive ? Colors.BLUE : Colors.LIGHT_GREY,
                  }}
                >
                  <div
                    style={{
                      ...styles.toggleHandle,
                      transform: isAllDayActive ? 'translateX(20px)' : 'translateX(0)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Time Selection */}
            {!isAllDayActive && (
              <div style={styles.timeContainer}>
                <div
                  style={styles.timeRow}
                  onClick={() => {
                    setDateTimePickerMode("time");
                    onRequestClose();
                    setDateTimePickerVisible(true);
                    setIsStartTime(true);
                  }}
                >
                  <Icon name="clock" width={24} height={24} />
                  <CustomText style={styles.timeText}>
                    {formatTime(startTime)}
                  </CustomText>
                </div>
                <div
                  style={styles.timeRow}
                  onClick={() => {
                    setDateTimePickerMode("time");
                    onRequestClose();
                    setDateTimePickerVisible(true);
                    setIsStartTime(false);
                  }}
                >
                  <Icon name="clock" width={24} height={24} />
                  <CustomText style={styles.timeText}>
                    {formatTime(endTime)}
                  </CustomText>
                </div>
              </div>
            )}
          </div>

          {/* Reminder and Frequency */}
          <div style={styles.reminderFrequencyContainer}>
            <div style={styles.reminderContainer}>
              <div
                style={styles.menuItem}
                onClick={() => {
                  onRequestClose();
                  setShowReminderSelectionModal(true);
                }}
              >
                <div style={styles.menuItemContent}>
                  <div style={styles.iconContainer}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke={!!reminder ? Colors.BLUE : Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke={!!reminder ? Colors.BLUE : Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <CustomText
                    style={{
                      ...styles.menuItemText,
                      color: !!reminder ? Colors.BLUE : Colors.PEARL,
                    }}
                  >
                    {reminder || i18n.t('Reminder')}
                  </CustomText>
                </div>
              </div>
            </div>
            <div style={styles.frequencyContainer}>
              <div
                style={styles.menuItem}
                onClick={() => {
                  onRequestClose();
                  setShowFrequencySelectionModal(true);
                }}
              >
                <div style={styles.menuItemContent}>
                  <div style={styles.iconContainer}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 1L21 5L17 9" stroke={!!frequency ? Colors.BLUE : Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke={!!frequency ? Colors.BLUE : Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 23L3 19L7 15" stroke={!!frequency ? Colors.BLUE : Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke={!!frequency ? Colors.BLUE : Colors.PEARL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <CustomText
                    style={{
                      ...styles.menuItemText,
                      color: !!frequency ? Colors.BLUE : Colors.PEARL,
                    }}
                  >
                    {frequency || i18n.t('Frequency')}
                  </CustomText>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtonsContainer}>
            {actionButtons.map((actionButton) => (
              <Button
                key={actionButton.textProps.text}
                height={50}
                textProps={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  ...actionButton.textProps,
                }}
                onButtonClick={() => actionButton.onPress()}
                backgroundColor={actionButton.backgroundColor}
                borderProps={{
                  width: 1,
                  radius: 10,
                  ...actionButton.borderProps,
                }}
                width="48%"
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  modalContent: {
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    paddingBottom: "50px",
  },
  header: {
    width: "100%",
    position: "relative" as const,
    display: "flex",
    justifyContent: "flex-start" as const,
    alignItems: "flex-start" as const,
    paddingBottom: "16px",
    paddingTop: "32px",
    paddingHorizontal: "24px",
    padding: "32px 24px 16px",
  },
  headerText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: "center" as const,
    width: "100%",
  },
  scrollContainer: {
    width: "100%",
    padding: "0 24px",
    overflowY: "auto" as const,
    maxHeight: "calc(90vh - 100px)",
  },
  menuItem: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: "15px 0",
    cursor: "pointer",
  },
  menuItemContent: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  iconContainer: {
    marginRight: "10px",
  },
  menuItemText: {
    fontSize: Typography.FONT_SIZE_16,
  },
  peopleContainer: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: "10px",
    width: "100%",
    marginBottom: "6%",
    cursor: "pointer",
  },
  privacyContainer: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: "15px 0",
    cursor: "pointer",
  },
  privacyContent: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: "10px",
  },
  privacyText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.MIDNIGHT,
  },
  toggleContainer: {
    cursor: "pointer",
  },
  toggle: {
    width: "40px",
    height: "20px",
    borderRadius: "10px",
    position: "relative" as const,
    transition: "background-color 0.3s",
  },
  toggleHandle: {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: Colors.WHITE,
    position: "absolute" as const,
    top: "2px",
    left: "2px",
    transition: "transform 0.3s",
  },
  dateTimeContainer: {
    width: "100%",
    marginBottom: "20px",
  },
  dateTimeRow: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: "10px",
    marginBottom: "10px",
    cursor: "pointer",
  },
  dateTimeText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.BLUE,
  },
  allDayContainer: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: "10px",
  },
  allDayText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.MIDNIGHT,
  },
  timeContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  },
  timeRow: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: "10px",
    cursor: "pointer",
  },
  timeText: {
    fontSize: Typography.FONT_SIZE_16,
    color: Colors.BLUE,
  },
  reminderFrequencyContainer: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingBottom: "8px",
  },
  reminderContainer: {
    flex: 1,
  },
  frequencyContainer: {
    flex: 1,
  },
  actionButtonsContainer: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    width: "100%",
    marginTop: "20px",
    gap: "10px",
  },
};

export default ModifyEntityModal;
