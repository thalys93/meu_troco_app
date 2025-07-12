import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locale/en.json';
import es from './locale/es.json';
import br from './locale/br.json';

i18n.use(initReactI18next).init({
    fallbackLng: 'pt-BR',
    debug: false,
    interpolation: {
        escapeValue: false,
    },
    resources: {
        'pt-BR': {
            translation: br,
        },
        en: {
            translation: en,
        },
        es: {
            translation: es,
        },
    },
    lng: localStorage.getItem('language') || 'en',
});

export default i18n;
