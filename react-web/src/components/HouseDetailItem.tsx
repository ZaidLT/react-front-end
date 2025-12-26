import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";

// Define the interface based on the React Native component
export interface IHouseDetailItem {
  content: {
    icon?: React.ReactNode;
    value?: string;
    onChange?: (value: string) => void;
  };
  editingEnabled: boolean;
  isButton?: boolean;
  onPress?: () => void;
  isGooglePlaceInput?: boolean;
  placeholder?: string;
  [key: string]: any; // For additional input props
}

const HouseDetailItem: React.FC<IHouseDetailItem> = ({
  content,
  editingEnabled,
  isButton,
  onPress,
  isGooglePlaceInput,
  placeholder,
  ...inputProps
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (content.onChange) {
      content.onChange(e.target.value);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          ...(editingEnabled && {
            borderBottom: "1px solid #E3E3EF",
            borderRadius: "5px",
            padding: "2px",
          }),
        }}
      >
        {content.icon}
        {isButton ? (
          <div
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              cursor: editingEnabled ? "pointer" : "default",
            }}
            onClick={() => {
              if (editingEnabled && onPress) onPress();
            }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.GREY_COLOR,
                opacity: content.value ? 1 : 0.5,
              }}
            >
              {content.value || placeholder}
            </CustomText>
          </div>
        ) : (
          <input
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.GREY_COLOR,
              lineHeight: `${Typography.FONT_SIZE_24}px`,
              flex: 1,
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
            disabled={!editingEnabled}
            onChange={handleChange}
            value={content.value || ""}
            placeholder={placeholder}
            {...inputProps}
          />
        )}
      </div>
    </div>
  );
};

export default HouseDetailItem;
