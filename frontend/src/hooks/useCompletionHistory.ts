
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type {KataCompletionHistory, KataCompletionStats} from "../interfaces/interfaces";
import {getCompletionsHistory, getCompletionsStats} from "../api/progressionApi";

export function useCompletionHistory() {
    const { t } = useTranslation();

    const [completions, setCompletions] = useState<KataCompletionHistory[]>([]);
    const [stats, setStats] = useState<KataCompletionStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

        return () => {cancelled = true;};
    }, [t]);

    return {completions, stats, loading, error};
}
