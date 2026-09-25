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

    async function signIn(token: string) {
        localStorage.setItem("access_token", token)
        const data = await getMyInfos()
        setUser(data)
    }

    function signOut() {
        localStorage.removeItem("access_token")
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                
                signIn,
                signOut
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
