'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import Button from '../../components/Button';
import CustomText from '../../components/CustomText';
import Input from '../../components/Input';
import OAuthLoginButton from '../../components/OAuthLoginButton';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';

const RegisterPage: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { t } = i18n;
  const router = useRouter();
  const { register, initiateOAuthLogin, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Separate loading states for each button
  const [isEmailRegisterLoading, setIsEmailRegisterLoading] = useState(false);
  const [isGoogleRegisterLoading, setIsGoogleRegisterLoading] = useState(false);
  const [isAppleRegisterLoading, setIsAppleRegisterLoading] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    clearError();

    // Validate email
    if (!email.trim()) {
      setEmailError(t('EmailRequired'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('PleaseEnterValidEmailAddress'));
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError(t('PasswordRequired'));
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(t('PasswordTooShort'));
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError(t('ConfirmPasswordRequired'));
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(t('PasswordsDoNotMatch'));
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsEmailRegisterLoading(true);
    // Use default values for firstName and lastName since we don't have those fields
    const success = await register(email, password, 'New', 'User');
    setIsEmailRegisterLoading(false);

    if (success) {
      router.push('/home');
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleRegisterLoading(true);
    const oauthUrl = await initiateOAuthLogin('google');
    setIsGoogleRegisterLoading(false);

    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };

  const handleAppleRegister = async () => {
    setIsAppleRegisterLoading(true);
    const oauthUrl = await initiateOAuthLogin('apple');
    setIsAppleRegisterLoading(false);

    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };

  // Google logo component
  const GoogleLogo = ({ height = 24, width = 24 }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
      <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
      <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
      <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
    </svg>
  );

  // Apple logo component
  const AppleLogo = ({ height = 24, width = 24 }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 20.28C16.07 21.23 15 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.28 21.25 8.52 21.07 7.67 20.28C2.79 15.25 3.51 7.59 9.05 7.31C10.57 7.38 11.63 8.05 12.53 8.11C13.9 7.89 15.21 7.2 16.61 7.3C18.43 7.42 19.78 8.14 20.66 9.43C16.94 11.35 17.85 16.08 21.22 17.13C20.54 18.29 19.7 19.43 17.05 20.28ZM12.38 7.26C12.2 5.21 13.88 3.54 15.8 3.35C16.1 5.7 13.87 7.5 12.38 7.26Z" fill="black"/>
    </svg>
  );

  return (
    <div className="register-page" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: Colors.WHITE
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: Colors.WHITE
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
            fontSize: Typography.FONT_SIZE_24,
            color: Colors.MIDNIGHT,
            marginBottom: '12px',
            fontWeight: 600
          }}>
            {t('CreateAnAccount')}
          </h1>
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_16,
            color: Colors.DARK_GREY,
            lineHeight: '24px'
          }}>
            {t('JoinEevaToday')}
          </CustomText>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Input
            label={t('Email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('Email')}
            error={emailError}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Input
            label={t('Password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('Password')}
            secureTextEntry
            error={passwordError}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Input
            label={t('ConfirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('ConfirmPassword')}
            secureTextEntry
            error={confirmPasswordError}
          />
        </div>

        <Button
          textProps={{
            text: t('CreateAnAccount'),
            fontSize: Typography.FONT_SIZE_16,
            fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD
          }}
          backgroundColor={Colors.BLUE}
          onButtonClick={handleRegister}
          disabled={isEmailRegisterLoading || isGoogleRegisterLoading || isAppleRegisterLoading}
          loading={isEmailRegisterLoading}
          style={{ marginBottom: error ? '16px' : '24px', height: '48px' }}
        />

        {error && (
          <div style={{
            backgroundColor: Colors.LIGHT_RED,
            color: Colors.RED,
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '24px',
            fontSize: Typography.FONT_SIZE_14,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            height: '1px',
            backgroundColor: Colors.LIGHT_GREY,
            flex: 1
          }} />
          <CustomText style={{
            margin: '0 12px',
            color: Colors.DARK_GREY,
            fontSize: Typography.FONT_SIZE_14
          }}>
            {t('OrSignUpWith')}
          </CustomText>
          <div style={{
            height: '1px',
            backgroundColor: Colors.LIGHT_GREY,
            flex: 1
          }} />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <OAuthLoginButton
            name="Google"
            Logo={GoogleLogo}
            onPress={handleGoogleRegister}
            loading={isGoogleRegisterLoading}
            disabled={true}
          />
          <OAuthLoginButton
            name="Apple"
            Logo={AppleLogo}
            onPress={handleAppleRegister}
            loading={isAppleRegisterLoading}
            disabled={true}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <CustomText style={{
            color: Colors.DARK_GREY,
            fontSize: Typography.FONT_SIZE_14,
            marginBottom: '20px',
            lineHeight: '20px',
            display: 'block'
          }}>
            {t('AlreadyHaveAnAccount')}?{" "}
            <Link href="/login" style={{
              textDecoration: 'none',
              color: Colors.BLUE,
              fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
              fontWeight: 500
            }}>
              {t('Login')}
            </Link>
          </CustomText>
          <a href="https://eeva.ai/privacy-policy" style={{
            textDecoration: 'none',
            color: Colors.DARK_GREY,
            fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            fontSize: Typography.FONT_SIZE_12,
            lineHeight: '18px',
            display: 'block',
            marginTop: '8px'
          }}>
            {t('ByCreatingAnAccountYouAgreeToOur')} <span style={{ textDecoration: 'underline' }}>{t('PrivacyPolicy')}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
