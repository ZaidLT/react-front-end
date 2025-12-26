import React, { useState, useRef, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import HiveHexTile from "./HiveHexTile";
import Icon from "./Icon";
import Button from "./Button";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";

/**
 * PlusMenu - A component for the plus menu that allows users to create new items
 *
 * This component displays a menu with quick access buttons for creating tasks, notes,
 * documents, and events.
 */
interface PlusMenuProps {
  onClose: () => void;
  onTaskClick?: () => void;
  onNoteClick?: () => void;
  onDocClick?: () => void;
  onEventClick?: () => void;
}

const PlusMenu: React.FC<PlusMenuProps> = ({
  onClose,
  onTaskClick,
  onNoteClick,
  onDocClick,
  onEventClick
}) => {
  const { i18n } = useLanguageContext();
  const [showQuickMenu, setShowQuickMenu] = useState(true);
  const [isQuickButtonsActive, setIsQuickButtonsActive] = useState(false);
  const [itemType, setItemType] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Animation styles
  const taskAnimationStyle = {
    transform: showQuickMenu
      ? 'translate(0px, 0px)'
      : 'translate(30px, 50px)',
    transition: 'transform 0.3s ease-out'
  };

  // Animation for note button
  const noteAnimationStyle = {
    transform: showQuickMenu
      ? 'translate(0px, 0px)'
      : 'translate(-30px, 50px)',
    transition: 'transform 0.3s ease-out'
  };

  // Animation for doc button
  const docAnimationStyle = {
    transform: showQuickMenu
      ? 'translate(0px, 0px)'
      : 'translate(50px, 0px)',
    transition: 'transform 0.3s ease-out'
  };

  // Animation for event button
  const eventAnimationStyle = {
    transform: showQuickMenu
      ? 'translate(0px, 0px)'
      : 'translate(-50px, 0px)',
    transition: 'transform 0.3s ease-out'
  };

  // Ref for timeout
  const quickButtonActiveTimeoutId = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle animation timing
  useEffect(() => {
    if (quickButtonActiveTimeoutId.current) {
      clearTimeout(quickButtonActiveTimeoutId.current);
    }

    if (showQuickMenu) {
      setIsQuickButtonsActive(false);
      quickButtonActiveTimeoutId.current = setTimeout(() => {
        setIsQuickButtonsActive(true);
      }, 250);
    }

    return () => {
      if (quickButtonActiveTimeoutId.current) {
        clearTimeout(quickButtonActiveTimeoutId.current);
      }
    };
  }, [showQuickMenu]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Handle item creation
  const handleCreateItem = () => {
    if (itemType === 'Task' && onTaskClick) {
      onTaskClick();
    } else if (itemType === 'Note' && onNoteClick) {
      onNoteClick();
    } else if (itemType === 'Doc' && onDocClick) {
      onDocClick();
    } else if (itemType === 'Event' && onEventClick) {
      onEventClick();
    }

    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.plusMenuContainer} onClick={(e) => e.stopPropagation()}>
        {showQuickMenu ? (
          <div style={styles.quickMenuContainer}>
            <div style={styles.quickMenuRow}>
              <div style={{...taskAnimationStyle}}>
                <div
                  style={styles.quickButton}
                  onClick={() => {
                    if (isQuickButtonsActive) {
                      setItemType("Task");
                      setShowQuickMenu(false);
                      if (onTaskClick) onTaskClick();
                    }
                  }}
                >
                  <Icon name="add-task-quick-hive-tile" width={64} height={64} />
                </div>
              </div>

              <div style={{...noteAnimationStyle}}>
                <div
                  style={styles.quickButton}
                  onClick={() => {
                    if (isQuickButtonsActive) {
                      setItemType("Note");
                      setShowQuickMenu(false);
                      if (onNoteClick) onNoteClick();
                    }
                  }}
                >
                  <Icon name="add-notes-quick-hive-tile" width={64} height={64} />
                </div>
              </div>
            </div>

            <div style={styles.quickMenuRow}>
              <div style={{...docAnimationStyle}}>
                <div
                  style={styles.quickButton}
                  onClick={() => {
                    if (isQuickButtonsActive) {
                      setItemType("Doc");
                      setShowQuickMenu(false);
                      if (onDocClick) onDocClick();
                    }
                  }}
                >
                  <Icon name="add-docs-quick-hive-tile" width={64} height={64} />
                </div>
              </div>

              <div style={styles.closeButton} onClick={onClose}>
                <Icon name="quick-menu-close" width={64} height={64} />
              </div>

              <div style={{...eventAnimationStyle}}>
                <div
                  style={styles.quickButton}
                  onClick={() => {
                    if (isQuickButtonsActive) {
                      setItemType("Event");
                      setShowQuickMenu(false);
                      if (onEventClick) onEventClick();
                    }
                  }}
                >
                  <Icon name="add-event-quick-hive-tile" width={64} height={64} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.fullMenuContainer}>
            {/* Minus button */}
            <div style={styles.minusButtonContainer}>
              <div onClick={() => {
                  setItemType(undefined);
                  setShowQuickMenu(true);
                }}>
                <HiveHexTile
                  coloredTile={true}
                  content={{ icon: "minus" }}
                  width={65}
                  height={65}
                />
              </div>
            </div>

            <div style={styles.contentContainer}>
              {/* Top */}
              <div style={styles.topContainer}>
                <CustomText style={styles.headingText}>
                  {i18n.t("WhatsOnYourMind")}
                </CustomText>
                <div style={styles.inputContainer}>
                  <Icon
                    name="short-text"
                    width={24}
                    height={24}
                    color={title.length === 0 ? Colors.GREY_COLOR : Colors.BLUE}
                  />
                  <input
                    style={{
                      ...styles.textInput,
                      ...(title.length === 0 && {
                        borderBottom: `1px solid ${Colors.GREY_COLOR}`,
                      }),
                    }}
                    placeholder={i18n.t("CaptureAMomentTaskOrNeed")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                {itemType !== "Note" && title.trim().length === 0 && (
                  <CustomText style={styles.errorText}>
                    {i18n.t("ThisFieldIsRequired")}
                  </CustomText>
                )}
              </div>

              {/* Middle */}
              <div style={styles.middleContainer}>
                <div style={styles.dropdownContainer}>
                  <select
                    style={styles.dropdown}
                    value={itemType || ""}
                    onChange={(e) => setItemType(e.target.value)}
                  >
                    <option value="" disabled>{i18n.t("SelectItemType")}</option>
                    <option value="Task">{i18n.t("Task")}</option>
                    <option value={i18n.t('Event')}>{i18n.t("Event")}</option>
                    <option value="Note">{i18n.t("Note")}</option>
                    <option value="Doc">{i18n.t("Doc")}</option>
                  </select>
                </div>

                <div style={styles.detailsContainer}>
                  <Icon name="document" width={24} height={24} />
                  <textarea
                    style={styles.textArea}
                    placeholder={i18n.t("AddMoreDetails")}
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                  />
                </div>

                <HorizontalLine color={Colors.LIGHT_GREY} />
              </div>

              {/* Bottom */}
              <div style={styles.bottomContainer}>
                <Button
                  onButtonClick={() => {
                    setItemType(undefined);
                    onClose();
                  }}
                  textProps={{
                    text: i18n.t("Cancel"),
                    color: Colors.BLUE,
                    fontSize: Typography.FONT_SIZE_16,
                  }}
                  backgroundColor={Colors.WHITE}
                  borderProps={{
                    radius: 8,
                    color: Colors.BLUE,
                    width: 1,
                  }}
                  height={52}
                  width={"48%"}
                />
                <Button
                  disabled={itemType !== "Note" && title.trim().length === 0}
                  onButtonClick={handleCreateItem}
                  textProps={{
                    text: i18n.t("Create"),
                    color: Colors.WHITE,
                    fontSize: Typography.FONT_SIZE_16,
                  }}
                  backgroundColor={Colors.BLUE}
                  borderProps={{
                    radius: 8,
                  }}
                  height={52}
                  width={"48%"}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  plusMenuContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.15)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  quickMenuContainer: {
    padding: "50px 20px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
  quickMenuRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
  },
  quickButton: {
    cursor: "pointer",
  },
  closeButton: {
    cursor: "pointer",
  },
  fullMenuContainer: {
    position: "relative",
    width: "100%",
    padding: "40px 20px 20px 20px",
  },
  minusButtonContainer: {
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translate(-50%, -30px)",
    zIndex: 1001,
    cursor: "pointer",
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
  topContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    paddingBottom: "10px",
    borderBottom: `1px solid ${Colors.LIGHT_GREY}`,
  },
  headingText: {
    width: "100%",
    textAlign: "left",
    fontSize: Typography.FONT_SIZE_18,
    fontWeight: "bold",
    paddingBottom: "10px",
  },
  inputContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "42px",
  },
  textInput: {
    flex: 1,
    paddingLeft: "10px",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: "none",
    outline: "none",
  },
  errorText: {
    fontSize: Typography.FONT_SIZE_12,
    color: Colors.GREY_COLOR,
    textAlign: "left",
    width: "100%",
    paddingLeft: "24px",
  },
  middleContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  dropdownContainer: {
    width: "100%",
  },
  dropdown: {
    width: "100%",
    height: "50px",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.BLUE,
    border: `1px solid ${Colors.LIGHT_GREY}`,
    borderRadius: "8px",
    padding: "0 10px",
    outline: "none",
  },
  detailsContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: "10px",
  },
  textArea: {
    flex: 1,
    minHeight: "100px",
    padding: "10px",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: `1px solid ${Colors.LIGHT_GREY}`,
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
  },
  bottomContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: "52px",
  },
};

export default PlusMenu;
