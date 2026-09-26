import { useTranslation } from 'react-i18next';
import "./language-choices.css"

const LanguageChoices = () => {
    const { i18n, t } = useTranslation()

    const setLanguage = (lang: string) => {
        localStorage.setItem('CURRENT_LANGUAGE', lang);
        i18n.changeLanguage(lang);
    };

    return (
        <div className="switch_languages">
            {['en-US', 'fr-FR'].map(lang => (
                <span
                    key={lang}
                    className={`language ${i18n.language === lang ? 'active' : ''}`}
                    onClick={() => setLanguage(lang)}
                >
                    {t(`languages.${lang === 'en-US' ? 'english' :'french'}`)}
                </span>
            ))}
        </div>
    );
};

export default LanguageChoices;
