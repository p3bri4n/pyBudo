import { useTranslation } from 'react-i18next';
import "./language-choices.css"
import {LANGUAGES} from "../../../constants/constants.ts";

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
