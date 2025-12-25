import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
    .use(HttpApi) // Load translations from the backend
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass the i18n instance to react-i18next
    .init({
        supportedLngs: ['en', 'hi'], // Supported languages
        fallbackLng: 'en', // Fallback language
        debug: true,
        backend: {
            loadPath: '/locales/{{lng}}/translation.json', // Translation files path
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            caches: ['cookie'],
        },
        react: { useSuspense: false },
    });

export default i18n;
