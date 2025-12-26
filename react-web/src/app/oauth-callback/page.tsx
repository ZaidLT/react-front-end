'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Colors, Typography } from '../../styles';
import dynamic from 'next/dynamic';
import authService from '../../services/authService';
import { useLanguageContext } from '../../context/LanguageContext';

// Use dynamic import with SSR disabled for components that use router
const CustomText = dynamic(() => import('../../components/CustomText'), { ssr: false });
const Button = dynamic(() => import('../../components/Button'), { ssr: false });

const OAuthCallbackPage: React.FC = () => {
  const { i18n } = useLanguageContext();
  const { t } = i18n;
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...');

        // Get token from URL parameters - different providers use different parameter names
        // Using window.location.search instead of useSearchParams to avoid SSR issues
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') ||
                      urlParams.get('code') ||
                      urlParams.get('auth_token');

        if (!token) {
          console.error('No token found in URL parameters');
          setError('Authentication failed. No token received from provider.');
          setIsProcessing(false);
          return;
        }

        console.log('Using token for authentication:', token);

        // Process the OAuth callback
        const response = await authService.handleOAuthLoginCallback(token);
        console.log('OAuth callback response:', response);

        if (response.loginSuccessful && response.token && response.refreshToken) {
          console.log('Authentication successful, storing tokens');
          // Store tokens
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('refresh_token', response.refreshToken);

          // Redirect to home page
          console.log('Redirecting to home page');
          router.push('/home');
        } else {
          console.error('Authentication failed:', response.error);
          setError(response.error || 'Failed to authenticate. Please try again.');
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error('Error processing OAuth callback:', err);
        setError(err.message || 'An unexpected error occurred. Please try again.');
        setIsProcessing(false);
      }
    };

    // Only run in browser
    if (typeof window !== 'undefined') {
      processOAuthCallback();
    }
  }, [router]);

  const handleRetry = () => {
    router.push('/login');
  };

  return (
    <div style={{
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
        backgroundColor: Colors.WHITE,
        textAlign: 'center'
      }}>
        <h1 style={{
          fontFamily: Typography.FONT_FAMILY_POPPINS_SEMIBOLD,
          fontSize: Typography.FONT_SIZE_24,
          color: Colors.MIDNIGHT,
          marginBottom: '24px'
        }}>
          {isProcessing ? t('ProcessingLogin') : (error ? t('LoginFailed') : t('LoginSuccessful'))}
        </h1>

        {isProcessing ? (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${Colors.LIGHT_GREY}`,
              borderTopColor: Colors.BLUE,
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite'
            }} />
            <CustomText style={{
              fontSize: Typography.FONT_SIZE_16,
              color: Colors.DARK_GREY
            }}>
              {t('PleaseWait')}
            </CustomText>
            <style jsx global>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <>
            <div style={{
              backgroundColor: Colors.LIGHT_RED,
              color: Colors.RED,
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: Typography.FONT_SIZE_14
            }}>
              {error}
            </div>
            <Button
              textProps={{ text: t('TryAgain') }}
              backgroundColor={Colors.BLUE}
              onButtonClick={handleRetry}
              style={{ marginBottom: '16px' }}
            />
          </>
        ) : (
          <CustomText style={{
            fontSize: Typography.FONT_SIZE_16,
            color: Colors.DARK_GREY,
            marginBottom: '24px'
          }}>
            {t('RedirectingToHome')}
          </CustomText>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
