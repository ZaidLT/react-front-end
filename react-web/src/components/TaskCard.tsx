import React from "react";
import { ITaskCard, TASK_STATE } from "../util/types";
import { Colors, Typography } from "../styles";
import { PRIORITY_ITEMS } from "../util/constants";
import CustomText from "./CustomText";
import { useLanguageContext } from '../context/LanguageContext';

export const TaskCard: React.FC<ITaskCard> = ({
  categoryText,
  header,
  subHeader,
  ownerAvatar,
  date,
  onClick,
  isVerticalCard = false,
  changeState,
  state,
  priority,
}) => {
  const { i18n } = useLanguageContext();

  // Simplified translation function (to be replaced with proper i18n)
  const translate = (key: string) => key;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: isVerticalCard ? "100%" : "220px",
        height: isVerticalCard ? "110px" : "180px",
        borderRadius: "8px",
        boxShadow: "4px 4px 5px rgba(150, 137, 180, 0.8)",
        backgroundColor: "transparent",
        marginBottom: "4px",
        marginTop: isVerticalCard ? "5px" : "0",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexDirection: "column",
          width: isVerticalCard ? "90%" : "220px",
          height: isVerticalCard ? "100%" : "180px",
          padding: "10px",
          backgroundColor: Colors.WHITE,
          borderRadius: "8px",
        }}
      >
        {categoryText && (
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.PURPLE,
            }}
          >
            {categoryText}
          </CustomText>
        )}
        <div style={{ display: "flex", flexDirection: "row" }}>
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
              color: Colors.MIDNIGHT,
              flex: 1,
            }}
          >
            {header}
          </CustomText>
          {state && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                state === TASK_STATE.TO_DO && changeState && changeState();
              }}
              style={{ 
                display: "flex", 
                flexDirection: "row", 
                alignItems: "center", 
                gap: "5px",
                cursor: "pointer",
              }}
            >
              {state === TASK_STATE.COMPLETED ? (
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#4EAE97",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              ) : (
                <svg width="25" height="25" viewBox="0 0 25 25" fill={Colors.PRIMARY_ELECTRIC_BLUE} xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 0L14.9 9.4L24.3 9.4L16.7 15.2L19.1 24.6L12.5 18.8L5.9 24.6L8.3 15.2L0.7 9.4L10.1 9.4L12.5 0Z" />
                </svg>
              )}
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_12,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
                  color: state === TASK_STATE.COMPLETED ? "#4EAE97" : Colors.PRIMARY_ELECTRIC_BLUE,
                }}
              >
                {state === TASK_STATE.COMPLETED ? "COMPLETE" : translate('ToDo')}
              </CustomText>
            </div>
          )}
        </div>
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: Colors.PURPLE,
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
                src={ownerAvatar}
                alt={i18n.t('Owner')}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke={Colors.BLUE} strokeWidth="1.5"/>
              <path d="M10 5V10L13 13" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <CustomText>{date || ""}</CustomText>
            {priority !== undefined && priority !== 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "28px",
                  width: "28px",
                  backgroundColor: PRIORITY_ITEMS.find(
                    (item) => item.value === priority
                  )?.selectionColor || "rgba(255, 211, 211, 0.49)",
                  borderRadius: "4px",
                  marginLeft: "2px",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 1L11.854 7.764H19L13.072 11.972L14.926 18.736L10 14.528L5.074 18.736L6.928 11.972L1 7.764H8.146L10 1Z" fill={
                    PRIORITY_ITEMS.find((item) => item.value === priority)?.iconColor || "#FF6961"
                  }/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
