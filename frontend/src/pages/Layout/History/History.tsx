
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import CompletionStats from "../../../components/history/CompletionStats";
import type {KataCompletionStats, KataCompletionHistory} from "../../../interfaces/interfaces.ts";

import CompletionHistory from "../../../components/history/CompletionHistory";

import CompletionFilters, {
    type CompletionFiltersValue,
} from "../../../components/history/CompletionFilters";

import {getCompletionsHistory, getCompletionsStats} from "../../../api/progressionApi";
import {DojoNavigation} from "../../../components/navigation/DojoNavigation.tsx";

export default function History() {
    const { t } = useTranslation();

    const [completions, setCompletions] = useState<KataCompletionHistory[]>([]);
    const [stats, setStats] = useState<KataCompletionStats | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<CompletionFiltersValue>({
        discipline: "all",
        rank: "all",
        period: "all",
    });



    useEffect(() => {
        let cancelled = false;

        async function loadHistory() {
            setLoading(true);
            setError(null);

            try {
                const [completionData, statsData] = await Promise.all([
                    getCompletionsHistory(),
                    getCompletionsStats(),
                ]);
                console.log(completionData);
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
                completions.map((completion) => completion.kata.discipline)
            ),
        ].sort(),
        [completions],
    );

    const ranks = useMemo(
        () => [
            ...new Set(
                completions.map((completion) => completion.kata.rank)
            ),
        ],
        [completions],
    );

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
                    completions={completions}
                    loading={loading}
                />
            </section>
        </main>
    );
}
