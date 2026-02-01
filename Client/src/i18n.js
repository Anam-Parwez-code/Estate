import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './components/i18n/locales/en.json';
import arTranslation from './components/i18n/locales/ar.json';
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation, // 'translation' key hona zaroori hai
      },
      ar: {
        translation: arTranslation,
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;