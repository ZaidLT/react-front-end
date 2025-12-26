import React, { useMemo } from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";

// Add CSS for focus state
const focusStyles = `
  .text-input-wrapper:focus-within {
    border-color: ${Colors.BLUE} !important;
    box-shadow: 0 0 0 3px rgba(0, 14, 80, 0.1);
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = focusStyles;
  document.head.appendChild(styleElement);
}

interface ISelectedItem {
  icon: string;
  unique_Id: string;
  title: string;
}

interface IRenameModalProps {
  isVisible: boolean;
  category: string;
  onRequestClose: () => void;
  selectedItem: ISelectedItem;
  onPress?: () => void;
  setName?: (text: string) => void;
  name?: string;
  heading?: string;
  subheading?: string;
  icon?: string;
}

/**
 * RenameModal - A modal for renaming items
 *
 * This component displays a modal that allows users to rename various items like spaces,
 * appliances, etc. It includes an input field for the new name and validation for name length.
 *
 * @param isVisible - Whether the modal is visible
 * @param category - The category of the item being renamed
 * @param onRequestClose - Callback function when the modal is closed
 * @param selectedItem - The item being renamed
 * @param onPress - Callback function when the save button is pressed
 * @param setName - Function to update the name state
 * @param name - Current name value
 * @param heading - Optional heading text for the modal
 * @param subheading - Optional subheading text for the modal
 * @param icon - Optional icon name to display
 */
const RenameModal: React.FC<IRenameModalProps> = ({
  isVisible,
  onRequestClose,
  category,
  selectedItem,
  onPress,
  setName,
  name,
  heading,
  subheading,
  icon
}) => {
  const { i18n } = useLanguageContext();

  const validationError: string = useMemo(() => {
    if (!!name && name.length >= 20) {
      return i18n.t('NameCannotBeMoreThan20Characters');
    }
    return '';
  }, [name, i18n]);

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "90%",
        maxWidth: "500px",
        borderRadius: "18px",
        padding: "0",
      }}
    >
      <div style={styles.mainContainer}>
        {heading && (
          <CustomText style={{...styles.headerText, textAlign: "center"}}>
            {heading}
          </CustomText>
        )}

        <div style={styles.horizontalLineContainer}>
          <HorizontalLine color={Colors.BLACK} />
        </div>

        <div style={{ padding: "16px" }}>
          {subheading && (
            <CustomText style={styles.descText}>
              {subheading}
            </CustomText>
          )}

          <div style={styles.inputContainer}>
            <div style={styles.inputWrapper}>
              {icon && <Icon name={icon} width={24} height={24} />}
              <div style={styles.textInputWrapper} className="text-input-wrapper">
                <input
                  style={styles.textInput}
                  placeholder={`Rename the ${category}`}
                  onChange={(e) => setName && setName(e.target.value)}
                  value={name}
                />
                <Icon name="short-text" width={20} height={20} color={Colors.GREY_COLOR} />
              </div>
            </div>
            <CustomText style={styles.validationError}>
              {validationError}
            </CustomText>
          </div>
        </div>

        <div style={styles.buttonsContainer}>
          <Button
            width="40%"
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: i18n.t('Cancel'),
              color: Colors.BLUE,
            }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
          />

          <Button
            disabled={!name || name.length === 0 || validationError.length > 0}
            width="40%"
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: "Save",
            }}
            onButtonClick={onPress}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties | any> = {
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "18px",
  },
  headerText: {
    paddingHorizontal: "24px",
    paddingVertical: "16px",
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: "left",
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
  },
  descText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
    textAlign: "center",
    paddingBottom: "16px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    paddingHorizontal: "5%",
    paddingBottom: "20px",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
  },
  textInputWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_GREY_BACKGROUND,
    border: `2px solid ${Colors.LIGHT_GREY}`,
    borderRadius: "8px",
    padding: "12px 16px",
    gap: "8px",
    transition: "border-color 0.2s ease",
  },
  textInput: {
    flex: 1,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    color: Colors.BLACK,
  },
  validationError: {
    fontSize: Typography.FONT_SIZE_10,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.RED,
    marginTop: "5px",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginBottom: "24px",
  },
};

export default RenameModal;
