import React from "react";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import Icon from "./Icon";
import { ITaskCard } from "../util/types";

/**
 * Task - A component for displaying task information
 * 
 * This component displays task information including category, header, subheader,
 * owner avatar, date, and completion status.
 * 
 * @param categoryText - The category of the task
 * @param header - The main title of the task
 * @param subHeader - The subtitle or description of the task
 * @param ownerAvatar - URL of the task owner's avatar
 * @param date - Due date of the task
 * @param complete - Whether the task is complete
 */
const Task: React.FC<ITaskCard> = ({
  categoryText,
  header,
  subHeader,
  ownerAvatar,
  date,
  complete,
}) => {
  return (
    <div
      style={{
        alignSelf: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100px",
        borderRadius: "2px",
        boxShadow: "1px 1px 2px rgba(150, 137, 180, 0.8)",
        backgroundColor: "transparent",
        margin: "2px 0",
      }}
    >
      <div
        style={{
          alignSelf: "center",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          flexDirection: "column",
          width: "90%",
          height: "100px",
          padding: "10px",
          backgroundColor: Colors.WHITE,
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <CustomText
            style={{
              flex: 1,
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.PURPLE,
            }}
          >
            {categoryText}
          </CustomText>
          
          {complete && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Icon name="check-hex" width={16} height={16} color={Colors.TRADE_WIND} />
              <CustomText
                style={{
                  color: Colors.TRADE_WIND,
                  fontSize: Typography.FONT_SIZE_12,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                }}
              >
                COMPLETE
              </CustomText>
            </div>
          )}
        </div>
        
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            // Add strikethrough for completed tasks
            ...(complete && {
              textDecoration: "line-through",
              opacity: 0.6,
            }),
          }}
        >
          {header}
        </CustomText>

        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.PURPLE,
            // Add strikethrough for completed tasks
            ...(complete && {
              textDecoration: "line-through",
              opacity: 0.6,
            }),
          }}
        >
          {subHeader}
        </CustomText>
        
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              height: "30px",
              width: "30px",
              alignSelf: "flex-start",
            }}
          >
            {ownerAvatar && (
              <img
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "50%",
                }}
                src={ownerAvatar}
                alt="Task owner"
              />
            )}
          </div>
          
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
              gap: "4px",
            }}
          >
            <Icon name="alarm" width={20} height={20} color={Colors.GREY_COLOR} />
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_12,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              }}
            >
              {date}
            </CustomText>
            
            {!complete && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "28px",
                  backgroundColor: "rgba(255, 211, 211, 0.49)",
                  borderRadius: "10px",
                  marginLeft: "2px",
                  padding: "0 5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <Icon name="flag" width={20} height={20} color="#FF6961" />
                  <CustomText
                    style={{
                      color: "#D95B15",
                      fontSize: Typography.FONT_SIZE_10,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                    }}
                  >
                    High
                  </CustomText>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
