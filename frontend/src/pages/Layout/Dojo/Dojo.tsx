import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {PythonRunner} from "../../../components/PythonEditor.tsx";

function Dojo() {
    const navigate = useNavigate();
    const {t} = useTranslation();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate('/');
    };

    return (
        <div>
            <button onClick={handleLogout}>
                {t('dojo.logout')}
            </button>
            <h1>Dojo</h1>

            <p>Bienvenue sur le tatami.</p>

            <section>
                <h2>Ma progression</h2>
                {/* progression de l'utilisateur */}
            </section>

            <section>
                <h2>Mes katas</h2>
                <PythonRunner/>
                {/* liste des katas */}
            </section>
        </div>
    );
}

export default Dojo;
