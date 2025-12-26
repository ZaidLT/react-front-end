/**
 * i18next Configuration
 * Initializes i18next with language detection and React bindings
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Initialize i18next with HTTP backend
i18next
  // Load translations from public folder
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },

    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}.json'
    },

    react: {
      useSuspense: false // Disable suspense to avoid SSR issues
    }
  });

export default i18next;
