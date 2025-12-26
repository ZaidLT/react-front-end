'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '../../hooks/useRouterWithPersistentParams';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import AuthLayout from '../../components/AuthLayout';
import GradientButton from '../../components/GradientButton';
import '../forgot-password/forgot-password.css';

const ValidateCodePage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useLanguageContext();
  const { t } = i18n;
  const searchParams = useSearchParams();

  const { validateResetCode, isLoading, error, clearError } = useAuth();

  // Read email and code from URL
  const emailFromUrl = useMemo(() => searchParams.get('email') || searchParams.get('emailAddress') || '', [searchParams]);
  const codeFromUrl = useMemo(() => searchParams.get('code') || '', [searchParams]);

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');

  // Initialize local state from URL
  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
    if (codeFromUrl) setCode(codeFromUrl);
  }, [emailFromUrl, codeFromUrl]);

  // Parse hash fragment for access_token/refresh_token (e.g., #access_token=...&refresh_token=...)
  // Store tokens for authentication, or clear invalid tokens if none provided
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    
    if (hash && hash.length > 2) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        try {
          // Store tokens for later use
          localStorage.setItem('auth_token', accessToken);
          document.cookie = `auth_token=${accessToken}; path=/; max-age=604800; SameSite=Strict; secure`;
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
            document.cookie = `refresh_token=${refreshToken}; path=/; max-age=2592000; SameSite=Strict; secure`;
          }
        } catch {}

        // Clean the hash from the URL
        const newUrl = window.location.origin + window.location.pathname + window.location.search;
        window.history.replaceState({}, '', newUrl);
      }
    } else {
      // No hash tokens provided, clear any existing invalid tokens to prevent refresh errors
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch {}
    }
  }, []);

  // If a code is present in URL, we can try enabling the continue button immediately
  const isCodeValid = useMemo(() => (code?.trim().length || 0) >= 4, [code]);

  const handleValidateCode = async () => {
    setCodeError('');

    // Require email from URL for this flow
    if (!email) {
      setCodeError(t('PleaseEnterValidEmailAddress'));
      return;
    }

    if (!isCodeValid) {
      setCodeError(t('EnterResetCode'));
      return;
    }

    // Don't validate with backend here to avoid consuming the code
    // Just check format and proceed to password reset page
    // The actual validation will happen when the password is reset
    router.push(`/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code.trim())}&validated=true`);
  };

  return (
    <AuthLayout
      title={t('ResetYourPassword')}
      subtitle={t('EnterTheCodeSentToYourEmail')}
    >
      <div className="form-container">
        <div className="input-container">
          <input
            type="text"
            placeholder={t('Code')}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (codeError) setCodeError('');
            }}
            className={`email-input ${codeError ? 'error' : ''}`}
            autoFocus
            maxLength={20}
          />
        </div>

        {codeError && <div className="error-message">{codeError}</div>}
        {error && <div className="error-message">{error}</div>}

        <GradientButton
          text={t('ValidateCode')}
          onClick={handleValidateCode}
          disabled={!isCodeValid || !email || isLoading}
          loading={isLoading}
        />

        <button className="cancel-button" onClick={() => router.push('/login')}>
          {t('Cancel')}
        </button>
      </div>
    </AuthLayout>
  );
};

export default ValidateCodePage;
