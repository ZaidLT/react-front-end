import React from 'react';
import Modal from './Modal';
import CustomText from './CustomText';
import { Colors, Typography } from '../styles';

export interface OptionItem {
  label: string;
  iconSrc: string; // use image source to comply with no-inline-SVG rule
  onClick: () => void;
  danger?: boolean;
}

interface OptionsListModalProps {
  isVisible: boolean;
  onClose: () => void;
  items: OptionItem[];
}

const OptionsListModal: React.FC<OptionsListModalProps> = ({
  isVisible,
  onClose,
  items,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      showCloseButton={true}
      headerStyle={{ borderBottom: '0', padding: '16px 16px 8px 16px' }}
      contentStyle={{ padding: 10 }}
      closeIconSize={22}
      closeButtonStyle={{ top: 8 }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {items.map((item) => (
          <button
            key={item.label}
            type='button'
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '15px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              gap: '12px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                Colors.WHITE_LILAC;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                'transparent';
            }}
          >
            <img src={item.iconSrc} alt={item.label} width={20} height={20} />
            <CustomText
              style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                color: item.danger ? '#FF6B6B' : Colors.BLACK,
                textAlign: 'left',
              }}
            >
              {item.label}
            </CustomText>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default OptionsListModal;
