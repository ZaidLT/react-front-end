'use client';

import React, { Suspense, useEffect } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { NotificationProvider } from '../context/NotificationContext';
import SnackbarProvider from '../components/SnackbarProvider';
import { MobileThemeProvider } from '../components/MobileThemeProvider';
import ToastNotifications from '../components/ToastNotifications';
import { initAnalytics } from '../services/analytics';


// Initialize i18next
import '../util/i18n-config';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);
  return (
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <ToastNotifications />
          <SnackbarProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <MobileThemeProvider>
                {children}
              </MobileThemeProvider>
            </Suspense>
          </SnackbarProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
