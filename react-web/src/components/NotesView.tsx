import React, { useState } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
import CustomText from "./CustomText";

interface NotesViewProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value?: string;
  changeValue?: (newValue: string) => void;
  hideEdit?: boolean;
  onSave?: () => void;
}

/**
 * NotesView - A component for displaying and editing notes
 * 
 * This component provides a text area for entering notes with a save button
 * that appears when changes are made.
 * 
 * @param value - The current note text
 * @param changeValue - Callback function when the note text changes
 * @param hideEdit - Whether to hide the edit functionality
 * @param onSave - Callback function when the save button is pressed
 * @param textInputProps - Additional props for the textarea element
 */
const NotesView: React.FC<NotesViewProps> = ({ 
  value, 
  changeValue, 
  hideEdit, 
  onSave, 
  ...textInputProps 
}) => {
  const [initialValue, setInitialValue] = useState(value);
  const { i18n } = useLanguageContext();

  return (
    <div style={styles.notesViewContainer}>
      <div style={styles.notesViewHeadingContainer}>
        <CustomText style={styles.sectionHeadingContainer}>
          {i18n.t("RelevantNotes")}
        </CustomText>
        {(!hideEdit && initialValue !== value && onSave && value && value.length > 0) && (
          <CustomText
            style={{
              color: Colors.BLUE,
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationColor: Colors.BLUE,
              cursor: "pointer",
            }}
            onClick={() => {
              onSave();
              setInitialValue(value);
            }}
          >
            {i18n.t('Save')}
          </CustomText>
        )}
      </div>

      <div style={styles.inputFieldContainer}>
        <textarea
          placeholder={i18n.t("AddTextHere")}
          readOnly={hideEdit}
          style={styles.notesInputField}
          value={value}
          onChange={(e) => changeValue && changeValue(e.target.value)}
          {...textInputProps}
        />
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  notesViewContainer: { 
    display: "flex",
    flexDirection: "column",
    gap: "20px", 
    marginTop: "5%" 
  },
  notesViewHeadingContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  inputFieldContainer: {
    maxHeight: "100px",
    height: "100px",
    backgroundColor: "#F2F4F8",
    borderRadius: "10px",
  },
  notesInputField: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    margin: "10px",
    width: "calc(100% - 20px)",
    height: "calc(100% - 20px)",
    border: "none",
    backgroundColor: "transparent",
    resize: "none",
    outline: "none",
  },
  sectionHeadingContainer: {
    flex: 1,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.BLUE,
  },
};

export default NotesView;
