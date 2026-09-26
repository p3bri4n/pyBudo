import {Outlet} from "react-router-dom";
import LanguageChoices from "../../components/locales/locales_components/language_choices.tsx";
import {useTranslation} from "react-i18next";

function Layout() {
    const {t} = useTranslation();

    return (
        <div>
            <header>
                <h1>{t("layout.pybudo")}</h1>
            </header>

            <main>
                <Outlet />
            </main>

            <footer>
                <LanguageChoices/>
                {t("layout.pybudo")}
            </footer>
        </div>
    );
}

export default Layout;
