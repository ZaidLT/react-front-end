import React from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";
import Icon from "./Icon";
import { useLanguageContext } from '../context/LanguageContext';

export const CALENDAR_COLOR_ITEMS = [
  {
    id: 1,
    text: "White",
    color: Colors.WHITE,
    containerColor: Colors.WHITE,
  },
  {
    id: 2,
    text: "Red",
    color: "#FF6961",
    containerColor: "#FFE2E0",
  },
  {
    id: 3,
    text: "Orange",
    color: "#FFA020",
    containerColor: "#FFFBDB",
  },
  {
    id: 4,
    text: "Yellow",
    color: "#FFE871",
    containerColor: "#FFFBDB",
  },
  {
    id: 5,
    text: "Green",
    color: "#6CC47C",
    containerColor: "#E0F8E5",
  },
  {
    id: 6,
    text: "Mint",
    color: "#6FF9D8",
    containerColor: "#F1FEFB",
  },
  {
    id: 7,
    text: "Purple",
    color: "#C3B7FF",
    containerColor: "#F9F8FF",
  },
  {
    id: 8,
    text: "Light Blue",
    color: "#73C2E4",
    containerColor: "#E3F6FF",
  },
  {
    id: 9,
    text: "Dark Blue",
    color: "#2A46BE",
    containerColor: "#E3F6FF",
  },
];

interface SimpleCalendarColorSelectionModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

/**
 * SimpleCalendarColorSelectionModal - A simplified version of CalendarColorSelectionModal for demo purposes
 *
 * This component displays a modal with a list of color options for calendars.
 * Each color option is displayed with a color swatch and name.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param selectedColor - The currently selected color
 * @param onColorSelect - Callback function when a color is selected
 */
const SimpleCalendarColorSelectionModal: React.FC<SimpleCalendarColorSelectionModalProps> = ({
  isVisible,
  onRequestClose,
  selectedColor,
  onColorSelect,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "100%",
        maxWidth: "500px",
        borderRadius: "18px",
        padding: "0",
        margin: "0 auto",
      }}
    >
      <div style={styles.modalContent}>
        <div style={{ alignSelf: "center", marginTop: "20px" }}>
          <Icon name="calendar" width={40} height={4} />
        </div>

        <div style={styles.headerContainer}>
          <CustomText style={styles.headerText}>
            {i18n.t('CalendarColor')}
          </CustomText>
        </div>

        <div style={{ width: "100%", opacity: 0.1, alignSelf: "center" }}>
          <HorizontalLine color={Colors.TROUT} />
        </div>

        <div style={styles.colorOptionsContainer}>
          {CALENDAR_COLOR_ITEMS.map((item) => (
            <div
              key={item.id}
              style={styles.colorOption}
              onClick={() => {
                onColorSelect(item.color);
              }}
            >
              <div style={styles.checkboxContainer}>
                {selectedColor === item.color && (
                  <Icon name="checkmark" width={16} height={16} color={Colors.BLUE} />
                )}
              </div>

              <div
                style={{
                  ...styles.colorSwatch,
                  backgroundColor: item.color,
                  borderColor: item.text === "White" ? "#E6E7EE" : item.color,
                }}
              />

              <CustomText style={styles.colorText}>
                {item.text}
              </CustomText>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  modalContent: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "18px",
    paddingBottom: "20px",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginTop: "7%",
    marginBottom: "7%",
    marginLeft: "5%",
    marginRight: "5%",
  },
  headerText: {
    flex: 1,
    color: Colors.MIDNIGHT,
    textAlign: "center",
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    marginRight: "5%",
  },
  colorOptionsContainer: {
    width: "90%",
    marginTop: "10%",
    marginBottom: "10%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignSelf: "center",
    gap: "40px",
  },
  colorOption: {
    display: "flex",
    flexDirection: "row",
    gap: "15px",
    alignItems: "center",
    cursor: "pointer",
  },
  checkboxContainer: {
    width: "24px",
    height: "24px",
    borderRadius: "100px",
    borderWidth: "1.4px",
    borderStyle: "solid",
    borderColor: Colors.BLUE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatch: {
    width: "24px",
    height: "24px",
    borderRadius: "100px",
    borderWidth: "1px",
    borderStyle: "solid",
  },
  colorText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.BLUE,
    fontWeight: "400",
  },
};

export default SimpleCalendarColorSelectionModal;
