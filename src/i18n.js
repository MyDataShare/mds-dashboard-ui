import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from 'locales';
import { LANGUAGES, store } from 'mydatashare-core';
import { initReactI18next } from 'react-i18next';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator'],
    },
  });

if (!(i18n.language in resources)) {
  i18n.changeLanguage('en');
}

document.documentElement.setAttribute('lang', i18n.language);
i18n.on('languageChanged', (lng) => {
  if (!(lng in resources)) {
    i18n.changeLanguage('en');
    return;
  }
  document.documentElement.setAttribute('lang', lng);
  store.setLanguage(LANGUAGES[lng]);
});

export default i18n;
