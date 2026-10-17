
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import CompletionStats from "../../../components/history/CompletionStats";

import CompletionHistory from "../../../components/history/CompletionHistory";

import CompletionFilters, {
    type CompletionFiltersValue,
} from "../../../components/history/CompletionFilters";

import {DojoNavigation} from "../../../components/navigation/DojoNavigation.tsx";
import { useCompletionHistory } from "../../../hooks/useCompletionHistory";

export default function History() {
    const { t } = useTranslation();
    const { completions, stats, loading, error,} = useCompletionHistory();
    const [filters, setFilters] = useState<CompletionFiltersValue>({
        discipline: "all",
        rank: "all",
        period: "all",
    });

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
