import React from 'react';
import OverlayModal from '../OverlayModal';
import { Colors } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';

interface RemoveCalendarModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * RemoveCalendarModal - Confirmation modal for removing calendars
 *
 * Displays a confirmation dialog when user wants to remove calendar(s)
 */
const RemoveCalendarModal: React.FC<RemoveCalendarModalProps> = ({
  isVisible,
  onConfirm,
  onCancel,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <OverlayModal
      isVisible={isVisible}
      onRequestClose={onCancel}
      headerText="Remove Calendar"
      descriptionText="Are you sure you want to remove the selected calendar(s)? You will need to add them again to undo this action."
      actionButtons={[
        {
          buttonWidth: 120,
          textProps: {
            text: i18n.t("No"),
            color: Colors.BLUE,
          },
          backgroundColor: Colors.WHITE,
          borderProps: {
            color: Colors.BLUE,
          },
          onPress: onCancel,
        },
        {
          buttonWidth: 120,
          textProps: {
            text: i18n.t("Yes"),
            color: Colors.WHITE,
          },
          backgroundColor: Colors.LIGHT_RED,
          borderProps: {
            color: Colors.LIGHT_RED,
          },
          onPress: onConfirm,
        },
      ]}
    />
  );
};

export default RemoveCalendarModal;
