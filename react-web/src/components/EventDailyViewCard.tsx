import React, { useState, useEffect, useRef } from "react";
import { IEventCard } from "../util/types";
import { Colors, Typography } from "../styles";
import CustomText from "./CustomText";
import DentCardToggle from "./DentCardToggle";
import moment from "moment";

type DentType = "task" | "event" | "note" | "doc";

interface TypeRowProps {
  itemType: string | undefined | null;
  durationInMinutes: number;
  isAllDay: boolean;
  isNarrow?: boolean;
}

const TypeRow: React.FC<TypeRowProps> = ({
  itemType,
  durationInMinutes,
  isAllDay,
  isNarrow
}) => {
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

  const shouldShowIcon = isNarrow
    ? durationInMinutes >= 60
    : durationInMinutes > 0;
  const shouldShowLabel = isNarrow
    ? durationInMinutes >= 60
    : durationInMinutes > 20;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "2px",
      }}
    >
      {shouldShowIcon && Icon}
      {!isAllDay && shouldShowLabel && (
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_12,
            fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
            color: Colors.BLUE,
          }}
        >
          {dentTypeLabelIconMap[type].label}
        </CustomText>
      )}
    </div>
  );
};

interface EventDailyViewCardProps extends IEventCard {
  type: string;
  eventTimeId?: string;
  task?: any;
  onToggle?: (isCompleted: boolean) => void;
  isCalendarView?: boolean;
}

const EventDailyViewCard: React.FC<EventDailyViewCardProps> = ({
  avatar,
  text,
  time,
  color,
  onPress,
  type,
  task,
  start,
  end,
  eventTimeId,
  isAllDay,
  onToggle,
  isCalendarView = false,
}) => {
  // For tasks, Active/active: false means completed, Active/active: true means not completed
  const [isCompleted, setIsCompleted] = useState(
    type === "task" ? (
      (task?.Active === false || task?.active === false) ||
      (task?.Completed === true || task?.completed === true)
    ) : false
  );
  const [isNarrow, setIsNarrow] = useState(true);

  // Parse start and end time using Moment.js
  const startTime = start ? moment(start, "h:mmA") : moment(); // Example format: "4:00PM"
  const endTime = end ? moment(end, "h:mmA") : moment().add(1, 'hour');

  // Calculate the duration in minutes between start and end times
  const durationInMinutes = endTime.diff(startTime, "minutes");

  // Conditionally render parts of the EventCard based on duration
  // In calendar view, always show full details for tasks to ensure toggle is on the right side
  const shouldShowFullDetails = durationInMinutes > 45 || (isCalendarView && type === "task");

  // Update completion status when task changes
  useEffect(() => {
    if (type === "task" && task) {
      setIsCompleted(
        (task.Active === false || task.active === false) ||
        (task.Completed === true || task.completed === true)
      );
    }
  }, [task, type]);

  // Calculate font size based on the duration
  const getFontSize = (duration: number) => {
    if (duration <= 15) return Typography.FONT_SIZE_11;
    if (duration <= 30) return Typography.FONT_SIZE_14;
    if (duration <= 45) return Typography.FONT_SIZE_14;
    return Typography.FONT_SIZE_16;
  };

  // Reference to measure the width of the card
  const cardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (cardRef.current) {
        setIsNarrow(cardRef.current.offsetWidth < 200);
      }
    };

    // Initial measurement
    updateWidth();

    // Add resize listener
    window.addEventListener('resize', updateWidth);

    // Cleanup
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={onPress}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "8px",
        width: "95%",
        height: isAllDay ? "70%" : "100%",
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
          height: durationInMinutes < 30 ? "70%" : "80%",
          alignSelf: "center",
          borderRadius: "8px",
        }}
      />
      <div
        style={{
          flex: 1,
          height: "80%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: isNarrow ? 0 : "4px",
          alignSelf: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isNarrow ? "column-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            height: isAllDay || durationInMinutes < 30 ? "100%" : "auto",
            gap: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flex: isNarrow ? 0 : 1,
              alignSelf: !isNarrow && durationInMinutes < 30
                ? "flex-end"
                : isAllDay
                ? "center"
                : "flex-start",
            }}
          >
            <CustomText
              style={{
                color: Colors.PRIMARY_DARK_BLUE,
                fontFamily: Typography.FONT_FAMILY_POPPINS_BOLD,
                fontSize: getFontSize(durationInMinutes),
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                // Add strikethrough for completed tasks
                ...(type === "task" && isCompleted && {
                  textDecoration: "line-through",
                  opacity: 0.6,
                }),
              }}
            >
              {text}
            </CustomText>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: durationInMinutes < 45 ? "row" : "column-reverse",
              justifyContent: "center",
              alignItems: isNarrow ? "flex-start" : "flex-end",
              gap: durationInMinutes < 45 ? "4px" : 0,
              alignSelf: durationInMinutes < 30
                ? "flex-end"
                : isAllDay
                ? "center"
                : "flex-start",
            }}
          >
            {durationInMinutes <= 45 && !isNarrow && (
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_12,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  color: Colors.PRIMARY_DARKER_BLUE,
                  height: "16px",
                }}
              >
                {`${durationInMinutes} Min`}
              </CustomText>
            )}

            <TypeRow
              itemType={type}
              durationInMinutes={durationInMinutes}
              isAllDay={isAllDay ?? false}
              isNarrow={isNarrow}
            />
          </div>
        </div>

        {shouldShowFullDetails && !isAllDay && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_12,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: Colors.PRIMARY_DARKER_BLUE,
              }}
            >
              {`${start} - ${end}`}
            </CustomText>
            {type === "task" && (
              <div onClick={(e) => e.stopPropagation()}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CustomText
                    style={{
                      fontSize: Typography.FONT_SIZE_10,
                      fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                      color: Colors.PRIMARY_DARK_BLUE,
                      opacity: 0.4,
                    }}
                  >
                    {isCompleted ? "Complete" : "Incomplete"}
                  </CustomText>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      const newCompletedState = !isCompleted;
                      setIsCompleted(newCompletedState);

                      // Call the onToggle callback if provided
                      if (onToggle) {
                        onToggle(newCompletedState);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: isCompleted ? "flex-end" : "flex-start",
                        borderRadius: "30px",
                        border: `1px solid ${isCompleted ? Colors.PISTACHIO_GREEN : "#AAAAAA"}`,
                        backgroundColor: isCompleted ? Colors.PISTACHIO_GREEN : "#AAAAAA",
                        padding: "2px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "15px",
                          height: "15px",
                          backgroundColor: Colors.WHITE,
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDailyViewCard;
