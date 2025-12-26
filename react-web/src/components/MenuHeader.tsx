'use client';

import React, { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import { BackArrowIcon } from "./SVGIcons";
import { useLanguageContext } from "../context/LanguageContext";

interface IRightButton {
  key: string;
  icon: React.ReactNode;
  text?: string;
  onPress?: () => void;
  isMenu?: boolean; // Add a flag to differentiate buttons that should open a menu
}

interface MenuOption {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
}

interface MenuHeaderProps {
  backButton: {
    show: boolean;
    route?: string;
    onPress?: () => void;
  };
  title?: string;
  titleCentered?: boolean;
  rightButtons?: IRightButton[];
  actionButtonTitle?: string;
  actionButtonIcon?: React.ReactNode;
  disableButton?: boolean;
  editingEnabled?: boolean;
  onActionButtonPress?: () => void;
  backButtonExtraActions?: () => void;
  menuOptions?: MenuOption[];
}

/**
 * MenuHeader - A header component with back button, title, and action buttons
 *
 * This component displays a header with a back button, title, and optional action buttons.
 * It can also display a dropdown menu when a button with isMenu=true is clicked.
 *
 * @param backButton - Configuration for the back button
 * @param title - The title to display in the header
 * @param titleCentered - Whether to center the title
 * @param rightButtons - Array of buttons to display on the right side
 * @param actionButtonIcon - Icon for the action button
 * @param onActionButtonPress - Callback for when the action button is pressed
 * @param backButtonExtraActions - Additional actions to perform when the back button is pressed
 * @param menuOptions - Options to display in the dropdown menu
 */
const MenuHeader: React.FC<MenuHeaderProps> = ({
  backButton,
  title,
  titleCentered,
  rightButtons,
  actionButtonIcon,
  editingEnabled,
  onActionButtonPress,
  backButtonExtraActions,
  menuOptions,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeMenuButton, setActiveMenuButton] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { i18n } = useLanguageContext();

  const isPadding = (rightButtons && rightButtons?.length <= 1) || !rightButtons ? 0 : 50;

  const showMenu = (buttonKey: string) => {
    setActiveMenuButton(buttonKey);
    setMenuVisible(true);
  };

  const hideMenu = () => {
    setMenuVisible(false);
    setActiveMenuButton(null);
  };

  // Handle click outside to close menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pathname = usePathname();

  const handleBackButtonClick = async () => {
    backButtonExtraActions && backButtonExtraActions();
    if (backButton.show) {
      if (backButton?.onPress) {
        await backButton.onPress();
      } else if (backButton.route) {
        router.push(backButton.route);
      } else {
        router.back();
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Back button */}
      <div
        onClick={handleBackButtonClick}
        style={{
          ...styles.leftContainer,
          cursor: backButton.show ? "pointer" : "default",
        }}
      >
        {backButton.show === true && (
          <BackArrowIcon width={24} height={24} color={Colors.BLUE} />
        )}
      </div>

      {/* Title */}
      <div style={styles.titleContainer}>
        {title && (
          <CustomText
            style={{
              ...styles.titleText,
              paddingLeft: actionButtonIcon || rightButtons ? isPadding : 0,
              fontSize: title.length > 30 ? Typography.FONT_SIZE_14 : Typography.FONT_SIZE_18,
            }}
          >
            {title}
          </CustomText>
        )}
      </div>

      {/* Right buttons */}
      <div
        style={{
          ...styles.rightButtonContainer,
          minWidth: 50,
        }}
      >
        {actionButtonIcon && (
          <div
            onClick={() => {
              onActionButtonPress && onActionButtonPress();
            }}
            style={{
              ...styles.actionButton,
              cursor: "pointer",
            }}
          >
            {actionButtonIcon}
          </div>
        )}

        {rightButtons &&
          rightButtons.map((button: IRightButton) => {
            if (button.isMenu) {
              return (
                <div key={button.key} style={{ position: "relative" }}>
                  <div
                    onClick={() => showMenu(button.key)}
                    style={{
                      ...styles.rightButtonStyle,
                      cursor: "pointer",
                    }}
                  >
                    {button.icon}
                    {button.text && (
                      <CustomText style={styles.rightButtonText}>
                        {button.text}
                      </CustomText>
                    )}
                  </div>

                  {menuVisible && activeMenuButton === button.key && (
                    <div
                      ref={menuRef}
                      style={styles.menuContainer}
                    >
                      {menuOptions &&
                        menuOptions.map((option, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              hideMenu();
                              setTimeout(() => {
                                option.onPress();
                              }, 500);
                            }}
                            style={styles.menuItem}
                          >
                            {option.icon && (
                              <div style={styles.menuIcon}>
                                {option.icon}
                              </div>
                            )}
                            <CustomText
                              style={{
                                ...styles.menuText,
                                color: option.title === i18n.t("Delete") ? Colors.RED : Colors.BLUE,
                              }}
                            >
                              {option.title}
                            </CustomText>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={`${String(button.key)}`}
                  onClick={button.onPress}
                  style={{
                    ...styles.rightButtonStyle,
                    cursor: "pointer",
                  }}
                >
                  {button.icon}
                  {button.text && (
                    <CustomText style={styles.rightButtonText}>{button.text}</CustomText>
                  )}
                </div>
              );
            }
          })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    paddingHorizontal: "2%",
    display: "flex",
    flexDirection: "row" as const,
    width: "100%",
    marginTop: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 50,
  },
  titleContainer: {
    flex: 1, // Allows title to take up remaining space
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.BLUE,
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    width: "100%",
  },
  rightButtonContainer: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 50,
  },
  actionButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rightButtonStyle: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    justifyContent: "center", // Align content in the center of the button
  },
  rightButtonText: {
    color: Colors.PRIMARY_ELECTRIC_BLUE,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    marginLeft: 5, // Adds space between icon and text
  },
  menuContainer: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    marginTop: "7%",
    minWidth: 150,
    overflow: "hidden" as const,
  },
  menuItem: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    padding: "10px 15px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: Colors.LIGHT_GREY,
    },
  },
  menuIcon: {
    marginRight: 10,
    marginLeft: 12,
  },
  menuText: {
    fontSize: Typography.FONT_SIZE_14,
    color: Colors.BLUE,
  },
};

export default MenuHeader;
