import React, { useState } from "react";
import { IEventCard } from "../util/types";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import DentCardToggle from "./DentCardToggle";

type DentType = "task" | "event" | "note" | "doc";

const TypeRow: React.FC<{ itemType: string | undefined | null }> = ({ itemType }) => {
  const dentTypeLabelIconMap: Record<DentType, { label: string, icon: React.ReactNode }> = {
    "task": {
      label: "Task",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 0L9.4 5.2L14.6 5.2L10.4 8.4L11.8 13.6L8 10.4L4.2 13.6L5.6 8.4L1.4 5.2L6.6 5.2L8 0Z" fill={Colors.BLUE} />
        </svg>
      ),
    },
    "event": {
      label: "Event",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="3" width="12" height="11" rx="2" stroke={Colors.BLUE} strokeWidth="1.5" />
          <path d="M2 6H14" stroke={Colors.BLUE} strokeWidth="1.5" />
          <path d="M6 9H10" stroke={Colors.BLUE} strokeWidth="1.5" />
          <path d="M5 2L5 4" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M11 2L11 4" stroke={Colors.BLUE} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    "note": {
      label: "Note",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 1H3C1.89543 1 1 1.89543 1 3V13C1 14.1046 1.89543 15 3 15H13C14.1046 15 15 14.1046 15 13V3C15 1.89543 14.1046 1 13 1Z" stroke={Colors.BLUE} strokeWidth="1.5" />
          <path d="M4 5H12" stroke={Colors.BLUE} strokeWidth="1.5" />
          <path d="M4 8H12" stroke={Colors.BLUE} strokeWidth="1.5" />
          <path d="M4 11H8" stroke={Colors.BLUE} strokeWidth="1.5" />
        </svg>
      ),
    },
    "doc": {
      label: "Doc",
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 1H3C1.89543 1 1 1.89543 1 3V13C1 14.1046 1.89543 15 3 15H13C14.1046 15 15 14.1046 15 13V7L9 1Z" stroke={Colors.BLUE} strokeWidth="1.5" />
          <path d="M9 1V7H15" stroke={Colors.BLUE} strokeWidth="1.5" />
        </svg>
      ),
    },
  };

  const temp = dentTypeLabelIconMap[itemType as DentType];
  const type = temp ? itemType as DentType : "note";
  const Icon = dentTypeLabelIconMap[type].icon;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "2px",
      }}
    >
      {Icon}
      <CustomText
        style={{
          fontSize: Typography.FONT_SIZE_12,
          fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
          color: Colors.BLUE,
        }}
      >
        {dentTypeLabelIconMap[type].label}
      </CustomText>
    </div>
  );
};

interface EventCardProps extends IEventCard {
  type?: string;
  eventTimeId?: string;
  task?: any;
}

const EventCard: React.FC<EventCardProps> = ({
  avatar,
  text,
  time,
  color,
  onPress,
  type,
  eventTimeId,
  task,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div
      onClick={onPress}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        width: "95%",
        borderRadius: "8px",
        padding: "8px",
        backgroundColor: Colors.WHITE,
        boxShadow: "0px 1px 2.22px rgba(0, 0, 0, 0.22)",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          backgroundColor: color,
          width: "4px",
          height: "100%",
          borderRadius: "8px",
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "8px",
          paddingTop: "2px",
          paddingBottom: "2px",
          paddingRight: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {time && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignSelf: "flex-start",
                width: "50%",
              }}
            >
              <CustomText
                style={{
                  color: Colors.PRIMARY_DARK_BLUE,
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                }}
              >
                {text}
              </CustomText>
            </div>
          )}
          <TypeRow itemType={type} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              color: Colors.BLUE,
            }}
          >
            {time}
          </CustomText>
          {type === "task" && eventTimeId && (
            <DentCardToggle
              isCompleted={isCompleted}
              setIsCompleted={setIsCompleted}
              eventTimeId={eventTimeId}
              task={task}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
