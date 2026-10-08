import { useEffect, useState } from "react";
import { getAdminUsers } from "../../api/adminApi";
import type { AdminUser } from "../../interfaces/interfaces";
import "./admin-users.css"
import {useTranslation} from "react-i18next";
import {Loading} from "../../components/ui/Loading.tsx";
import {formatDate} from "../../utils/utils.ts";

function AdminUsers() {
    const {t} = useTranslation();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUsers() {
            try {
                const data = await getAdminUsers();
                setUsers(data);
            } finally {
                setLoading(false);
            }
        }

        void loadUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const query = search.toLowerCase();

        return (
            user.email.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <Loading/>;
    }

    return (
        <div className={"AdminUsers"}>
            <h1>{t("admin.users.users")}</h1>

            <input
                type="search"
                placeholder="Rechercher..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            <table>
                <thead>
                <tr>
                    <th>{t("admin.users.email")}</th>
                    <th>{t("admin.users.username")}</th>
                    <th>{t("admin.users.registration")}</th>
                    <th>{t("admin.users.status")}</th>
                    <th>{t("admin.users.role")}</th>
                </tr>
                </thead>

                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                            {user.is_active
                                ? t("admin.users.active")
                                : t("admin.users.inactive")}
                        </td>
                        <td>{user.role}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUsers;
