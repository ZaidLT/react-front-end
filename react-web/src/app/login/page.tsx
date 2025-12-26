'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '../../context/AuthContext';
import { Colors, Typography } from '../../styles';
import { useLanguageContext } from '../../context/LanguageContext';
import AuthLayout, {
  AuthInput,
  AuthPasswordInput,
} from '../../components/AuthLayout';
import GradientButton from '../../components/GradientButton';
import RoundArrow from '../../assets/RoundArrow.svg';

// Use dynamic import with SSR disabled for components that use router
const Button = dynamic(() => import('../../components/Button'), { ssr: false });
const CustomText = dynamic(() => import('../../components/CustomText'), {
  ssr: false,
});
const OAuthLoginButton = dynamic(
  () => import('../../components/OAuthLoginButton'),
  { ssr: false }
);

const LoginPage: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { t } = i18n;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, initiateOAuthLogin, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordResetSuccess, setShowPasswordResetSuccess] =
    useState(false);

  // Track initial locale to detect if user changed language
  const [initialLocale] = useState(i18n.locale);

  // Separate loading states for each button
  const [isEmailLoginLoading, setIsEmailLoginLoading] = useState(false);
  const [isGoogleLoginLoading, setIsGoogleLoginLoading] = useState(false);
  const [isAppleLoginLoading, setIsAppleLoginLoading] = useState(false);

  // Check for password reset success parameter
  useEffect(() => {
    const passwordReset = searchParams.get('passwordReset');
    if (passwordReset === 'success') {
      setShowPasswordResetSuccess(true);
      // Auto-hide after 4 seconds
      setTimeout(() => {
        setShowPasswordResetSuccess(false);
      }, 4000);
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Clear previous errors
    setEmailError('');
    setPasswordError('');
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
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsEmailLoginLoading(true);

    try {
      console.log('Logging in with email:', email);

      // Now try to login
      const success = await login(email, password);
      console.log('Login result:', success);

      if (success) {
        // Redirect to home page after successful login
        const currentLocale = i18n.locale;
        const languageChanged = currentLocale !== initialLocale;

        // Only add lang parameter if user changed the language
        let targetUrl = '/home';
        if (languageChanged) {
          const url = new URL(window.location.origin + '/home');
          url.searchParams.set('lang', currentLocale);
          targetUrl = url.pathname + url.search;
        }

        router.push(targetUrl);
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsEmailLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('handleGoogleLogin called');
    setIsGoogleLoginLoading(true);

    try {
      console.log('Calling initiateOAuthLogin with google');

      // Get the redirect URL and log it for debugging
      const redirectUrl = `${window.location.origin}/oauth-callback`;
      console.log('Redirect URL being used:', redirectUrl);

      // Use the registration endpoint directly
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: 'placeholder@example.com',
          firstName: 'Placeholder',
          lastName: 'User',
          provider: 'google',
          redirectUrl: redirectUrl,
        }),
      });

      const data = await response.json();
      console.log('OAuth response:', data);

      setIsGoogleLoginLoading(false);

      if (data.success && data.oauthUrl) {
        console.log('Redirecting to OAuth URL:', data.oauthUrl);
        window.location.href = data.oauthUrl;
      } else {
        console.error('No OAuth URL returned:', data);
      }
    } catch (error) {
      console.error('Error in handleGoogleLogin:', error);
      setIsGoogleLoginLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsAppleLoginLoading(true);
    const oauthUrl = await initiateOAuthLogin('apple');
    setIsAppleLoginLoading(false);

    if (oauthUrl) {
      window.location.href = oauthUrl;
    }
  };

  // Google logo component
  const GoogleLogo = ({ height = 24, width = 24 }) => (
    <svg
      width={width}
      height={height}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z'
        fill='#FFC107'
      />
      <path
        d='M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z'
        fill='#FF3D00'
      />
      <path
        d='M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z'
        fill='#4CAF50'
      />
      <path
        d='M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z'
        fill='#1976D2'
      />
    </svg>
  );

  // Apple logo component
  const AppleLogo = ({ height = 24, width = 24 }) => (
    <svg
      width={width}
      height={height}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M17.05 20.28C16.07 21.23 15 21.08 13.97 20.63C12.88 20.17 11.88 20.15 10.73 20.63C9.28 21.25 8.52 21.07 7.67 20.28C2.79 15.25 3.51 7.59 9.05 7.31C10.57 7.38 11.63 8.05 12.53 8.11C13.9 7.89 15.21 7.2 16.61 7.3C18.43 7.42 19.78 8.14 20.66 9.43C16.94 11.35 17.85 16.08 21.22 17.13C20.54 18.29 19.7 19.43 17.05 20.28ZM12.38 7.26C12.2 5.21 13.88 3.54 15.8 3.35C16.1 5.7 13.87 7.5 12.38 7.26Z'
        fill='black'
      />
    </svg>
  );

  return (
    <AuthLayout
      title={t('WelcomeBack')}
      subtitle={t('LetsDoThisThing')}
      showSuccessNotification={showPasswordResetSuccess}
      successMessage={t('PasswordUpdatedSuccessfully')}
      onCloseSuccess={() => setShowPasswordResetSuccess(false)}
    >
      <div className='form-container'>
        <AuthInput
          type='email'
          placeholder={t('Email')}
          value={email}
          onChange={setEmail}
          error={emailError}
          autoFocus
          autoComplete='username'
          name='email'
        />

        <AuthPasswordInput
          placeholder={t('Password')}
          value={password}
          onChange={setPassword}
          error={passwordError}
          autoComplete='current-password'
        />

        <div
          style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <Link
            href='/forgot-password'
            style={{
              textDecoration: 'none',
              color: '#2A46BE',
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontSize: Typography.FONT_SIZE_14,
              fontWeight: 600,
              display: 'block',
            }}
          >
            {t('ForgotYourPasswordQuestion')}
          </Link>
          <div
            style={{
              color: Colors.DARK_GREY,
              fontSize: Typography.FONT_SIZE_12,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              marginTop: '2px',
            }}
          >
            {t('HappensToTheBestOfUs')}
          </div>
        </div>

        <GradientButton
          text={t('Login')}
          onClick={handleLogin}
          disabled={
            isEmailLoginLoading || isGoogleLoginLoading || isAppleLoginLoading
          }
          loading={isEmailLoginLoading}
          style={{ marginBottom: error ? '16px' : '24px' }}
        />

        {error && (
          <div
            style={{
              backgroundColor: Colors.LIGHT_RED,
              color: Colors.RED,
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '24px',
              fontSize: Typography.FONT_SIZE_14,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              height: '1px',
              backgroundColor: Colors.BLUE,
              flex: 1,
            }}
          />
          <CustomText
            style={{
              margin: '0 12px',
              color: Colors.DARK_GREY,
              fontSize: Typography.FONT_SIZE_14,
            }}
          >
            {t('OrLoginWith')}
          </CustomText>
          <div
            style={{
              height: '1px',
              backgroundColor: Colors.BLUE,
              flex: 1,
            }}
          />
        </div>

        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 'calc(50% - 160px)',
              top: '30%',
              transform: 'translateY(-50%)',
            }}
          >
            <RoundArrow
              style={{
                transform: 'scaleX(-1) scale(0.4)',
                display: 'block',
                overflow: 'visible',
                filter:
                  'brightness(0) saturate(100%) invert(70%) sepia(52%) saturate(2878%) hue-rotate(130deg)',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: '24px',
            }}
          >
            <OAuthLoginButton
              name='Google'
              Logo={GoogleLogo}
              onPress={handleGoogleLogin}
              loading={isGoogleLoginLoading}
              disabled={true}
            />
            <OAuthLoginButton
              name='Apple'
              Logo={AppleLogo}
              onPress={handleAppleLogin}
              loading={isAppleLoginLoading}
              disabled={true}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <CustomText
            style={{
              color: Colors.DARK_GREY,
              fontSize: Typography.FONT_SIZE_14,
              marginBottom: '20px',
              lineHeight: '20px',
              display: 'block',
            }}
          >
            {t('NewAroundHereQuestion') + ' '}
            <Link
              href='/register'
              style={{
                textDecoration: 'none',
                color: '#2A46BE',
                fontFamily: Typography.FONT_FAMILY_POPPINS_MEDIUM,
                fontWeight: 600,
              }}
            >
              {t('CreateAnAccount')}
            </Link>
          </CustomText>
          {/* <a
            href='https://eeva.ai/privacy-policy'
            style={{
              textDecoration: 'none',
              color: Colors.DARK_GREY,
              fontFamily: Typography.FONT_FAMILY_POPPINS_REGULAR,
              fontSize: Typography.FONT_SIZE_12,
              lineHeight: '18px',
              display: 'block',
              marginTop: '8px',
            }}
          >
            {t('ReviewOurPrivacyPolicy')}
          </a> */}
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
