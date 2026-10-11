import { Routes, Route } from "react-router-dom";

import Layout from "../Layout/Layout";
import Login from "../Layout/Login/Login";
import Dojo from "../Layout/Dojo/Dojo";
import AuthGuard from "../Guards/AuthGuard";
import GuestGuard from "../Guards/GuestGuard";
import Register from "../Layout/Register/Register";
import LandingPage from "../Layout/LandingPage/LandingPage.tsx";
import AdminGuard from "../Guards/AdminGuard.tsx";
import AdminLayout from "../../components/admin/AdminLayout.tsx";
import AdminDashboard from "../admin/dashboard/AdminDashboard.tsx";
import AdminUsers from "../admin/users/AdminUsers.tsx";
import AdminKatas from "../admin/katas/AdminKatas.tsx";
import AdminKataDetail from "../admin/katas/AdminKataDetail.tsx";
import AdminUserDetail from "../admin/users/AdminUserDetail.tsx";


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
                            <Route path="/back-office" element={<AdminLayout/>}>
                                <Route index element={<AdminDashboard/>}/>
                                <Route path="users" element={<AdminUsers/>}/>
                                <Route path="users/:userId" element={<AdminUserDetail/>}/>
                                <Route path="katas" element={<AdminKatas/>}/>
                                <Route path="katas/:kataId" element={<AdminKataDetail/>}/>
                            </Route>
                        </Route>
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRouter;
