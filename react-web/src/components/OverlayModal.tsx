import React, { useEffect } from "react";
import { Colors, Typography } from "../styles";
import Button from "./Button";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";
import Modal from "./Modal";
import ReactCodeInput from "react-code-input";

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

interface IOverlayModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onSelect?: (selectedItem: string) => void;
  selected?: string;
  items?: string[];
  itemsWithIcons?: { name: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[];
  headerText: string;
  descriptionText?: string;
  permissionDetailText?: string;
  actionButtons: IActionButton[];
  avoidKeyboard?: boolean;
  bodyContent?: React.ReactNode;
  codeInput?: {
    setCode: React.Dispatch<React.SetStateAction<string>>;
    code: string;
  };
  hideHorizontalLine?: boolean;
  hideItemsHorizontalLine?: boolean;
  headerTextStyle?: React.CSSProperties;
  itemTextStyle?: React.CSSProperties;
  selectedItemTextStyle?: React.CSSProperties;
}

/**
 * OverlayModal - A versatile overlay modal with various content options
 *
 * This component displays a modal with customizable content, such as text, items,
 * code input, and action buttons.
 */
const OverlayModal: React.FC<IOverlayModalProps> = ({
  isVisible,
  onRequestClose,
  onSelect,
  items,
  headerText,
  descriptionText,
  actionButtons,
  selected,
  bodyContent,
  codeInput,
  avoidKeyboard,
  permissionDetailText,
  itemsWithIcons,
  hideHorizontalLine,
  hideItemsHorizontalLine,
  headerTextStyle,
  itemTextStyle,
  selectedItemTextStyle,
}) => {
  // Handle keyboard events
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onRequestClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, onRequestClose]);

  // Define custom props for the code input component
  // Note: We're not using the full codeInputProps object directly due to type issues
  // Instead, we'll apply the styles inline

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      showCloseButton={false}
      contentStyle={{
        width: "90%",
        maxWidth: "500px",
        borderRadius: "18px",
        padding: "16px 20px 20px",
        backgroundColor: Colors.WHITE,
        margin: "auto",
      }}
    >
      <div style={styles.mainContainer}>
        <CustomText
          style={{
            ...styles.headerText,
            marginBottom: descriptionText ? 0 : "12px",
            ...headerTextStyle,
          }}
        >
          {headerText}
        </CustomText>

        {codeInput && (
          <div style={styles.codeInputContainer}>
            <ReactCodeInput
              type="number"
              fields={4}
              value={codeInput.code}
              onChange={codeInput.setCode}
              name="code-input"
              inputMode="numeric"
              className="code-input"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center'
              }}
            />
          </div>
        )}

        {itemsWithIcons && itemsWithIcons.length > 0 && (
          <div style={styles.itemsContainer}>
            {!hideItemsHorizontalLine && (
              <div style={styles.horizontalLineContainer}>
                <HorizontalLine color={Colors.TROUT} />
              </div>
            )}
            {itemsWithIcons?.map(({ name, Icon }) => (
              <div
                onClick={() => onSelect && onSelect(name)}
                key={name}
                style={styles.itemWithIcon}
              >
                <Icon width={24} height={24} />
                <CustomText
                  style={{
                    ...styles.itemText,
                    color: selected === name ? Colors.BLUE : Colors.GREY_COLOR,
                    fontFamily: selected === name
                      ? Typography.FONT_FAMILY_POPPINS_BOLD
                      : Typography.FONT_FAMILY_POPPINS_REGULAR,
                    marginLeft: "8px",
                    ...(selected === name ? selectedItemTextStyle : itemTextStyle),
                  }}
                >
                  {name}
                </CustomText>
              </div>
            ))}
          </div>
        )}

        {items && items.length > 0 && (
          <div style={styles.itemsContainer}>
            {!hideItemsHorizontalLine && (
              <div style={styles.horizontalLineContainer}>
                <HorizontalLine color={Colors.TROUT} />
              </div>
            )}
            {items?.map((item: string) => (
              <div
                onClick={() => onSelect && onSelect(item)}
                key={item}
                style={styles.item}
              >
                <CustomText
                  style={{
                    ...styles.itemText,
                    color: selected === item ? Colors.BLUE : Colors.GREY_COLOR,
                    fontFamily: selected === item
                      ? Typography.FONT_FAMILY_POPPINS_BOLD
                      : Typography.FONT_FAMILY_POPPINS_REGULAR,
                    ...(selected === item ? selectedItemTextStyle : itemTextStyle),
                  }}
                >
                  {item}
                </CustomText>
              </div>
            ))}
          </div>
        )}

        {descriptionText && (
          <div style={styles.descriptionTextContainer}>
            {!hideHorizontalLine && (
              <div style={styles.horizontalLineContainer}>
                <HorizontalLine color={Colors.TROUT} />
              </div>
            )}
            <CustomText style={styles.descriptionText}>{descriptionText}</CustomText>
          </div>
        )}

        {permissionDetailText && (
          <div>
            <CustomText style={styles.permissionDetailText}>
              {permissionDetailText}
            </CustomText>
            <div style={styles.horizontalLineContainer}>
              <HorizontalLine color={Colors.TROUT} />
            </div>
          </div>
        )}

        {bodyContent}

        <div style={styles.actionButtonsContainer}>
          {actionButtons.map((actionButton) => (
            <Button
              key={actionButton.textProps.text}
              width={actionButton.buttonWidth ? actionButton.buttonWidth : "90%"}
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
            />
          ))}
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  mainContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  headerText: {
    marginTop: "12px",
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: "center" as const,
    paddingHorizontal: "24px",
    padding: "0 24px",
  },
  itemsContainer: {
    gap: "15px",
    padding: "5%",
    height: "auto"
  },
  item: {
    cursor: "pointer",
    padding: "5px 0",
  },
  itemWithIcon: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    cursor: "pointer",
    padding: "5px 0",
  },
  itemText: {
    fontSize: Typography.FONT_SIZE_16,
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
  },
  descriptionTextContainer: {
    gap: "15px",
    marginTop: "15px"
  },
  descriptionText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center" as const,
    paddingHorizontal: "10px",
    paddingBottom: "15px",
    padding: "0 10px 15px",
  },
  permissionDetailText: {
    fontSize: Typography.FONT_SIZE_12,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center" as const,
    paddingHorizontal: "24px",
    paddingBottom: "20px",
    padding: "0 24px 20px",
  },
  actionButtonsContainer: {
    gap: "10px",
    display: "flex",
    flexDirection: "row" as const,
    height: "auto",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  codeInputContainer: {
    paddingHorizontal: "20px",
    padding: "0 20px",
    marginTop: "20px",
    display: "flex",
    justifyContent: "center" as const,
  },
};

export default OverlayModal;
