import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext"

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Chargement...</p>;
    }
    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AuthGuard;
