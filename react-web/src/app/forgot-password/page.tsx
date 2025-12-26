'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import AuthLayout from '../../components/AuthLayout';
import GradientButton from '../../components/GradientButton';
import './forgot-password.css';
import ThreeArrowsBended from '../../components/squiggles/ThreeArrowsBended';

const ForgotPasswordPage: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { t } = i18n;
  const router = useRouter();
  const { forgotPassword, resetPassword, isLoading, error, clearError } =
    useAuth();

  // If we land here from an email link that still points to /forgot-password,
  // auto-redirect to the dedicated reset-password screen with the same params
  const searchParams = useSearchParams();
  useEffect(() => {
    const code = searchParams.get('code');
    const email = searchParams.get('email') || searchParams.get('emailAddress');
    if (code && email) {
      router.push(
        `/validate-code?email=${encodeURIComponent(
          email
        )}&code=${encodeURIComponent(code)}`
      );
    }
  }, [searchParams, router]);

  // Step 1: Email submission
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Step 2: Code verification
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showCode, setShowCode] = useState(false);

  // Step 3: Password reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow control
  const [currentStep, setCurrentStep] = useState<'email' | 'code' | 'password'>(
    'email'
  );
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Refs for code inputs
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus next input when typing code
  useEffect(() => {
    codeInputRefs.current = codeInputRefs.current.slice(0, 6);
  }, []);

  const validateEmailForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    clearError();

    if (!email.trim()) {
      setEmailError(t('EmailRequired'));
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('PleaseEnterValidEmailAddress'));
      isValid = false;
    }

    return isValid;
  };

  const validatePasswordForm = (): boolean => {
    let isValid = true;
    setPasswordError('');
    setConfirmPasswordError('');
    clearError();

    if (!newPassword) {
      setPasswordError(t('PasswordRequired'));
      isValid = false;
    } else if (newPassword.length < 8) {
      setPasswordError(t('PasswordTooShort'));
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('ConfirmPasswordRequired'));
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('PasswordsDoNotMatch'));
      isValid = false;
    }

    return isValid;
  };

  const handleEmailSubmit = async () => {
    if (!validateEmailForm()) return;
    const success = await forgotPassword(email);
    if (success) {
      setShowSuccessNotification(true);
      setTimeout(() => {
        setShowSuccessNotification(false);
        // Redirect user to the dedicated validate-code route to enter the code
        router.push(`/validate-code?email=${encodeURIComponent(email)}`);
      }, 1500);
    }
  };

  const handlePasswordReset = async () => {
    if (!validatePasswordForm()) return;
    const success = await resetPassword(email, code, newPassword);
    if (success) {
      // Redirect to login page with success indication
      router.push('/login?passwordReset=success');
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    // Clear error when user starts typing
    if (codeError) {
      setCodeError('');
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'email':
        return t('ResetYourPassword');
      case 'code':
        return t('ResetYourPassword');
      case 'password':
        return t('ResetYourPassword');
      default:
        return t('ResetYourPassword');
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'email':
        return t('EnterYourEmailToResetPassword');
      case 'code':
        return t('EnterTheCodeSentToYourEmail');
      case 'password':
        return t('CreateNewPassword');
      default:
        return t('EnterYourEmailToResetPassword');
    }
  };

  const renderEmailStep = () => (
    <div className='form-container'>
      <div className='input-container'>
        <input
          type='email'
          placeholder={t('Email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`email-input ${emailError ? 'error' : ''}`}
          autoComplete='username'
          name='email'
          autoFocus
        />
      </div>

      {emailError && <div className='error-message'>{emailError}</div>}
      {error && <div className='error-message'>{error}</div>}

      <GradientButton
        text={isLoading ? t('SendingEmail') : t('SendEmail')}
        onClick={handleEmailSubmit}
        disabled={isLoading}
        loading={isLoading}
      />

      <button className='cancel-button' onClick={() => router.push('/login')}>
        {t('Cancel')}
      </button>
    </div>
  );

  const renderCodeStep = () => (
    <div className='form-container'>
      <div className='input-container'>
        <input
          type='text'
          placeholder={t('Code')}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className={`email-input ${codeError ? 'error' : ''}`}
          autoFocus
          maxLength={20}
        />
      </div>

      {codeError && <div className='error-message'>{codeError}</div>}
      {error && <div className='error-message'>{error}</div>}

      <GradientButton
        text={t('ValidateCode')}
        onClick={() => {
          if (code.trim().length >= 4) {
            setCurrentStep('password');
          } else {
            setCodeError(t('EnterResetCode'));
          }
        }}
        disabled={code.trim().length < 4}
      />

      <button className='cancel-button' onClick={() => router.push('/login')}>
        {t('Cancel')}
      </button>
    </div>
  );

  const renderPasswordStep = () => (
    <div className='form-container'>
      <div className='password-inputs'>
        <div className='input-container'>
          <div className='password-input-wrapper'>
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder={t('NewPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`email-input ${passwordError ? 'error' : ''}`}
              autoComplete='new-password'
              autoFocus
            />
            <button
              type='button'
              className='eye-button'
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label={
                showNewPassword ? t('HidePassword') : t('ShowPassword')
              }
            >
              {showNewPassword ? (
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
        </div>
        {passwordError && <div className='error-message'>{passwordError}</div>}

        <div className='input-container'>
          <div className='password-input-wrapper'>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('ConfirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`email-input ${confirmPasswordError ? 'error' : ''}`}
              autoComplete='new-password'
            />
            <button
              type='button'
              className='eye-button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword ? t('HidePassword') : t('ShowPassword')
              }
            >
              {showConfirmPassword ? (
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
        </div>
        {confirmPasswordError && (
          <div className='error-message'>{confirmPasswordError}</div>
        )}
      </div>

      {error && <div className='error-message'>{error}</div>}

      <GradientButton
        text={t('ResetPassword')}
        onClick={handlePasswordReset}
        disabled={isLoading}
        loading={isLoading}
      />

      <button className='cancel-button' onClick={() => router.push('/login')}>
        {t('Cancel')}
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'email':
        return renderEmailStep();
      case 'code':
        return renderCodeStep();
      case 'password':
        return renderPasswordStep();
      default:
        return renderEmailStep();
    }
  };

  return (
    <>
      <AuthLayout
        title={getStepTitle()}
        subtitle={getStepDescription()}
        showSuccessNotification={showSuccessNotification}
        successMessage={t('EmailSent')}
        onCloseSuccess={() => setShowSuccessNotification(false)}
      >
        {renderCurrentStep()}
        <ThreeArrowsBended
          color='rgba(255, 255, 255, 0.7)'
          width={180}
          height={195}
          position='absolute'
          bottom='10px'
          left='30%'
          style={{ transform: 'translateX(-50%) scaleX(-1) rotate(-15deg)' }}
        />
      </AuthLayout>
    </>
  );
};

export default ForgotPasswordPage;
