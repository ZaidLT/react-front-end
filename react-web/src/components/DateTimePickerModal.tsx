import React, { useState, useEffect } from "react";
import { Colors, Typography } from "../styles";
import Modal from "./Modal";
import Button from "./Button";
import CustomText from "./CustomText";
import HorizontalLine from "./HorizontalLine";
import { useLanguageContext } from "../context/LanguageContext";
import { validateTimeConstraints } from "../utils/datetimeValidation";

interface DateTimePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  mode?: "date" | "time" | "datetime";
  title?: string;
  minDate?: Date;
  maxDate?: Date;
  disableConfirm?: boolean;
  errorMessage?: string;
  minTime?: Date; // For time validation (e.g., end time must be after start time)
  maxTime?: Date; // For time validation
}

/**
 * DateTimePickerModal - A modal for selecting date and time
 * 
 * This component displays a modal with date and/or time pickers based on the mode.
 * It allows the user to select a date, time, or both and confirm the selection.
 * 
 * @param isVisible - Whether the modal is visible
 * @param onClose - Callback function when the modal is closed
 * @param onConfirm - Callback function when the selection is confirmed
 * @param initialDate - Initial date to display (default: current date)
 * @param mode - Mode of the picker: "date", "time", or "datetime" (default: "datetime")
 * @param title - Title of the modal (default: "Select Date & Time")
 */
const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialDate = new Date(),
  mode = "datetime",
  title = "Select Date & Time",
  minDate,
  maxDate,
  disableConfirm = false,
  errorMessage,
  minTime,
  maxTime,
}) => {
  const { i18n } = useLanguageContext();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync selectedDate when initialDate changes (when modal reopens with new value)
  useEffect(() => {
    setSelectedDate(initialDate);
    setValidationError(null); // Clear validation error when modal opens
  }, [initialDate]);

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(selectedDate);
    const [year, month, day] = e.target.value.split("-").map(Number);
    newDate.setFullYear(year);
    newDate.setMonth(month - 1); // Month is 0-indexed in JavaScript
    newDate.setDate(day);
    setSelectedDate(newDate);
  };

  // Handle time change with validation
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(selectedDate);
    const [hours, minutes] = e.target.value.split(":").map(Number);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedDate(newDate);

    // Validate time constraints using utility function
    const validationError = validateTimeConstraints(
      newDate,
      minTime,
      maxTime,
      {
        endBeforeStart: i18n.t("EndTimeMustBeAfterStartTime") || "End time must be after start time",
        startAfterEnd: i18n.t("StartTimeMustBeBeforeEndTime") || "Start time must be before end time",
      }
    );

    setValidationError(validationError);
  };
  
  // Format date for input value
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  // Format time for input value
  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  
  // Handle confirm button click
  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  // Handle cancel/close - reset to initial value
  const handleClose = () => {
    setSelectedDate(initialDate);
    setValidationError(null);
    onClose();
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={handleClose}
      contentStyle={{
        width: "90%",
        maxWidth: "400px",
        borderRadius: "18px",
        padding: "16px",
      }}
    >
      <div style={{ width: "100%" }}>
        <CustomText
          style={{
            fontSize: Typography.FONT_SIZE_20,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            textAlign: "center",
            marginBottom: "15px",
          }}
        >
          {title}
        </CustomText>
        
        <HorizontalLine color={Colors.LIGHT_GREY} />
        
        <div style={{ padding: "15px 0" }}>
          {(mode === "date" || mode === "datetime") && (
            <div style={{ marginBottom: "15px" }}>
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  color: Colors.GREY_COLOR,
                  marginBottom: "5px",
                }}
              >
                {i18n.t("SelectDate")}
              </CustomText>
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                min={minDate ? formatDateForInput(minDate) : undefined}
                max={maxDate ? formatDateForInput(maxDate) : undefined}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${Colors.LIGHT_GREY}`,
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                }}
              />
            </div>
          )}
          
          {(mode === "time" || mode === "datetime") && (
            <div>
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                  color: Colors.GREY_COLOR,
                  marginBottom: "5px",
                }}
              >
                {i18n.t("SelectTime")}
              </CustomText>
              <input
                type="time"
                value={formatTimeForInput(selectedDate)}
                onChange={handleTimeChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: `1px solid ${Colors.LIGHT_GREY}`,
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                }}
              />
            </div>
          )}
        </div>

        {(validationError || errorMessage) && (
          <div style={{ marginTop: "10px" }}>
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_14,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.RACING_RED,
                textAlign: "center",
              }}
            >
              {validationError || errorMessage}
            </CustomText>
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: "15px",
          }}
        >
          <Button
            width="48%"
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: i18n.t("Cancel"),
              color: Colors.RACING_RED,
            }}
            onButtonClick={handleClose}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.RACING_RED,
            }}
          />
          <Button
            width="48%"
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: i18n.t("Confirm"),
              color: Colors.WHITE,
            }}
            onButtonClick={handleConfirm}
            backgroundColor={(disableConfirm || validationError) ? Colors.LIGHT_GREY : Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
              color: (disableConfirm || validationError) ? Colors.LIGHT_GREY : Colors.BLUE,
            }}
            disabled={disableConfirm || !!validationError}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DateTimePickerModal;
