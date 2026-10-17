import { useEffect, useState} from "react";
import { useTranslation } from "react-i18next";

import {getAdminStats, getAdminCompletionStats} from "../../../api/adminApi.ts";

import type {AdminStats, AdminCompletionStats} from "../../../interfaces/interfaces.ts";

import { Loading } from "../../../components/ui/Loading.tsx";
import "./admin-dashboard.css";

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
    const { t } = useTranslation();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [completionStats, setCompletionStats] =
        useState<AdminCompletionStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadStats() {
            setLoading(true);
            setError(null);

            try {
                const [adminData, completionData] = await Promise.all([
                    getAdminStats(),
                    getAdminCompletionStats(),
                ]);

                if (cancelled) return;

                setStats(adminData);
                setCompletionStats(completionData);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : t("admin.dashboard.unknown-error"),
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadStats();

        return () => {
            cancelled = true;
        };
    }, [t]);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    if (!stats || !completionStats) {
        return null;
    }

    return (
        <div className="AdminDashboard">
            <h1>{t("admin.dashboard.dashboard")}</h1>

            <section className="admin-section">
                <h2>{t("admin.dashboard.global-completions")}</h2>

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

                    <StatCard
                        label={t("admin.dashboard.total-completions")}
                        value={completionStats.total_completions}
                    />

                    <StatCard
                        label={t("admin.dashboard.completions-last-7-days")}
                        value={completionStats.completions_last_7_days}
                    />

                    <StatCard
                        label={t("admin.dashboard.users-with-completions")}
                        value={completionStats.users_with_completions}
                    />

                    <StatCard
                        label={t("admin.dashboard.distinct-katas-completed")}
                        value={completionStats.distinct_katas_completed}
                    />

                    <StatCard
                        label={t("admin.dashboard.disciplines-count")}
                        value={completionStats.disciplines_count}
                    />

                    <StatCard
                        label={t("admin.dashboard.ranks-count")}
                        value={completionStats.ranks_count}
                    />
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;
