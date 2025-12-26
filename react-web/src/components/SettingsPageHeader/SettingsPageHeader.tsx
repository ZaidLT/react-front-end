import React from 'react';
import CustomText from '../CustomText';
import styles from './SettingsPageHeader.module.css';

interface SettingsPageHeaderProps {
  title: string;
  onBack?: () => void;
}

/**
 * SettingsPageHeader - Reusable header component for settings pages
 *
 * Displays a centered title with a back button on the left
 * Can be reused across different settings pages
 */
const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({ title, onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className={styles.container}>
      {/* Back button */}
      <div className={styles.backButtonContainer}>
        <img
          src="/icons/icon-menu-back.svg"
          width={24}
          height={24}
          alt="Back"
          onClick={handleBack}
          className={styles.backButton}
        />
      </div>

      {/* Title */}
      <div className={styles.titleContainer}>
        <CustomText className={styles.title} style={{ fontSize: 20, fontWeight: 600 }}>
          {title}
        </CustomText>
      </div>

      {/* Right spacer */}
      <div className={styles.spacer} />
    </div>
  );
};

export default SettingsPageHeader;
