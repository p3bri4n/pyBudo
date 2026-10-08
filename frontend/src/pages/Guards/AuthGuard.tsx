import {Navigate, Outlet} from 'react-router-dom';
import { useAuth } from "../../contexts/useAuth.ts"
import {Loading} from "../../components/ui/Loading.tsx";

const AuthGuard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading/>;
    }
    if (!user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
