import { Routes, Route } from "react-router-dom";

import Layout from "../Layout/Layout";
import Login from "../Layout/Login/Login";
import Dojo from "../Layout/Dojo/Dojo";
import AuthGuard from "../Layout/AuthGuard";
import Register from "../Layout/Register/Register";


const AppRouter = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dojo"
                    element={
                        <AuthGuard>
                            <Dojo />
                        </AuthGuard>
                    }
                />
            </Route>



            {/* Dojo admin */}
            {/*<Route
                path="/admin"
                element={
                    <AdminGuard>
                        <LayoutAdmin />
                    </AdminGuard>
                }
            >
                <Route
                    path="dashboard"
                    element={<AdminDashboard />}
                />
            </Route>*/}

        </Routes>
    );
};

export default AppRouter;
