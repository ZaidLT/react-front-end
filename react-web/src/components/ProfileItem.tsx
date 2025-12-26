import React from 'react';
import { Colors, Typography } from '../styles';
import { IProfileItem } from '../util/types';
import HorizontalLine from './HorizontalLine';
import CustomText from './CustomText';

const ProfileItem: React.FC<IProfileItem> = ({
  content,
  editingEnabled,
  isButton,
  onPress,
  isGooglePlaceInput,
  placeholder,
  ...inputProps
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (content.onChange) {
      content.onChange(e.target.value);
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        {content.icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '20px',
              minHeight: '20px',
            }}
          >
            <content.icon width={16} height={16} />
          </div>
        )}
        <CustomText
          style={{
            color: Colors.PRIMARY_DARK_BLUE,
            fontSize: Typography.FONT_SIZE_16,
          }}
        >
          {placeholder}
        </CustomText>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '50px',
          maxHeight: '100px',
        }}
        onClick={() => {
          // If this is a date input (not button) and editable, open the native picker on container click
          if (!isButton && editingEnabled && inputProps?.type === 'date') {
            const el = inputRef.current as HTMLInputElement | null;
            if (!el) return;
            const anyEl = el as any;
            if (typeof anyEl.showPicker === 'function') {
              anyEl.showPicker();
            } else {
              el.focus();
              el.click();
            }
          }
        }}
      >
        <div style={{ width: '100%' }}>
          {isButton ? (
            <div
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                cursor: editingEnabled ? 'pointer' : 'default',
                border: editingEnabled
                  ? `1px solid ${Colors.LIGHT_GREY}`
                  : 'none',
                borderRadius: editingEnabled ? '6px' : '0',
                padding: editingEnabled ? '8px 12px' : '0',
                background: editingEnabled ? Colors.WHITE : 'transparent',
                transition: 'border-color 0.2s ease',
              }}
              onClick={() => {
                if (editingEnabled) onPress && onPress();
              }}
            >
              <CustomText
                style={{
                  fontSize: Typography.FONT_SIZE_16,
                  fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                  color: content.value ? Colors.MIDNIGHT : Colors.GREY_COLOR,
                  opacity: content.value ? 1 : 0.5,
                }}
              >
                {content.value || placeholder}
              </CustomText>
            </div>
          ) : (
            <input
              style={{
                fontSize: Typography.FONT_SIZE_16,
                fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
                color: Colors.MIDNIGHT,
                flex: 1,
                width: '100%',
                border: editingEnabled
                  ? `1px solid ${Colors.LIGHT_GREY}`
                  : 'none',
                borderRadius: editingEnabled ? '6px' : '0',
                outline: 'none',
                padding: editingEnabled ? '8px 12px' : '0',
                background: editingEnabled ? Colors.WHITE : 'transparent',
                transition: 'border-color 0.2s ease',
              }}
              disabled={!editingEnabled}
              onChange={handleChange}
              value={content.value || ''}
              placeholder={placeholder}
              ref={inputRef}
              {...inputProps}
            />
          )}
        </div>
      </div>
      <HorizontalLine />
    </div>
  );
};

export default ProfileItem;
