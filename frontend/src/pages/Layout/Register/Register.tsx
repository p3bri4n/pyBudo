import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import {Link, useNavigate} from 'react-router-dom';
import type {RegisterResponse} from "../../../interfaces/interfaces.ts";
import {register} from "../../../api/authApi.ts";
import {useTranslation} from "react-i18next";
import "./register.css"
import {useAuth} from "../../../contexts/useAuth.ts"

function Register() {
    const navigate = useNavigate()
    const {t} = useTranslation()
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        passwordVerification: "",
    });
    const [error, setError] = useState("");
    const { signIn } = useAuth();

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setError("");

        if (form.password !== form.passwordVerification) {
            setError(`${t("register.not-matching-passwords")}`);
            return;
        }
        const username: string = form.username;
        const email: string = form.email;
        const password: string = form.password;
        try {
            const data: RegisterResponse = await register({username, email, password});
            const token = data.access_token;
            await signIn(token)
            navigate("/dojo");
        } catch {
            setError(`${t("register.register-error")}`);
        }
    };

    return (
        <div className={"Register"}>
            <Link className={"link-dojo"} to="/">
                {t("register.back")}
            </Link>

            <h1>{t("register.create-account")}</h1>

            <form className={"register-form"} onSubmit={handleSubmit}>
                <div className={"form-input"}>
                    <label htmlFor="username">{t("register.username")}</label>
                    <input
                        id="username"
                        placeholder={t("register.username")}
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={"form-input"}>
                    <label htmlFor="email">{t("register.email")}</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t("register.email")}
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={"form-input"}>
                    <label htmlFor="password">{t("register.password")}</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder={t("register.password")}
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={"form-input"}>
                    <label htmlFor="passwordVerification">
                        {t("register.password-verification")}
                    </label>
                    <input
                        id="passwordVerification"
                        name="passwordVerification"
                        type="password"
                        placeholder={t("register.password-verification")}
                        value={form.passwordVerification}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <p>{error}</p>}

                <button className={"btn-dojo"} type="submit">
                    S'inscrire
                </button>
            </form>
        </div>
    );
}

export default Register;
