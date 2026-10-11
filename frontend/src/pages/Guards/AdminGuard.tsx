import {Navigate, Outlet} from "react-router-dom";
import { useAuth } from "../../contexts/useAuth.ts";
import {Loading} from "../../components/ui/Loading.tsx";

const AdminGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading/>;
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
