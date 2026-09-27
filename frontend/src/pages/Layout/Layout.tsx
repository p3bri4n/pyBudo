import {Outlet} from "react-router-dom";
import LanguageChoices from "../../components/locales/locales_components/language_choices.tsx";
import {useTranslation} from "react-i18next";

function Layout() {
    const {t} = useTranslation();

    return (
        <div className={"Layout"}>
            <header>
                <h1>{t("layout.pybudo")}</h1>
            </header>

            <main className={"Layout__main"}>
                <Outlet />
            </main>

            <footer>
                <LanguageChoices/>
                © PyBudo — Le dōjō du code
            </footer>
        </div>
    );
}

export default Layout;
