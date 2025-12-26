import React from "react";
import { IActivityCard } from "../util/types";
import CustomText from "./CustomText";
import { Colors, Typography } from "../styles";

const ActivityCard: React.FC<IActivityCard> = ({
  heading,
  name,
  initials,
  avatar,
  date,
  time,
  onPress
}) => {
  return (
    <div 
      style={{
        minWidth: '100%',
        height: '52px',
        borderRadius: '6px',
        padding: '8px',
        backgroundColor: Colors.WHITE,
        boxShadow: '0px 1px 2.22px rgba(0, 0, 0, 0.22)',
        display: 'flex',
        flexDirection: "row",
        alignItems: "flex-start",
        gap: '10px',
        cursor: onPress ? 'pointer' : 'default'
      }}
      onClick={() => onPress && onPress()}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatar ? (
          <img 
            src={avatar} 
            alt={`${name}'s avatar`}
            style={{
              height: '32px',
              width: '32px',
              borderRadius: '32px',
              objectFit: 'cover'
            }} 
          />
        ) : (
          <div style={{
            alignItems: 'center',
            backgroundColor: Colors.BLUE_GREY,
            borderRadius: '32px',
            display: 'flex',
            justifyContent: "center",
            height: '32px',
            width: '32px',
          }}>
            <CustomText
              style={{
                color: Colors.BLACK,
                textAlign: "center",
                padding: '2px',
                fontSize: Typography.FONT_SIZE_10,
                fontFamily: Typography.FONT_FAMILY_ABEEZEE_REGULAR,
                fontWeight: Typography.FONT_WEIGHT_400,
              }}
            >
              {initials}
            </CustomText>
          </div>
        )}
      </div>
      <div style={{
        height: '100%',
        justifyContent: "space-between",
        display: 'flex',
        flexDirection: "column",
        alignItems: "flex-start",
        paddingTop: '2px',
        paddingBottom: '2px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: "row",
          justifyContent: "space-between",
          gap: '4px',
        }}>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
            fontWeight: Typography.FONT_WEIGHT_BOLD,
            lineHeight: '16px',
          }}>
            {name}
          </CustomText>
          <CustomText style={{
            color: Colors.BLUE,
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            fontWeight: Typography.FONT_WEIGHT_400,
            lineHeight: '16px',
          }}>
            {heading.length > 30 ? `${heading.slice(0,30)}...` : heading}
          </CustomText>
        </div>
        <CustomText style={{
          color: Colors.PRIMARY_DARK_BLUE,
          fontSize: Typography.FONT_SIZE_14,
          fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
          fontWeight: Typography.FONT_WEIGHT_400,
        }}>
          {`${date} | ${time}`}
        </CustomText>
      </div>
    </div>
  );
};

export default ActivityCard;
