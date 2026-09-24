import { createContext, useContext, useEffect, useState } from "react";
import {getMyInfos} from "../api/authApi.ts";
import type {User} from "../interfaces/interfaces.ts";

const AuthContext = createContext(null);


export function AuthProvider({ children }: {children: any}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const data = await getMyInfos()
            setUser(data);
        } catch (error) {
            console.error("Erreur récupération utilisateur :", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
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

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
        );
    }

    return context;
}
