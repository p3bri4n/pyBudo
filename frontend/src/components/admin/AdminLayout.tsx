import { NavLink, Outlet } from "react-router-dom";
import "./admin-layout.css"

function AdminLayout() {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">

                <nav>
                    <NavLink to="/back-office" end>
                        Dashboard
                    </NavLink>

                    <NavLink to="/back-office/users">
                        Utilisateurs
                    </NavLink>

                    <NavLink to="/back-office/katas">
                        Katas
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
