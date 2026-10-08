import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/adminApi.ts";
import type { AdminStats } from "../../interfaces/interfaces.ts";
import "./admin-dashboard.css"
import {useTranslation} from "react-i18next";
import {Loading} from "../../components/ui/Loading.tsx";

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


function AdminDashboard() {
    const {t} = useTranslation();
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
                        : t("admin.dashboard.unknown-error"),
                );
            } finally {
                setLoading(false);
            }
        }

        void loadStats();
    }, [t]);

    if (loading) {
        return <Loading/>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!stats) {
        return null;
    }

    return (
        <div className={"AdminDashboard"}>
            <h1>{t("admin.dashboard.dashboard")}</h1>

            <div className="admin-stats-grid">
                <StatCard
                    label={t("admin.dashboard.users")}
                    value={stats.users.total_users}
                />

                <StatCard
                    label={t("admin.dashboard.active-users")}
                    value={stats.users.active_users}
                />

                <StatCard
                    label={t("admin.dashboard.katas")}
                    value={stats.katas.katas_number}
                />

                <StatCard
                    label={t("admin.dashboard.published-katas")}
                    value={stats.katas.published_katas}
                />
            </div>
        </div>
    );
}

export default AdminDashboard;
