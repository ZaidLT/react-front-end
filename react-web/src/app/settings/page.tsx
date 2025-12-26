'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CustomText from '../../components/CustomText';
import NavHeader from '../../components/NavHeader';
import { Colors, Typography } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';

import './settings.css';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useLanguageContext();

  return (
    <div className="settings-container">
      {/* Page Header */}
      <NavHeader
        headerText={i18n.t('Settings')}
        left={{
          text: "Back",
          goBack: true,
          onPress: () => router.back()
        }}
      />

      {/* Main Content */}
      <div className="settings-content">
        {/* Logo and main message */}
        <div className="settings-main-section">
          <div className="settings-logo-container">
            <img
              src="/eeva-logo.svg"
              alt="eeva logo"
              className="settings-eeva-logo"
            />
          </div>

          <div className="settings-message-container">
            <CustomText style={styles.headingText}>
              {i18n.t('SettingsUnderConstruction')}
            </CustomText>

            <CustomText style={styles.subText}>
              {i18n.t('SettingsComingSoon')}
            </CustomText>

            <div className="settings-emoji-row">
              <span className="settings-emoji">🐝</span>
              <span className="settings-emoji">🍯</span>
              <span className="settings-emoji">🏠</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  headingText: {
    fontSize: Typography.FONT_SIZE_20,
    fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
    color: Colors.MIDNIGHT,
    textAlign: 'center' as const,
    marginBottom: '16px',
    lineHeight: '28px',
  },
  subText: {
    fontSize: Typography.FONT_SIZE_16,
    fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
    color: Colors.DARK_GREY,
    textAlign: 'center' as const,
    lineHeight: '24px',
    marginBottom: '24px',
    maxWidth: '300px',
  },
};

export default SettingsPage;
