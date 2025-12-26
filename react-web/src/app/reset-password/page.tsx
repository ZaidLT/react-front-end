'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import AuthLayout from '../../components/AuthLayout';
import GradientButton from '../../components/GradientButton';
import '../forgot-password/forgot-password.css';

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const { t } = i18n;
  const searchParams = useSearchParams();

  const { resetPassword, isLoading, error, clearError } = useAuth();

  // Read email and code from URL (should be pre-validated)
  const emailFromUrl = useMemo(() => searchParams.get('email') || searchParams.get('emailAddress') || '', [searchParams]);
  const codeFromUrl = useMemo(() => searchParams.get('code') || '', [searchParams]);
  const isValidated = useMemo(() => searchParams.get('validated') === 'true', [searchParams]);

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  // Initialize local state from URL
  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
    if (codeFromUrl) setCode(codeFromUrl);
    
    // If not validated, redirect to validate-code page
    if (!isValidated || !emailFromUrl || !codeFromUrl) {
      router.push(`/validate-code?email=${encodeURIComponent(emailFromUrl || '')}`);
      return;
    }
  }, [emailFromUrl, codeFromUrl, isValidated, router]);

  const validatePasswords = (): boolean => {
    let valid = true;
    setPasswordError('');
    setConfirmPasswordError('');
    clearError();

    if (!newPassword) {
      setPasswordError(t('PasswordRequired'));
      valid = false;
    } else if (newPassword.length < 8) {
      setPasswordError(t('PasswordTooShort'));
      valid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError(t('ConfirmPasswordRequired'));
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('PasswordsDoNotMatch'));
      valid = false;
    }

    return valid;
  };


  const handleResetPassword = async () => {
    if (!validatePasswords()) return;
    const ok = await resetPassword(email, code.trim(), newPassword);
    if (ok) {
      router.push('/login?passwordReset=success');
    }
  };


  return (
    <AuthLayout
      title={t('ResetYourPassword')}
      subtitle={t('TimeToSetANewOne')}
    >
      <div className="form-container">
        <div className="password-inputs">
          <div className="input-container">
            <div className="password-input-wrapper">
              <input
                type={'password'}
                placeholder={t('NewPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`email-input ${passwordError ? 'error' : ''}`}
                autoComplete="new-password"
                autoFocus
              />
            </div>
          </div>
          {passwordError && <div className="error-message">{passwordError}</div>}

          <div className="input-container">
            <div className="password-input-wrapper">
              <input
                type={'password'}
                placeholder={t('ConfirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`email-input ${confirmPasswordError ? 'error' : ''}`}
                autoComplete="new-password"
              />
            </div>
          </div>
          {confirmPasswordError && (
            <div className="error-message">{confirmPasswordError}</div>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <GradientButton
          text={t('ResetPassword')}
          onClick={handleResetPassword}
          disabled={isLoading}
          loading={isLoading}
        />

        <button className="cancel-button" onClick={() => router.push('/login')}>
          {t('Cancel')}
        </button>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
