import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { INotification } from "../util/types";
import CustomText from "./CustomText";
import { Typography } from "../styles";

const Notification: React.FC<INotification> = ({
  from,
  body,
  type,
  subHive,
  date,
  isUnread
}) => {
  // SVG icons for different notification types
  const ReminderIcon = () => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 2.5L18.5 9.5L26 10.5L20.5 16L22 23.5L15 20L8 23.5L9.5 16L4 10.5L11.5 9.5L15 2.5Z" fill="#6FF9D8" stroke="#333E73" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 15L14 18L20 12" stroke="#333E73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const AlertIcon = () => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 3.75L26.25 23.75H3.75L15 3.75Z" fill="#FFCC80" stroke="#333E73" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M15 13.75V17.5" stroke="#333E73" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15" cy="20" r="1.25" fill="#333E73"/>
    </svg>
  );

  const UpdateIcon = () => (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="11.25" fill="#C3B7FF" stroke="#333E73" strokeWidth="1.5"/>
      <path d="M15 8.75V15H20" stroke="#333E73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (type) {
      case "Reminder":
        return <ReminderIcon />;
      case "Alert":
        return <AlertIcon />;
      case "Update":
        return <UpdateIcon />;
      default:
        return <AlertIcon />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        width: "100%",
        minHeight: "60px",
        padding: "8px 20px",
        borderRadius: "6px",
        gap: "10px",
        background: isUnread
          ? "linear-gradient(135deg, #DEF7F6, #EDEEFF)"
          : "#ffffff",
      }}
    >
      {from ? (
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
          <img
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
            src={from.avatar}
            alt={`${from.name}`}
          />
        </div>
      ) : (
        getIcon()
      )}

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          width: "100%",
          gap: "2px",
        }}
      >
        <CustomText
          style={{
            fontSize: 14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
            color: "#000728",
          }}
        >
          {body}
        </CustomText>
        <CustomText
          style={{
            fontSize: 12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            color: "#000728",
          }}
        >
          {date} · {subHive}
        </CustomText>
      </div>
    </div>
  );
};

export default Notification;
