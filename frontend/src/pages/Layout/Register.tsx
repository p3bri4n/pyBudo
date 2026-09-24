import { useState } from "react";
import {useNavigate} from 'react-router-dom';
import type {RegisterResponse} from "../../interfaces/interfaces.ts";
import {register} from "../../api/authApi.ts";
import {useTranslation} from "react-i18next";

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

    const handleChange = (event: any) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setError("");

        if (form.password !== form.passwordVerification) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        let username: string = form.password;
        let email: string = form.email;
        let password: string = form.password;
        try {
            const data: RegisterResponse = await register({username, email, password});
            const token = data.token;
            localStorage.setItem("token", token);
            navigate("/dojo");
        } catch (error) {
            setError(`${t("register.invalid-credentials")}`);
        }
    };

    return (
        <div>
            <h1>Créer un compte</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="passwordVerification">
                        Confirmer le mot de passe
                    </label>
                    <input
                        id="passwordVerification"
                        name="passwordVerification"
                        type="password"
                        value={form.passwordVerification}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <p>{error}</p>}

                <button type="submit">
                    S'inscrire
                </button>
            </form>
        </div>
    );
}

export default Register;
