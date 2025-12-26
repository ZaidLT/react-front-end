'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from '../util/i18n-config';
import { locales, LangCodeToLocaleMap, LocaleToLangCodeMap } from '../util/i18n';
import { useAuth } from './AuthContext';
import userService from '../services/userService';
import moment from 'moment';
import 'moment/locale/fr';

// Interface for the i18n functionality
interface I18n {
  t: (key: string, options?: any) => string;
  locale: locales;
  setLocale: (locale: locales) => void;
}

// Interface for the context type
interface LanguageContextType {
  i18n: I18n;
  language: locales;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Custom hook to access the context
export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to get the dynamic locale
const getDynamicLocale = (userLanguage?: number): locales => {
  if (typeof userLanguage === 'number') {
    return LangCodeToLocaleMap[userLanguage] || 'en';
  }
  return 'en';
};

// Provider component to wrap the application
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const { t, i18n: i18nextInstance } = useTranslation();

  // Get current locale from i18next
  const locale = (i18nextInstance.language || 'en') as locales;

  // When auth user changes, ensure locale reflects user.language
  useEffect(() => {
    const userLang = (user as any)?.language;
    const nextLocale = getDynamicLocale(userLang);
    if (nextLocale !== i18nextInstance.language) {
      i18nextInstance.changeLanguage(nextLocale);
    }
  }, [user, i18nextInstance]);

  // Set moment.js locale whenever the app locale changes
  useEffect(() => {
    if (locale === 'fr') {
      moment.locale('fr');
    } else {
      moment.locale('en');
    }
  }, [locale]);

  // Create the i18n object with translation function
  const i18n: I18n = {
    t,
    locale,
    setLocale: (newLocale: locales) => {
      i18nextInstance.changeLanguage(newLocale);
      try {
        const langCode = LocaleToLangCodeMap(newLocale);
        if (user && (user as any).id) {
          userService.updateUser({ id: (user as any).id, language: langCode })
            .then(() => {
              updateUser && updateUser({ language: langCode } as any);
            })
            .catch(() => {});
        }
      } catch {}
    },
  };

  return (
    <LanguageContext.Provider value={{ i18n, language: locale }}>
      {children}
    </LanguageContext.Provider>
  );
};
