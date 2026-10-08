import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from "../../contexts/useAuth.ts"

// Inverse d'AuthGuard : réservé aux visiteurs, un utilisateur connecté va au Dojo
const GuestGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Chargement...</p>;
    }
    if (user) {
        return <Navigate to={user.role === "admin" ? "/back-office" : "/dojo"} replace />;
    }

    return <Outlet />;
};

export default GuestGuard;
