import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // load translation using http -> see /public/locales
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languagedetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true, // Enable debug for troubleshooting
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'he'],
    
    // Core logic for RTL. We can also handle this in a useEffect but setting it here helps.
    // However, react-i18next usually handles text, not direction directly.
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Detection options
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;
