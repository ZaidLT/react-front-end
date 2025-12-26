import React, { useState, useEffect } from 'react';
import { Colors, Typography } from '../styles';
import Modal from './Modal';
import CustomText from './CustomText';
import Input from './Input';
import Button from './Button';
import { IEEvent } from '../services/types';
import moment from 'moment';
import { useLanguageContext } from '../context/LanguageContext';
import { emitSnackbar } from '../util/helpers';

interface EventCreationModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onSave: (eventData: Partial<IEEvent>) => void;
  editingEvent?: IEEvent | null;
  selectedDate?: string;
  selectedTime?: string;
}

/**
 * EventCreationModal - A modal for creating and editing events
 * 
 * This component provides a simple form for creating or editing events
 * with basic fields like title, description, date, and time.
 * 
 * @param isVisible - Whether the modal is visible
 * @param onRequestClose - Callback to close the modal
 * @param onSave - Callback to save the event
 * @param editingEvent - Event being edited (null for new event)
 * @param selectedDate - Pre-selected date
 * @param selectedTime - Pre-selected time
 */
const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isVisible,
  onRequestClose,
  onSave,
  editingEvent,
  selectedDate,
  selectedTime,
}) => {
  const { i18n } = useLanguageContext();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form when modal opens or editing event changes
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.Title || '');
      setDescription(editingEvent.Text || '');
      setDate(moment(editingEvent.Deadline_DateTime).format('YYYY-MM-DD'));
      setStartTime(editingEvent.Scheduled_Time || '');
      setEndTime(editingEvent.Scheduled_Time_End || '');
      setIsAllDay(
        editingEvent.Scheduled_Time === '00:00' && 
        editingEvent.Scheduled_Time_End === '23:59'
      );
    } else {
      // New event
      setTitle('');
      setDescription('');
      setDate(selectedDate || moment().format('YYYY-MM-DD'));
      setStartTime(selectedTime || moment().format('HH:mm'));
      setEndTime(selectedTime ? moment(selectedTime, 'HH:mm').add(1, 'hour').format('HH:mm') : moment().add(1, 'hour').format('HH:mm'));
      setIsAllDay(false);
    }
  }, [editingEvent, selectedDate, selectedTime, isVisible]);

  // Handle save
  const handleSave = async () => {
    if (!title.trim()) {
      emitSnackbar({
        message: 'Please enter a title for the event',
        type: 'error',
        duration: 3000
      });
      return;
    }

    setLoading(true);

    try {
      // Build event data mapping to legacy field names used by this modal
      // Include isAllDay flag and only include scheduled times when not all-day
      const eventData: Partial<IEEvent> = {
        Title: title.trim(),
        Text: description.trim(),
        Deadline_DateTime: `${date}T${startTime}:00`,
        Priority: 0, // Default to No Priority
        Active: true,
        Deleted: false,
        isAllDay
      };

      if (!isAllDay) {
        (eventData as any).Scheduled_Time = startTime;
        (eventData as any).Scheduled_Time_End = endTime;
      }

      if (editingEvent) {
        eventData.UniqueId = editingEvent.UniqueId;
      }

      await onSave(eventData);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle all-day toggle
  const handleAllDayToggle = () => {
    setIsAllDay(!isAllDay);
    if (!isAllDay) {
      setStartTime('00:00');
      setEndTime('23:59');
    } else {
      setStartTime(moment().format('HH:mm'));
      setEndTime(moment().add(1, 'hour').format('HH:mm'));
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      title={editingEvent ? 'Edit Event' : 'Create Event'}
    >
      <div style={styles.container}>
        {/* Title */}
        <div style={styles.fieldContainer}>
          <CustomText style={styles.label}>
            Title *
          </CustomText>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder={i18n.t("EventTitle")}
            style={styles.input}
          />
        </div>

        {/* Description */}
        <div style={styles.fieldContainer}>
          <CustomText style={styles.label}>
            {i18n.t('Description')}
          </CustomText>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={i18n.t("EventDescription")}
            style={styles.textarea}
            rows={3}
          />
        </div>

        {/* Date */}
        <div style={styles.fieldContainer}>
          <CustomText style={styles.label}>
            Date *
          </CustomText>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>

        {/* All Day Toggle */}
        <div style={styles.fieldContainer}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={handleAllDayToggle}
              style={styles.checkbox}
            />
            <CustomText style={styles.checkboxText}>
              {i18n.t('AllDay')}
            </CustomText>
          </label>
        </div>

        {/* Time fields (hidden if all day) */}
        {!isAllDay && (
          <div style={styles.timeContainer}>
            <div style={styles.timeField}>
              <CustomText style={styles.label}>
                Start Time *
              </CustomText>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={styles.timeInput}
              />
            </div>
            <div style={styles.timeField}>
              <CustomText style={styles.label}>
                End Time *
              </CustomText>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={styles.timeInput}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={styles.buttonContainer}>
          <Button
            textProps={{ text: "Cancel" }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.WHITE}
            borderProps={{ color: Colors.BLUE, width: 1, radius: 8 }}
          />
          <Button
            textProps={{ text: loading ? 'Saving...' : 'Save' }}
            onButtonClick={handleSave}
            disabled={loading || !title.trim()}
            backgroundColor={Colors.BLUE}
          />
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '500px',
    width: '100%',
  } as React.CSSProperties,

  fieldContainer: {
    marginBottom: '20px',
  } as React.CSSProperties,

  label: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
    color: Colors.MIDNIGHT,
    marginBottom: '8px',
    display: 'block',
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${Colors.LIGHT_GREY}`,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${Colors.LIGHT_GREY}`,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    resize: 'vertical',
    minHeight: '80px',
  } as React.CSSProperties,

  dateInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${Colors.LIGHT_GREY}`,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  } as React.CSSProperties,

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  } as React.CSSProperties,

  checkbox: {
    marginRight: '8px',
    width: '16px',
    height: '16px',
  } as React.CSSProperties,

  checkboxText: {
    fontSize: Typography.FONT_SIZE_14,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.MIDNIGHT,
  } as React.CSSProperties,

  timeContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  } as React.CSSProperties,

  timeField: {
    flex: 1,
  } as React.CSSProperties,

  timeInput: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${Colors.LIGHT_GREY}`,
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
  } as React.CSSProperties,

  buttonContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    marginTop: '30px',
  } as React.CSSProperties,

  cancelButton: {
    backgroundColor: Colors.WHITE,
    borderColor: Colors.LIGHT_GREY,
    borderWidth: '1px',
    borderStyle: 'solid',
  } as React.CSSProperties,

  cancelButtonText: {
    color: Colors.GREY_COLOR,
  } as React.CSSProperties,

  saveButton: {
    backgroundColor: Colors.PRIMARY_ELECTRIC_BLUE,
  } as React.CSSProperties,

  saveButtonText: {
    color: Colors.WHITE,
  } as React.CSSProperties,
};

export default EventCreationModal;
