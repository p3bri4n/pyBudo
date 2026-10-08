import { useEffect, useState } from "react";
import { getAdminUsers } from "../../api/adminApi";
import type { AdminUser } from "../../interfaces/interfaces";
import "./admin-users.css"

function AdminUsers() {
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
        return <p>Chargement...</p>;
    }

    return (
        <div className={"AdminUsers"}>
            <h1>Utilisateurs</h1>

            <input
                type="search"
                placeholder="Rechercher..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            <table>
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Inscription</th>
                    <th>Statut</th>
                    <th>Rôle</th>
                </tr>
                </thead>

                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>{user.created_at}</td>
                        <td>
                            {user.is_active
                                ? "Actif"
                                : "Désactivé"}
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
