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
    name: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  };
  index?: number;
  isToggle?: boolean;
  isFullWidth?: boolean;
  onPress?: (name: string) => Promise<void>;
}

interface MenuItemSelectionModalProps {
  /**
   * To set the Title of the Modal
   */
  title: string;
  /**
   * To set the visibility of the Modal
   */
  isVisible: boolean;
  /**
   * function to be run to close the Modal
   */
  onRequestClose: () => void;
  /**
   * Function to be run when the user clicks on the save button
   *
   * Use with `isApply` prop
   * @param value content.name of the selected item
   * @returns void
   */
  onSaveRequest?: (value: string) => void;
  /**
   * List of items to be displayed in the Modal
   */
  items: IMenuItem[];
  /**
   * To hide the back button in the Modal
   * @default false
   */
  hideBackButton?: boolean;
  /**
   * To hide the indicator at the top of the Modal
   * @default false
   */
  hideIndicator?: boolean;
  /**
   * Used to display the selected item in the list
   *
   * Must have `setSelectedItem` to update the selected item
   */
  selectedItem?: string | null;
  /**
   * Function to be run when the back press event
   * @returns
   */
  handleBackPress?: () => void;
  /**
   * Will display the apply button at the bottom of the modal if `true`
   *
   * Use with `onSaveRequest` prop
   */
  isApply?: boolean;
  /**
   * The selected value from the list
   * to be used with `setSelectedValue` to update the selected value
   * and `isApply` prop
   */
  selectedValue?: string;
  /**
   * Used to update the selected value
   * @param name  content.name of the selected item
   * @returns void
   */
  setSelectedValue?: (name: string) => void;
}

/**
 * MenuItemSelectionModal - A modal for selecting items from a menu
 * 
 * This component displays a modal with a list of items that can be selected.
 * It allows the user to select a single item and confirm the selection.
 */
const MenuItemSelectionModal: React.FC<MenuItemSelectionModalProps> = ({
  isVisible,
  onRequestClose,
  items,
  title,
  hideBackButton = false,
  hideIndicator = false,
  selectedItem,
  handleBackPress,
  isApply,
  onSaveRequest,
  selectedValue,
  setSelectedValue,
}) => {
  const { i18n } = useLanguageContext();

  // Render a menu list item
  const renderMenuListItem = (item: IMenuItem, isSelected: boolean) => {
    const IconComponent = item.content.icon;
    
    return (
      <div 
        style={styles.menuItem}
        onClick={async () => {
          if (!isApply) {
            if (item.onPress) await item.onPress(item?.content.name);
            if (setSelectedValue) {
              setSelectedValue("");
            }
            onRequestClose();
          } else {
            if (setSelectedValue) {
              setSelectedValue(item?.content.name);
            }
          }
        }}
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
        borderRadius: "18px",
        padding: "0",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={styles.mainContainer}>
        {!hideIndicator && (
          <div style={{ alignSelf: "center", marginTop: "20px" }}>
            <Icon name="indicator" width={40} height={4} />
          </div>
        )}

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
                isApply
                  ? selectedValue === item?.content.name
                  : selectedItem === item?.content.name
              )}
              {((title !== "Pick Direction" && item.index === 2) ||
                (title === "Pick Direction" && item.index === 1)) && (
                <div
                  style={{
                    width: "95%",
                    borderTopWidth: "1px",
                    borderStyle: "solid",
                    borderColor: Colors.GRAY,
                    margin: "0 auto",
                  }}
                />
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
                text: i18n.t("Cancel"),
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
                onSaveRequest &&
                  onSaveRequest(selectedValue ? selectedValue : "");
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
    borderRadius: "18px",
    paddingBottom: "20px",
  },
  header: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: "16px",
    marginBottom: "30px",
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
    padding: "0 3%",
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

export default MenuItemSelectionModal;
