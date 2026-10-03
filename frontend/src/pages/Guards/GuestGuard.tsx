import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../../contexts/useAuth.ts"

// Inverse d'AuthGuard : réservé aux visiteurs, un utilisateur connecté va au Dojo
const GuestGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Chargement...</p>;
    }
    if (user) {
        return <Navigate to="/dojo" replace />;
    }

    return <>{children}</>;
};

export default GuestGuard;
