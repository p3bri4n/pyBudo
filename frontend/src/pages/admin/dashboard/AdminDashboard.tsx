import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import {
    getAdminStats,
    getAdminCompletionStats,
    searchAdminUsers,
    getAdminUserCompletions,
} from "../../../api/adminApi.ts";

import type {
    AdminStats,
    AdminCompletionStats,
    AdminUser,
    AdminUserCompletions,
} from "../../../interfaces/interfaces.ts";

import { Loading } from "../../../components/ui/Loading.tsx";
import "./admin-dashboard.css";
import {localize} from "../../../utils/utils.ts";

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
    const { t, i18n } = useTranslation();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [completionStats, setCompletionStats] =
        useState<AdminCompletionStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [userDetails, setUserDetails] =
        useState<AdminUserCompletions | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);

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

    async function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setHasSearched(true);
        setSearchLoading(true);
        setSearchError(null);
        setUsers([]);
        setSelectedUser(null);
        setUserDetails(null);

        try {
            const results = await searchAdminUsers(search.trim());
            setUsers(results);
        } catch (err) {
            setSearchError(
                err instanceof Error
                    ? err.message
                    : t("admin.dashboard.search-error"),
            );
        } finally {
            setSearchLoading(false);
        }
    }

    async function handleSelectUser(user: AdminUser) {
        setSelectedUser(user);
        setUserDetails(null);
        setDetailsError(null);
        setDetailsLoading(true);

        try {
            const details = await getAdminUserCompletions(user.id);
            setUserDetails(details);
        } catch (err) {
            setDetailsError(
                err instanceof Error
                    ? err.message
                    : t("admin.dashboard.user-details-error"),
            );
        } finally {
            setDetailsLoading(false);
        }
    }

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

            <section className="admin-section">
                <h2>{t("admin.dashboard.user-search")}</h2>

                <form  onSubmit={handleSearch}>
                    <input
                        className="input-dojo"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={t("admin.dashboard.search-placeholder")}
                        aria-label={t("admin.dashboard.user-search")}
                    />

                    <button className="btn-dojo"
                            type="submit" disabled={searchLoading}>
                        {searchLoading
                            ? t("admin.dashboard.searching")
                            : t("admin.dashboard.search")}
                    </button>
                </form>

                {searchError && (
                    <p className="admin-error" role="alert">
                        {searchError}
                    </p>
                )}

                {hasSearched && !searchLoading && !searchError && (
                    <div className="admin-user-results">
                        {users.length === 0 ? (
                            <p>
                                {t("admin.dashboard.no-users-found")}
                            </p>
                        ) : (
                            users.map((user) => (
                                <button
                                    type="button"
                                    key={user.id}
                                    className={`admin-user-result ${
                                        selectedUser?.id === user.id
                                            ? "admin-user-result--selected"
                                            : ""
                                    }`}
                                    onClick={() => void handleSelectUser(user)}
                                >
                                    <span>
                                        <strong>{user.username}</strong>
                                        <small>{user.email}</small>
                                    </span>

                                    <span>{user.role}</span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </section>

            {selectedUser && (
                <section className="admin-section">
                    <div className="admin-user-heading">
                        <div>
                            <h2>{selectedUser.username}</h2>
                            <p>{selectedUser.email}</p>
                        </div>

                        <button
                            className={"btn-dojo"}
                            type="button"
                            onClick={() => {
                                setSelectedUser(null);
                                setUserDetails(null);
                                setDetailsError(null);
                            }}
                        >
                            {t("admin.dashboard.close")}
                        </button>
                    </div>

                    {detailsLoading && <Loading />}

                    {detailsError && (
                        <p className="admin-error" role="alert">
                            {detailsError}
                        </p>
                    )}

                    {userDetails && (
                        <>
                            <div className="admin-stats-grid">
                                <StatCard
                                    label={t("admin.dashboard.total-completions")}
                                    value={userDetails.stats.total_completions}
                                />

                                <StatCard
                                    label={t("admin.dashboard.completions-last-7-days")}
                                    value={
                                        userDetails.stats.completions_last_7_days
                                    }
                                />

                                <StatCard
                                    label={t("admin.dashboard.distinct-katas-completed")}
                                    value={
                                        userDetails.stats.distinct_katas_completed
                                    }
                                />

                                <StatCard
                                    label={t("admin.dashboard.disciplines-count")}
                                    value={userDetails.stats.disciplines_count}
                                />

                                <StatCard
                                    label={t("admin.dashboard.ranks-count")}
                                    value={userDetails.stats.ranks_count}
                                />
                            </div>

                            <h3>{t("admin.dashboard.completion-history")}</h3>

                            {userDetails.completions.length === 0 ? (
                                <p>
                                    {t("admin.dashboard.no-completions")}
                                </p>
                            ) : (
                                <div className="admin-table-wrapper">
                                    <table className="admin-completion-table">
                                        <thead>
                                        <tr>
                                            <th>{t("admin.dashboard.kata-title")}</th>
                                            <th>{t("admin.dashboard.discipline")}</th>
                                            <th>{t("admin.dashboard.rank")}</th>
                                            <th>{t("admin.dashboard.completed-at")}</th>
                                            <th>{t("admin.dashboard.verified")}</th>
                                        </tr>
                                        </thead>

                                        <tbody>
                                        {userDetails.completions.map(
                                            (completion, index) => (
                                                <tr
                                                    key={`${completion.kata_id}-${completion.completed_at}-${index}`}
                                                >
                                                    <td>{localize(completion.kata.title, i18n.language) ??
                                                            completion.kata.title.fr ??
                                                            completion.kata.id}
                                                    </td>
                                                    <td>
                                                        {completion.kata.discipline}
                                                    </td>
                                                    <td>
                                                        {completion.kata.rank}
                                                    </td>
                                                    <td>
                                                        {new Intl.DateTimeFormat(
                                                            i18n.language,
                                                            {
                                                                dateStyle: "medium",
                                                                timeStyle: "short",
                                                            },
                                                        ).format(
                                                            new Date(
                                                                completion.completed_at,
                                                            ),
                                                        )}
                                                    </td>
                                                    <td>
                                                        {completion.verified
                                                            ? t("common.yes")
                                                            : t("common.no")}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </div>
    );
}

export default AdminDashboard;
