import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ruTranslations from './locales/ru.json';
import kzTranslations from './locales/kz.json';
import enTranslations from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ru: {
        translation: ruTranslations,
      },
      kz: {
        translation: kzTranslations,
      },
      en: {
        translation: enTranslations,
      },
    },
    lng: localStorage.getItem('language') || 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

