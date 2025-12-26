import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import UserAvatarsGroup from "./UserAvatarsGroup";
import Icon from "./Icon";

interface HiveEventTileContent {
  startTime: string;
  endTime: string;
  description: string;
  users?: any[];
  highlightColor?: string;
}

interface HiveEventTileProps {
  content: HiveEventTileContent;
  onPress?: () => void;
}

/**
 * HiveEventTile - A component for displaying event information in a tile format
 * 
 * This component displays event information including start and end times, description,
 * and users associated with the event. It has a colored accent on the left side.
 * 
 * @param content - The content of the event tile (startTime, endTime, description, users, highlightColor)
 * @param onPress - Callback function when the tile is clicked
 */
const HiveEventTile: React.FC<HiveEventTileProps> = ({ content, onPress }) => {
  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("more pressed!");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "80%",
        maxWidth: "500px",
        margin: "0 auto",
        borderRadius: "10px",
        backgroundColor: content?.highlightColor || Colors.SECONDARY_PURPLE,
        cursor: onPress ? "pointer" : "default",
      }}
      onClick={onPress}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: Colors.WHITE,
          borderTopLeftRadius: "5px",
          borderBottomLeftRadius: "5px",
          padding: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <CustomText
            style={{
              flex: 1,
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            }}
          >
            {`${content?.startTime}-${content?.endTime}`}
          </CustomText>

          {content?.users && (
            <UserAvatarsGroup users={content.users} size={3} />
          )}
        </div>

        <div
          style={{
            marginLeft: "5px",
            marginRight: "15%",
          }}
        >
          <CustomText
            style={{
              textAlign: "left",
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              fontWeight: Typography.FONT_WEIGHT_BOLD,
            }}
          >
            {content?.description}
          </CustomText>
        </div>
      </div>
      
      <div
        style={{
          display: "flex",
          backgroundColor: Colors.WHITE,
          height: "100%",
          borderTopRightRadius: "10px",
          borderBottomRightRadius: "10px",
          padding: "10px 10px 0 0",
        }}
        onClick={handleMoreClick}
      >
        <Icon name="more-horizontal" width={24} height={24} color={Colors.GREY_COLOR} />
      </div>
    </div>
  );
};

export default HiveEventTile;
