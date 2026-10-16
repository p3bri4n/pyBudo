
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import CompletionStats from "../../../components/history/CompletionStats";
import type {KataCompletionStats, KataCompletion} from "../../../interfaces/interfaces.ts";

import CompletionHistory from "../../../components/history/CompletionHistory";

import CompletionFilters, {
    type CompletionFiltersValue,
} from "../../../components/history/CompletionFilters";

import {
    getCompletions, getCompletionsStats,
} from "../../../api/progressionApi";
import {DojoNavigation} from "../../../components/navigation/DojoNavigation.tsx";
import {useKatas} from "../../../hooks/useKatas.ts";

export default function History() {
    const { t } = useTranslation();

    const [completions, setCompletions] = useState<KataCompletion[]>([]);
    const [stats, setStats] = useState<KataCompletionStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<CompletionFiltersValue>({
        discipline: "all",
        rank: "all",
        period: "all",
    });

    const {katas: allKatas} = useKatas();

    useEffect(() => {
        let cancelled = false;

        async function loadHistory() {
            setLoading(true);
            setError(null);

            try {
                const [completionData, statsData] = await Promise.all([
                    getCompletions(),
                    getCompletionsStats(),
                ]);

                if (cancelled) return;

                setCompletions(completionData);
                setStats(statsData);
            } catch {
                if (!cancelled) {
                    setError(t("history.error"));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadHistory();

        return () => {
            cancelled = true;
        };
    }, [t]);

    const disciplines = useMemo(
        () => [
            ...new Set(
                completions.flatMap((completion) => {
                    const kata = allKatas.find(
                        (item) => item.id === completion.kata_id
                    );

                    return kata ? [kata.discipline] : [];
                })
            ),
        ].sort(),
        [completions, allKatas],
    );

    const ranks = useMemo(
        () => [
            ...new Set(
                completions.flatMap((completion) => {
                    const kata = allKatas.find(
                        (item) => item.id === completion.kata_id
                    );

                    return kata ? [kata.rank] : [];
                })
            ),
        ],
        [completions, allKatas],
    );

    const filteredCompletions = useMemo(() => {
        return completions
            .filter((completion) => {
                const kata = allKatas.find(
                    (item) => item.id === completion.kata_id
                );

                if (!kata) return false;

                if (
                    filters.discipline !== "all" &&
                    kata.discipline !== filters.discipline
                ) {
                    return false;
                }

                if (
                    filters.rank !== "all" &&
                    kata.rank !== filters.rank
                ) {
                    return false;
                }

                if (filters.period !== "all") {
                    const completedAt = new Date(
                        completion.completed_at
                    ).getTime();

                    const days = filters.period === "7d" ? 7 : 30;
                    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

                    if (completedAt < cutoff) return false;
                }

                return true;
            })
            .sort(
                (a, b) =>
                    new Date(b.completed_at).getTime() -
                    new Date(a.completed_at).getTime()
            );
    }, [completions, allKatas, filters]);

    return (
        <main className="history-page">
            <DojoNavigation />
            <header className="history-page__header">
                <h1>{t("history.title")}</h1>
                <p>{t("history.description")}</p>
            </header>

            {error && (
                <p role="alert" className="history-page__error">
                    {error}
                </p>
            )}

            <section aria-label={t("history.stats.title")}>
                <CompletionStats stats={stats} loading={loading} />
            </section>

            <section className="history-page__list">
                <CompletionFilters
                    value={filters}
                    disciplines={disciplines}
                    ranks={ranks}
                    onChange={setFilters}
                />

                <CompletionHistory
                    completions={filteredCompletions}
                    katas={allKatas}
                    loading={loading}
                />
            </section>
        </main>
    );
}
