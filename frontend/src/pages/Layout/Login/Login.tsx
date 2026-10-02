import { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import {login} from "../../../api/authApi.ts";
import type {TokenResponse} from "../../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import LandingPage from "../LandingPage/LandingPage.tsx";
import "./login.css"
import {useAuth} from "../../../contexts/useAuth.ts"

function Login() {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const navigate = useNavigate();
    const {t} = useTranslation()
    const { signIn } = useAuth();

    const handleLogin = async () => {
        try {
            const data: TokenResponse = await login({email, password});
            const token = data.access_token;
            await signIn(token)
            navigate("/dojo");
        } catch {
            setError(`${t("login.invalid-credentials")}`);
        }
    }

    // Même mise en page que la page d'accueil, le formulaire remplace les boutons
    return (
        <LandingPage>
            {error && <div className="error-msg">{error}</div>}
            <div className={"login-container"}>
                <input type="email" placeholder={t("login.email")}  value={email}    onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder={t("login.password")}  value={password} onChange={e => setPassword(e.target.value)} />
                <button className={"btn-dojo"} onClick={handleLogin}>{t("login.login")}</button>
            </div>
        </LandingPage>
    );
}

export default Login;
