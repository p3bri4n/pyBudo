import {Outlet} from "react-router-dom";

function Layout() {

    return (
        <div>
            <header>
                <h1>PyBudo</h1>
            </header>

            <main>
                <Outlet />
            </main>

            <footer>
                PyBudo
            </footer>
        </div>
    );
}

export default Layout;
