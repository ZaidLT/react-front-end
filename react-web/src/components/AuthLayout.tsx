'use client';

import React, { useState } from 'react';
import { useLanguageContext } from '../context/LanguageContext';
import { Images } from '../assets';
import { useMobileAppDetection } from '../hooks/useMobileAppDetection';
import SquigglesBasicLine from '../assets/squiggles-basic-linve.svg';
import SquigglesBasicBurst from '../assets/squiggles-basic-burst.svg';
import CircularArrow from '../assets/CircularArrow.svg';
import './AuthLayout.css';

// Reusable Auth Input Components
interface AuthInputProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  name?: string;
  maxLength?: number;
}

interface AuthPasswordInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  autoFocus,
  autoComplete,
  name,
  maxLength,
}) => {
  return (
    <div className='input-container'>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`email-input ${error ? 'error' : ''}`}
        autoComplete={autoComplete}
        name={name}
        autoFocus={autoFocus}
        maxLength={maxLength}
      />
      {error && <div className='error-message'>{error}</div>}
    </div>
  );
};

export const AuthPasswordInput: React.FC<AuthPasswordInputProps> = ({
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { i18n } = useLanguageContext();
  const { t } = i18n;


  return (
    <div className='input-container'>
      <div className='password-input-wrapper'>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`email-input ${error ? 'error' : ''}`}
          autoComplete={autoComplete}
        />
        <button
          type='button'
          className='eye-button'
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? t('HidePassword') : t('ShowPassword')}
        >
          {showPassword ? (
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
              <line x1='1' y1='1' x2='23' y2='23' />
            </svg>
          ) : (
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            >
              <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
              <circle cx='12' cy='12' r='3' />
            </svg>
          )}
        </button>
      </div>
      {error && <div className='error-message'>{error}</div>}
    </div>
  );
};

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showSuccessNotification?: boolean;
  successMessage?: string;
  onCloseSuccess?: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  showSuccessNotification = false,
  successMessage,
  onCloseSuccess,
}) => {
  const { i18n } = useLanguageContext();
  const { t } = i18n;
  const { isMobileApp } = useMobileAppDetection();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.locale === 'fr' ? 'french' : 'english');

  return (
    <div className='auth-layout-container'>
      {/* Success Notification */}
      {showSuccessNotification && (
        <div className='success-notification'>
          <div className='success-notification-content'>
            <div className='success-notification-icon'>✓</div>
            <span className='success-notification-text'>{successMessage ?? t('Success')}</span>
            {onCloseSuccess && (
              <button
                className='success-notification-close'
                onClick={onCloseSuccess}
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className='main-content'>
        {/* Background gradient */}
        <div
          className={`background-gradient ${isMobileApp ? 'mobile-app' : ''}`}
        />

        {/* Language Selector */}
        <div className='language-selector'>
          <div
            className='language-item'
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            {selectedLanguage === 'french' ? '🇫🇷' : '🇬🇧'}
            <span>
              {selectedLanguage === 'french' ? t('French') : t('English')}
            </span>
            <svg
              className={`dropdown-arrow ${showLanguageDropdown ? 'open' : ''}`}
              width='12'
              height='12'
              viewBox='0 0 12 12'
              fill='none'
            >
              <path
                d='M3 4.5L6 7.5L9 4.5'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>

          {showLanguageDropdown && (
            <div className='language-dropdown'>
              <div
                className='language-option'
                onClick={async () => {
                  try {
                    setSelectedLanguage('english');
                    i18n.setLocale('en');
                  } finally {
                    setShowLanguageDropdown(false);
                  }
                }}
              >
                <div className='language-option-content'>
                  🇬🇧
                  <span>{t('English')}</span>
                </div>
                <div
                  className={`radio-button ${
                    selectedLanguage === 'english' ? 'selected' : ''
                  }`}
                >
                  {selectedLanguage === 'english' && (
                    <div className='radio-dot' />
                  )}
                </div>
              </div>

              <div
                className='language-option'
                onClick={async () => {
                  try {
                    setSelectedLanguage('french');
                    i18n.setLocale('fr');
                  } finally {
                    setShowLanguageDropdown(false);
                  }
                }}
              >
                <div className='language-option-content'>
                  🇫🇷
                  <span>{t('French')}</span>
                </div>
                <div
                  className={`radio-button ${
                    selectedLanguage === 'french' ? 'selected' : ''
                  }`}
                >
                  {selectedLanguage === 'french' && (
                    <div className='radio-dot' />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logo and Decorative Elements */}
        <div className={`logo-section ${isMobileApp ? 'mobile-app' : ''}`}>
          {/* Left squiggle burst */}
          <div className='decorative-burst'>
            <SquigglesBasicBurst />
          </div>

          <div className='logo'>
            <Images.EevaLogoWhiteBg />
          </div>

          {/* Right circular arrow */}
          <div className='decorative-circle'>
            <CircularArrow />
          </div>
        </div>

        {/* Form Section */}
        <div className='form-section'>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h1 className='title'>{title}</h1>
            {title === t('WelcomeBack') && (
              <SquigglesBasicLine className='title-underline' />
            )}
          </div>
          <p className='subtitle'>{subtitle}</p>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
