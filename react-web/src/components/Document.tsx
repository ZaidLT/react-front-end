import React from "react";
import { Colors, Typography } from "../styles";
import HorizontalLine from "./HorizontalLine";
import CustomText from "./CustomText";

import { downloadFile } from '../services/documentService';

interface DocumentProps {
  title: string;
  withBg?: boolean;
  FileTypeIcon?: React.FC;
  url: string;
  uploadDate?: string;
}

/**
 * Document - A component for displaying document items
 *
 * This component displays a document with its title, icon, and optional upload date.
 * When clicked, it attempts to open the document URL.
 *
 * @param title - The document title
 * @param withBg - Whether to show a background color
 * @param FileTypeIcon - Icon component for the document type
 * @param url - URL to the document
 * @param uploadDate - Optional date when the document was uploaded
 */
const Document: React.FC<DocumentProps> = ({
  title,
  withBg = false,
  FileTypeIcon,
  url,
  uploadDate
}) => {
  const handleDocumentClick = async () => {
    try {
      await downloadFile(url, title);
    } catch {
      // In a real implementation, we would use a snackbar or toast notification
      console.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        ...(withBg && { backgroundColor: Colors.WHITE }),
      }}
    >
      <div
        style={styles.contentContainer}
        onClick={handleDocumentClick}
      >
        {FileTypeIcon && <FileTypeIcon />}
        <div style={styles.titleUploadDateStackContainer}>
          <CustomText style={styles.titleText}>{title}</CustomText>
          {uploadDate && <CustomText style={styles.uploadDateText}>{uploadDate}</CustomText>}
        </div>
      </div>
      {!withBg && (
        <div style={styles.horizontalContainer}>
          <HorizontalLine color={Colors.GREY_COLOR} />
        </div>
      )}
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
    minHeight: "50px",
    paddingLeft: "20px",
    paddingRight: "20px",
    borderRadius: "6px",
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    marginLeft: "10px",
    marginRight: "10px",
    gap: "10px",
    cursor: "pointer",
  },
  titleText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  },
  uploadDateText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.GREY_COLOR,
  },
  horizontalContainer: {
    flex: 1,
    width: "100%",
    opacity: 0.1
  },
  titleUploadDateStackContainer: {
    display: "flex",
    flexDirection: "column",
  }
};

export default Document;
