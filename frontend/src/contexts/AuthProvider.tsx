import {type ReactNode, useEffect, useState} from "react";
import {getMyInfos} from "../api/authApi.ts";
import type {User} from "../interfaces/interfaces.ts";
import {AuthContext} from "./AuthContext.ts";

export function AuthProvider({ children }: {children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("access_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getMyInfos();
                setUser(data);
            } catch (error) {
                console.error("Erreur récupération utilisateur :", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
