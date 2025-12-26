'use client';

import React, { useEffect } from 'react';
import { useLanguageContext } from '../../context/LanguageContext';

const PrivacyPolicyPage: React.FC = () => {
  const { i18n } = useLanguageContext();

  useEffect(() => {
    // Redirect to the external privacy policy URL
    window.location.href = 'https://eeva.ai/privacy-policy';
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1>{i18n.t('RedirectingToPrivacyPolicy')}</h1>
        <p>{i18n.t('RedirectingMessage')}</p>
        <p>{i18n.t('ManualRedirectMessage')} <a href="https://eeva.ai/privacy-policy">{i18n.t('ClickHere')}</a>.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
