import { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {login} from "../../../api/authApi.ts";
import type {LoginResponse} from "../../../interfaces/interfaces.ts";
import {useTranslation} from "react-i18next";
import logoPybudo from "../../../assets/images/logo_pybudo.jpeg"
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
            const data: LoginResponse = await login({email, password});
            const token = data.access_token;
            await signIn(token)
            navigate("/dojo");
        } catch {
            setError(`${t("login.invalid-credentials")}`);
        }
    }

    return (
        <div className="login-page">
            <div className="login-box">
                <nav>
                    <Link className={"link-dojo"} to="/register">S'inscrire</Link>
                </nav>
                <img alt={"logo"} src={logoPybudo} />
                <div className="login-logo">{t("login.pybudo")}</div>
                {error && <div className="error-msg">{error}</div>}
                <div className={"login-container"}>
                    <input type="email" placeholder={t("login.email")}  value={email}    onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder={t("login.password")}  value={password} onChange={e => setPassword(e.target.value)} />
                    <button className={"btn-dojo"} onClick={handleLogin}>{t("login.login")}</button>
                </div>
            </div>
        </div>
    );
}

export default Login;
