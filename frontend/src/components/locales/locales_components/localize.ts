import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import French from "../fr-FR.json";
import English from "../en-US.json";

const Localize = i18n.use(initReactI18next).init({
    resources: {
        'fr-FR': { translation: French },
        'en-US': { translation: English },
    },
    lng: localStorage.getItem('CURRENT_LANGUAGE') || 'fr-FR',
    fallbackLng: 'fr-FR',
    interpolation: { escapeValue: false },
});

export default Localize;
