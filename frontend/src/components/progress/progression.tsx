import {useTranslation} from "react-i18next";

export function Progression() {
    const {t} = useTranslation();

    return (
        <div className="progression">
            {t("progression.progression")}
        </div>
    )
}
