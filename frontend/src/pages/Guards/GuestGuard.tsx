import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from "../../contexts/useAuth.ts"
import {Loading} from "../../components/ui/Loading.tsx";

// Inverse d'AuthGuard : réservé aux visiteurs, un utilisateur connecté va au Dojo
const GuestGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading/>;
    }
    if (user) {
        return <Navigate to={user.role === "admin" ? "/back-office" : "/dojo"} replace />;
    }

    return <Outlet />;
};

export default GuestGuard;
