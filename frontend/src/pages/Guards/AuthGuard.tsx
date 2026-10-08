import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from "../../contexts/useAuth.ts"

const AuthGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Chargement...</p>;
    }
    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
