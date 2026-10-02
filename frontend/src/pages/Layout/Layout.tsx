import "./layout-header.css";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import LanguageChoices from "../../components/locales/locales_components/language_choices.tsx";
import {useTranslation} from "react-i18next";
import {useAuth} from "../../contexts/useAuth.ts";
import logoPybudo from "../../assets/images/logo/logo_pybudo_256.png";

function Layout() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {pathname} = useLocation();
    const {user, signOut} = useAuth();

    const handleLogout = () => {
        signOut()
        navigate('/');
    };

    return (
        <div className={"Layout"}>
            <header className={"Layout__header"}>
                {/* En-tête réservé au Dojo : ailleurs, le nom figure déjà sur le logo de la page */}
                {user && pathname === "/dojo" && (
                    <>
                        <img className={"Layout__logo"} src={logoPybudo} alt="PyBudo" width={256} height={279} />
                        <div className={"Layout__title"}>
                            <h1>Dojo</h1>
                            <p>{t("dojo.welcome")}, {user.username}san.</p>
                        </div>
                        <button className={"btn-dojo Layout__logout"} onClick={handleLogout}>
                            {t('dojo.logout')}
                        </button>
                    </>
                )}
            </header>

            <main className={"Layout__main"}>
                <Outlet />
            </main>

            <footer>
                <LanguageChoices/>
                {t("layout.pybudo-tm")} - {t("layout.dojo-code")}
            </footer>
        </div>
    );
}

export default Layout;