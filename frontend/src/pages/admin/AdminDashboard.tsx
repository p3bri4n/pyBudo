import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/adminApi.ts";
import type { AdminStats } from "../../interfaces/interfaces.ts";
import "./admin-dashboard.css"

function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Erreur inconnue",
                );
            } finally {
                setLoading(false);
            }
        }

        void loadStats();
    }, []);

    if (loading) {
        return <p>Chargement...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!stats) {
        return null;
    }

    return (
        <div className={"AdminDashboard"}>
            <h1>Dashboard</h1>

            <div className="admin-stats-grid">
                <StatCard
                    label="Utilisateurs"
                    value={stats.users.total_users}
                />

                <StatCard
                    label="Utilisateurs actifs"
                    value={stats.users.active_users}
                />

                <StatCard
                    label="Katas"
                    value={stats.katas.katas_number}
                />

                <StatCard
                    label="Katas publiés"
                    value={stats.katas.published_katas}
                />
            </div>
        </div>
    );
}

type StatCardProps = {
    label: string;
    value: number | string;
};

function StatCard({ label, value }: StatCardProps) {
    return (
        <article className="stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
        </article>
    );
}

export default AdminDashboard;
