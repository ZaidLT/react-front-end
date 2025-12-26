import React from 'react';
import { Colors, Typography } from '../styles';
import Button from './Button';
import HorizontalLine from './HorizontalLine';
import CustomText from './CustomText';
import Modal from './Modal';
import { useLanguageContext } from '../context/LanguageContext';

interface IDeleteModalProps {
  isVisible: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
  category: string;
  customMessage?: string; // Optional custom message
  customTitle?: string; // Optional custom title
}

/**
 * DeleteModal - A confirmation modal for delete actions
 *
 * This component displays a modal asking the user to confirm deletion of an item.
 * It shows the category of the item being deleted and warns about the irreversible nature of deletion.
 */
const DeleteModal: React.FC<IDeleteModalProps> = ({
  isVisible,
  onRequestClose,
  category,
  onDelete,
  customMessage,
  customTitle,
}) => {
  const { i18n } = useLanguageContext();

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRequestClose}
      showCloseButton={false}
      contentStyle={{
        width: '100%',
        maxWidth: '500px',
        borderRadius: '18px',
        padding: '25px',
      }}
    >
      <div style={{ width: '100%' }}>
        <CustomText
          style={{
            marginBottom: '15px',
            fontSize: Typography.FONT_SIZE_20,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            color: Colors.MIDNIGHT,
            textAlign: 'center',
            display: 'block',
          }}
        >
          {customTitle || i18n.t('AreYouSureYouWantToDeleteThisContact')}
        </CustomText>

        <div style={{ gap: '15px', marginTop: '15px', marginBottom: '15px' }}>
          <div style={{ width: '100%', opacity: 0.1, marginBottom: '10px' }}>
            <HorizontalLine color={Colors.TROUT} />
          </div>

          <CustomText
            style={{
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.GREY_COLOR,
              textAlign: 'left',
              lineHeight: '20px',
            }}
          >
            {customMessage || i18n.t('DeletingThisContactWouldBeIrreversibleYouWouldLoseAllData') }
          </CustomText>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            marginTop: '10px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            width='40%'
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: i18n.t('No'),
              color: Colors.RACING_RED,
            }}
            onButtonClick={onRequestClose}
            backgroundColor={Colors.WHITE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.RACING_RED,
            }}
          />
          <Button
            width='40%'
            height={50}
            textProps={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              text: i18n.t('Yes'),
              color: Colors.WHITE,
            }}
            onButtonClick={onDelete}
            backgroundColor={Colors.BLUE}
            borderProps={{
              width: 1,
              radius: 10,
              color: Colors.BLUE,
            }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
