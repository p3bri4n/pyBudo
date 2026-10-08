import { Routes, Route } from "react-router-dom";

import Layout from "../Layout/Layout";
import Login from "../Layout/Login/Login";
import Dojo from "../Layout/Dojo/Dojo";
import AuthGuard from "../Guards/AuthGuard";
import GuestGuard from "../Guards/GuestGuard";
import Register from "../Layout/Register/Register";
import LandingPage from "../Layout/LandingPage/LandingPage.tsx";
import Admin from "../Layout/Admin/Admin.tsx";
import AdminGuard from "../Guards/AdminGuard.tsx";


const AppRouter = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                {/* Pages visiteurs : un utilisateur connecté est redirigé vers le Dojo */}
                <Route element={<GuestGuard/>}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Pages connectées : un visiteur est redirigé vers l'accueil */}
                <Route element={<AuthGuard />}>
                    <Route path="/dojo" element={<Dojo />} />
                    <Route element={<AdminGuard />}>
                        <Route path="/back-office" element={<Admin />} />
                    </Route>
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRouter;
