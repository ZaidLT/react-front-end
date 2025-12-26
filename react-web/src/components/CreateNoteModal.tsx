import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import { useLanguageContext } from "../context/LanguageContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Button from "./Button";
import Modal from "./Modal";
import Icon from "./Icon";

/**
 * CreateNoteModal - A component for creating new notes
 *
 * This component displays a modal for creating new notes with title and content.
 */
interface CreateNoteModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onSave?: (title: string, content: string) => void;
  initialTitle?: string;
  initialContent?: string;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isVisible,
  onRequestClose,
  onSave,
  initialTitle = "",
  initialContent = "",
}) => {
  const { i18n } = useLanguageContext();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setTitle(initialTitle);
      setContent(initialContent);
    }
  }, [isVisible, initialTitle, initialContent]);

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(title, content);
    }
    onRequestClose();
  };

  const footerContent = (
    <>
      <Button
        onButtonClick={onRequestClose}
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
        disabled={title.trim().length === 0}
        onButtonClick={handleSave}
        textProps={{
          text: i18n.t("Save"),
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
    </>
  );

  return (
    <Modal
      isVisible={isVisible}
      title={i18n.t("CreateNote")}
      onClose={onRequestClose}
      footerContent={footerContent}
      contentStyle={styles.contentContainer}
    >
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
          placeholder={i18n.t("NoteTitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div style={styles.textAreaContainer}>
        <textarea
          style={styles.textArea}
          placeholder={i18n.t("NoteContent")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </Modal>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  contentContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
    borderBottom: `1px solid ${Colors.BLUE}`,
  },
  textAreaContainer: {
    width: "100%",
  },
  textArea: {
    width: "100%",
    minHeight: "150px",
    padding: "10px",
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    border: `1px solid ${Colors.LIGHT_GREY}`,
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
  },
};

export default CreateNoteModal;
