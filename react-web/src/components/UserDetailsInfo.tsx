import React from "react";
import { Colors, Typography } from "../styles";
import Icon from "./Icon";

export interface UserDetailsInfoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.FC<{ width?: number; height?: number }>;
  value: string;
  editable?: boolean;
  changeValue?: (value: string) => void;
  copyable?: boolean;
}

/**
 * UserDetailsInfo - A component for displaying user information with an icon
 *
 * This component displays user information with an icon and optional editing and copying functionality.
 *
 * @param icon - The icon component to display
 * @param value - The value to display
 * @param editable - Whether the value can be edited
 * @param changeValue - Callback for when the value changes
 * @param copyable - Whether the value can be copied to clipboard
 */
const UserDetailsInfo: React.FC<UserDetailsInfoProps> = ({
  icon: IconComponent,
  value,
  editable = false,
  changeValue,
  copyable,
  ...inputProps
}) => {
  const handleCopyToClipboard = async () => {
    try {
      // Check if we're in a browser environment and if navigator.clipboard exists
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        // In a real implementation, this would show a snackbar
        console.log("Copied to clipboard!");
      } else {
        console.warn("Clipboard API not available in this environment");
      }
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (changeValue) {
      changeValue(e.target.value);
    }
  };

  return (
    <div style={styles.basicInfoContainer}>
      <IconComponent width={24} height={24} />
      <div
        style={{
          flex: 1,
          height: 40,
          ...(editable && {
            border: "1px solid #E3E3EF",
            borderRadius: 10,
          }),
        }}
      >
        <input
          disabled={!editable}
          style={{
            ...styles.basicInfoValueText,
            ...(editable && { marginLeft: 10 }),
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            width: "100%",
            height: "100%",
          }}
          value={value}
          onChange={handleChange}
          {...inputProps}
        />
      </div>
      {copyable && (
        <div
          onClick={handleCopyToClipboard}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="copy" width={18} height={18} color={Colors.GREY_COLOR} />
        </div>
      )}
    </div>
  );
};

const styles = {
  basicInfoContainer: {
    display: "flex",
    flexDirection: "row" as const,
    gap: 10,
    alignItems: "center"
  },
  basicInfoValueText: {
    flex: 1,
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.BLUE,
  },
};

export default UserDetailsInfo;
