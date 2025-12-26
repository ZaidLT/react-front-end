import React from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";

interface IMenuItem {
  content: {
    id?: string;
    name: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  };
  index: number;
  isToggle?: boolean;
  isFullWidth?: boolean;
}

interface MenuItemAssigneeModalProps {
  title: string;
  isVisible: boolean;
  onRequestClose: () => void;
  onSaveRequest: (values: { id: string; name: string }[]) => void;
  items: IMenuItem[];
  hideBackButton?: boolean;
  selectedItem?: string | null;
  handleBackPress?: () => void;
  isApply?: boolean;
  selectedValues: { id: string; name: string }[];
  handleItemPress: (values: { id: string; name: string }) => void;
}

/**
 * MenuItemAssigneeModal - A modal for selecting assignees from a list
 * 
 * This component displays a modal with a list of items that can be selected as assignees.
 * It allows the user to select multiple items and confirm the selection.
 * 
 * @param title - The title of the modal
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param onSaveRequest - Callback function when the user confirms the selection
 * @param items - Array of available items to select from
 * @param hideBackButton - Whether to hide the back button
 * @param selectedItem - Currently selected item
 * @param handleBackPress - Callback function when the back button is pressed
 * @param isApply - Whether to show the apply button
 * @param selectedValues - Array of currently selected values
 * @param handleItemPress - Function to handle item selection
 */
const MenuItemAssigneeModal: React.FC<MenuItemAssigneeModalProps> = ({
  isVisible,
  onRequestClose,
  items,
  title,
  hideBackButton = false,
  handleBackPress,
  isApply,
  onSaveRequest,
  selectedValues,
  handleItemPress
}) => {
  const { i18n } = useLanguageContext();

  // Render a menu list item for task filter
  const renderMenuListItem = (item: IMenuItem, isSelected: boolean) => {
    const IconComponent = item.content.icon;
    
    return (
      <div 
        style={styles.menuItem}
        onClick={() => 
          item.content.id && 
          handleItemPress({
            id: item.content.id,
            name: item.content.name,
          })
        }
      >
        <div style={styles.menuItemContent}>
          {IconComponent && (
            <div style={styles.iconContainer}>
              <IconComponent width={24} height={24} />
            </div>
          )}
          <CustomText 
            style={{
              ...styles.menuItemText,
              color: isSelected ? Colors.BLUE : Colors.MIDNIGHT,
              fontFamily: isSelected 
                ? Typography.FONT_FAMILY_POPPINS_SEMIBOLD 
                : Typography.FONT_FAMILY_POPPINS_REGULAR,
            }}
          >
            {item.content.name}
          </CustomText>
        </div>
        {isSelected && (
          <div style={styles.checkmark}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "100%",
        maxWidth: "500px",
        borderRadius: "18px 18px 0 0",
        padding: "0",
        position: "fixed",
        bottom: "0",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={styles.mainContainer}>
        <div style={{ alignSelf: "center", marginTop: "20px" }}>
          <Icon name="indicator" width={40} height={4} />
        </div>

        <div style={styles.header}>
          {!hideBackButton && (
            <div
              onClick={() =>
                handleBackPress ? handleBackPress() : onRequestClose()
              }
              style={{ cursor: "pointer" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 19L5 12L12 5" stroke={Colors.BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <CustomText style={styles.headerText}>
            {title}
          </CustomText>
        </div>

        <div style={{ width: "100%", opacity: 0.1 }}>
          <HorizontalLine color={Colors.TROUT} />
        </div>

        <div style={styles.scrollContainer}>
          {items.map((item, i) => (
            <React.Fragment key={`${item.content.name}-${i}-${item.index}`}>
              {renderMenuListItem(
                item, 
                selectedValues.some(selected => selected.id === item.content.id)
              )}
              {i < items.length - 1 && (
                <HorizontalLine color={Colors.GRAY} />
              )}
            </React.Fragment>
          ))}
        </div>

        {isApply && (
          <div style={styles.buttonsContainer}>
            <Button
              width="49%"
              textProps={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                text: i18n.t('Cancel'),
                color: Colors.BLUE,
              }}
              onButtonClick={() => {
                onRequestClose();
              }}
              backgroundColor={Colors.WHITE}
              borderProps={{
                width: 1,
                radius: 10,
                color: Colors.BLUE,
              }}
            />

            <Button
              width="49%"
              textProps={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                text: "Apply",
              }}
              onButtonClick={() => {
                onSaveRequest(selectedValues);
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

const styles = {
  mainContainer: {
    display: "flex",
    flexDirection: "column" as const,
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "18px 18px 0 0",
    paddingBottom: "20px",
  },
  header: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: "16px",
    marginBottom: "30px",
    paddingHorizontal: "5%",
    padding: "0 5%",
  },
  headerText: {
    flex: 1,
    color: Colors.MIDNIGHT,
    textAlign: "center" as const,
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
    marginRight: "5%",
  },
  scrollContainer: {
    width: "100%",
    padding: "0 5%",
    overflowY: "auto" as const,
    maxHeight: "60vh",
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
  checkmark: {
    marginLeft: "10px",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: "0 5%",
    width: "100%",
    marginTop: "30px",
    marginBottom: "30px",
  },
};

export default MenuItemAssigneeModal;
