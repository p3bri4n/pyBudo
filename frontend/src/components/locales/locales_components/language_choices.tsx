import { useTranslation } from 'react-i18next';
import "./language-choices.css"
import flagFr from "../../../assets/images/flags/fr.svg";
import flagGb from "../../../assets/images/flags/gb.svg";

const LANGUAGES = [
    { code: 'en-US', label: 'english', flag: flagGb },
    { code: 'fr-FR', label: 'french', flag: flagFr },
];

const LanguageChoices = () => {
    const { i18n, t } = useTranslation()

    const setLanguage = (lang: string) => {
        localStorage.setItem('CURRENT_LANGUAGE', lang);
        i18n.changeLanguage(lang);
    };

    return (
        <div className="switch_languages">
            {LANGUAGES.map(({ code, label, flag }) => (
                <span
                    key={code}
                    className={`language ${i18n.language === code ? 'active' : ''}`}
                    onClick={() => setLanguage(code)}
                >
                    <img className="language__flag" src={flag} alt="" width={24} height={18} />
                    {t(`languages.${label}`)}
                </span>
            ))}
        </div>
    );
};

export default LanguageChoices;
