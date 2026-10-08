import {Navigate, Outlet} from "react-router-dom";
import { useAuth } from "../../contexts/useAuth.ts";

const AdminGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Chargement...</p>;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }
    if (user.role !== "admin") {
        return <Navigate to="/dojo" replace />;
    }

    return <Outlet />;
};

export default AdminGuard;
