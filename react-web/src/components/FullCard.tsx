import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Icon from "./Icon";
import { PRIORITY_ITEMS } from "../util/constants";
import { getInitials } from "../util/helpers";
import { useLanguageContext } from "../context/LanguageContext";

// Define a type for the user object to avoid TypeScript errors
interface User {
  FirstName: string;
  LastName: string;
  AvatarImagePath?: string;
}

interface IFullCardProps {
  heading?: string;
  text: string;
  type: string;
  priority?: number;
  user?: User[];
  TimeColor?: string;
  date?: string;
  onClick?: () => void;
}

/**
 * FullCard - A card component for displaying various types of content
 *
 * This component displays a card with a header, content, and footer.
 * It can be used for tasks, notes, events, and documents.
 *
 * @param heading - The title of the card
 * @param text - The main content of the card
 * @param type - The type of card (Task, Note, Event, Document)
 * @param priority - The priority level of the item (1-4)
 * @param user - Array of users associated with the item
 * @param TimeColor - Color for the time display (Red or Blue)
 * @param date - Date string to display
 * @param onClick - Callback function when the card is clicked
 */
export const FullCard: React.FC<IFullCardProps> = ({
  heading,
  text,
  type,
  priority,
  user,
  TimeColor,
  date,
  onClick,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { i18n } = useLanguageContext();

  // Get the appropriate icon and text for the card type
  const getType = (type: string) => {
    const iconMap: Record<string, string> = {
      Task: "task",
      Note: "note",
      Event: "event",
      Document: "document",
    };

    const iconName = iconMap[type] || "task";

    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignSelf: "flex-start",
        width: "50%",
      }}>
        <Icon name={iconName} width={24} height={24} color={Colors.PRIMARY_ELECTRIC_BLUE} />
        <CustomText
          style={{
            marginLeft: "5px",
            fontSize: Typography.FONT_SIZE_12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            fontWeight: Typography.FONT_WEIGHT_500,
            color: Colors.PRIMARY_ELECTRIC_BLUE,
          }}
        >
          {type}
        </CustomText>
      </div>
    );
  };

  // Get the appropriate clock icon and color
  const getTime = (type: string) => {
    const clockMap: Record<string, { icon: string; color: string }> = {
      Red: { icon: "alarm", color: Colors.LIGHT_RED },
      Blue: { icon: "clock-alarm", color: Colors.BLUE },
    };

    return clockMap[type] || { icon: "clock-alarm", color: Colors.BLUE };
  };

  return (
    <div
      onClick={onClick}
      style={{
        marginLeft: "1px",
        width: "219px",
        height: "180px",
        borderRadius: "8px",
        marginBottom: "4px",
        padding: "16px",
        backgroundColor: Colors.WHITE,
        boxShadow: "0px 1px 2.22px rgba(0, 0, 0, 0.22)",
        marginRight: "15px",
        cursor: type === "Document" ? "default" : "pointer",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
      }}>
        {getType(type)}
        <div style={{
          display: "flex",
          flexDirection: "row",
          width: "50%",
          justifyContent: "flex-end",
        }}>
          {date && (
            <>
              <CustomText
                style={{
                  marginRight: "5px",
                  fontSize: Typography.FONT_SIZE_12,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  fontWeight: Typography.FONT_WEIGHT_500,
                  color: getTime(TimeColor || "")?.color,
                }}
              >
                {date}
              </CustomText>
              <Icon
                name={getTime(TimeColor || "")?.icon}
                width={20}
                height={20}
                color={getTime(TimeColor || "")?.color}
              />
            </>
          )}
        </div>
      </div>

      <div
        style={{
          height: "105px",
          paddingTop: "9.5px",
        }}
      >
        {heading && (
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
              fontWeight: Typography.FONT_WEIGHT_600,
              color: Colors.BLUE,
              width: "187px",
            }}
          >
            {heading}
          </CustomText>
        )}
        <CustomText
          style={{
            width: "187px",
            height: "45px",
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.GREY_COLOR,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {text}
        </CustomText>
      </div>

      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: "4px",
        alignSelf: "flex-end",
      }}>
        <div style={{
          width: "90%",
          display: "flex",
          flexDirection: "row",
        }}>
          {user && user.length >= 1 && user[0] && (
            user[0].AvatarImagePath ? (
              <img
                src={user[0].AvatarImagePath}
                alt={`${user[0].FirstName} ${user[0].LastName}`}
                style={{
                  height: "24px",
                  width: "24px",
                  borderRadius: "26px",
                }}
              />
            ) : (
              <div style={{
                alignItems: "center",
                backgroundColor: Colors.BLUE_GREY,
                borderRadius: "30px",
                display: "flex",
                justifyContent: "center",
                height: "26px",
                width: "26px",
              }}>
                <CustomText style={{
                  color: Colors.BLACK,
                  textAlign: "center",
                  justifyContent: "center",
                  padding: "2px",
                  fontSize: Typography.FONT_SIZE_10,
                  fontFamily: Typography.FONT_FAMILY_ABEEZEE_REGULAR,
                  fontWeight: Typography.FONT_WEIGHT_400,
                }}>
                  {getInitials(user[0])}
                </CustomText>
              </div>
            )
          )}

          {user && user.length >= 2 && user[1] && (
            user[1].AvatarImagePath ? (
              <img
                src={user[1].AvatarImagePath}
                alt={`${user[1].FirstName} ${user[1].LastName}`}
                style={{
                  height: "24px",
                  width: "24px",
                  left: "-8px",
                  position: "relative",
                  borderColor: Colors.WHITE,
                  borderRadius: "26px",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              />
            ) : (
              <div style={{
                alignItems: "center",
                backgroundColor: Colors.GRAY,
                borderColor: Colors.WHITE,
                borderRadius: "30px",
                display: "flex",
                justifyContent: "center",
                borderWidth: "1px",
                borderStyle: "solid",
                height: "26px",
                width: "26px",
                position: "relative",
                left: "-8px",
              }}>
                <CustomText style={{
                  color: Colors.BLACK,
                  textAlign: "center",
                  justifyContent: "center",
                  padding: "2px",
                  fontSize: Typography.FONT_SIZE_10,
                  fontFamily: Typography.FONT_FAMILY_ABEEZEE_REGULAR,
                  fontWeight: Typography.FONT_WEIGHT_400,
                }}>
                  {getInitials(user[1])}
                </CustomText>
              </div>
            )
          )}

          {user && user.length >= 3 && (
            <div style={{
              backgroundColor: "#9689b4",
              position: "relative",
              left: "-18px",
              borderColor: Colors.WHITE,
              borderRadius: "30px",
              display: "flex",
              justifyContent: "center",
              borderWidth: "1px",
              borderStyle: "solid",
              height: "24px",
              width: "24px",
            }}>
              <CustomText style={{
                color: Colors.WHITE,
                textAlign: "center",
                justifyContent: "center",
                padding: "2px",
                fontSize: Typography.FONT_SIZE_10,
                fontFamily: Typography.FONT_FAMILY_ABEEZEE_REGULAR,
                fontWeight: Typography.FONT_WEIGHT_400,
              }}>
                {`+${user.length - 2}`}
              </CustomText>
            </div>
          )}
        </div>

        <Icon
          name="flag"
          width={20}
          height={20}
          color={PRIORITY_ITEMS.find((item) => item.value === priority)?.iconColor || Colors.GREY_COLOR}
        />
      </div>
    </div>
  );
};

export default FullCard;
