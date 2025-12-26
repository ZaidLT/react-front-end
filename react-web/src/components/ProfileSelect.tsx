import React from 'react';
import CustomText from './CustomText';
import HorizontalLine from './HorizontalLine';
import Icon from './Icon';
import { Colors, Typography } from '../styles';
import './ProfileSelect.css';

interface Option {
  value: string;
  label: string;
}

interface ProfileSelectProps {
  icon?: () => React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  editingEnabled: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const ProfileSelect: React.FC<ProfileSelectProps> = ({
  icon,
  label,
  value,
  onChange,
  options,
  editingEnabled,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className="profile-select-container">
      <div className="profile-select-header">
        <div className="profile-select-icon-container">
          {icon && icon()}
        </div>
        <CustomText
          style={{
            color: Colors.PRIMARY_DARK_BLUE,
            fontSize: Typography.FONT_SIZE_16,
          }}
        >
          {label}
        </CustomText>
      </div>
      <div className="profile-select-input-container">
        <div className="profile-select-input-wrapper">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={!editingEnabled || disabled}
            className="profile-select-input"
            style={{
              fontSize: Typography.FONT_SIZE_16,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              color: Colors.MIDNIGHT,
              border: `1px solid ${Colors.LIGHT_GREY}`,
              background: editingEnabled && !disabled ? Colors.WHITE : Colors.LIGHT_GREY,
            }}
            aria-label={label}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <HorizontalLine />
    </div>
  );
};

export default ProfileSelect;
