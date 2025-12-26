import React from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";
import Icon from "./Icon";
import { useLanguageContext } from "../context/LanguageContext";

interface InputField {
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  isButton?: boolean;
  onPress?: () => void;
  editable?: boolean;
  keyboardType?: string;
  multiline?: boolean;
}

interface ITextInputsModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  submit: () => void;
  headerText: string;
  fields: InputField[];
  loading?: boolean;
}

/**
 * TextInputsModal - A modal with multiple text input fields
 *
 * This component displays a modal with multiple text input fields, each with an icon.
 * It can also include button fields that trigger actions when pressed.
 *
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback function when the modal is closed
 * @param submit - Callback function when the form is submitted
 * @param headerText - The header text for the modal
 * @param fields - Array of input field configurations
 * @param loading - Whether the modal is in a loading state
 */
const TextInputsModal: React.FC<ITextInputsModalProps> = ({
  isVisible,
  onRequestClose,
  fields,
  headerText,
  submit,
  loading,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      contentStyle={{
        width: "100%",
        maxWidth: "100%",
        borderRadius: "18px 18px 0 0",
        padding: "0",
        margin: "0",
        position: "absolute",
        bottom: "0",
      }}
    >
      <div style={styles.mainContainer}>
        <div style={{ alignSelf: "center", marginTop: "20px" }}>
          <Icon name="indicator" width={40} height={4} />
        </div>

        <CustomText style={styles.headerText}>{headerText}</CustomText>

        <div style={styles.horizontalLineContainer}>
          <HorizontalLine color={Colors.BLACK} />
        </div>

        <div style={styles.fieldsContainer}>
          {fields.map((field, index) => (
            <div
              key={index}
              style={styles.fieldContainer}
            >
              <field.Icon width={24} height={24} />
              {field.isButton ? (
                <button
                  onClick={() => field.onPress && field.onPress()}
                  style={styles.buttonField}
                >
                  <CustomText
                    style={{
                      ...styles.buttonText,
                      opacity: field.value ? 1 : 0.5,
                      color: field.value ? Colors.BLUE : "grey",
                    }}
                  >
                    {field.value || field.placeholder}
                  </CustomText>
                </button>
              ) : (
                <input
                  style={styles.textInput}
                  disabled={!field.editable}
                  type={field.keyboardType === "email-address" ? "email" : "text"}
                  placeholder={field.placeholder}
                  onChange={(e) => field.onChangeText && field.onChangeText(e.target.value)}
                  value={field.value}
                  {...(field.multiline ? { rows: 3 } : {})}
                />
              )}
            </div>
          ))}
        </div>

        <div style={styles.buttonsContainer}>
          <Button
            width="90%"
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: "Save",
              color: Colors.WHITE,
            }}
            onButtonClick={submit}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
          />
        </div>
      </div>

      {loading && (
        <div style={styles.loadingIndicatorContainer}>
          <div className="loading-spinner"></div>
        </div>
      )}
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    backgroundColor: Colors.WHITE,
    borderRadius: "18px 18px 0 0",
    paddingBottom: "20px",
    boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.15)",
  },
  headerText: {
    marginTop: "15px",
    fontSize: Typography.FONT_SIZE_18,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: "center",
  },
  horizontalLineContainer: {
    width: "100%",
    opacity: 0.1,
  },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "0 20px",
  },
  fieldContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "10px",
    alignItems: "center",
    height: "40px",
    width: "100%",
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: "none",
    outline: "none",
  },
  buttonField: {
    flex: 1,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
  },
  buttonText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
    gap: "15px",
  },
  loadingIndicatorContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
};

export default TextInputsModal;
