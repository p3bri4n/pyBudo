import "./layout.css";
import "./layout-header.css";
import {Outlet, useNavigate} from "react-router-dom";
import LanguageChoices from "../../components/locales/locales_components/language_choices.tsx";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../contexts/useAuth.ts";
import logoPybudo from "../../assets/images/logo/logo_pybudo_256.png";

function Layout() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {user, signOut} = useAuth();

    const handleLogout = () => {
        signOut()
        navigate('/');
    };

    return (
        <div className={"Layout"}>
            <header className={"Layout__header"}>
                {/* En-tête réservé aux pages connectées : les pages visiteurs ont déjà le logo */}
                {user && (
                    <>
                        <img className={"Layout__logo"} src={logoPybudo} alt="PyBudo" width={256} height={279} />
                        <div className={"Layout__title"}>
                            <h1>Dojo</h1>
                            <p>{t("dojo.welcome")}, {user.username}san.</p>
                        </div>
                        <div className={"Layout__actions"}>
                            <LanguageChoices/>
                            <button className={"btn-dojo"} onClick={handleLogout}>
                                {t('dojo.logout')}
                            </button>
                        </div>
                    </>
                )}
            </header>

            <main className={"Layout__main"}>
                <Outlet />
            </main>

            <footer>
                {/* Connecté : le choix de langue est dans l'en-tête */}
                {!user && <LanguageChoices/>}
                {t("layout.pybudo-tm")} - {t("layout.dojo-code")}
            </footer>
        </div>
    );
}

export default Layout;