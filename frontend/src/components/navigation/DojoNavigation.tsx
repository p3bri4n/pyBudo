import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./dojo-navigation.css";

export function DojoNavigation() {
    const { t } = useTranslation();

    return (
        <nav className="dojo-navigation" aria-label={t("navigation.main")}>
            <NavLink
                to="/dojo"
                className={({ isActive }) => `dojo-navigation__link ${isActive ? "active" : ""}`}
            >{t("navigation.dojo")}
            </NavLink>

            <NavLink
                to="/history"
                className={({ isActive }) => `dojo-navigation__link ${isActive ? "active" : ""}`}
            >{t("navigation.history")}
            </NavLink>
        </nav>
    );
}
