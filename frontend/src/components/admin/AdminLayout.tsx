import { NavLink, Outlet } from "react-router-dom";
import "./admin-layout.css"
import {useTranslation} from "react-i18next";

function AdminLayout() {
    const {t} = useTranslation();
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">

                <nav className="nav-dojo">
                    <NavLink to="/back-office" end>
                        {t("admin.layout.dashboard")}
                    </NavLink>

                    <NavLink to="/back-office/users">
                        {t("admin.layout.users")}
                    </NavLink>

                    <NavLink to="/back-office/katas">
                        {t("admin.layout.katas")}
                    </NavLink>
                </nav>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}

export default AdminLayout;
