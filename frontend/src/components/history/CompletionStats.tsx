
import { useTranslation } from "react-i18next";
import type {KataCompletionStats} from "../../interfaces/interfaces.ts";

type CompletionStatsProps = {
    stats: KataCompletionStats | null;
    loading: boolean;
};

export default function CompletionStats({
                                            stats,
                                            loading,
                                        }: CompletionStatsProps) {
    const { t } = useTranslation();

    const items = [
        {
            label: t("history.stats.total"),
            value: stats?.total_completions ?? 0,
        },
        {
            label: t("history.stats.last-7-days"),
            value: stats?.completions_last_7_days ?? 0,
        },
        {
            label: t("history.stats.disciplines"),
            value: stats?.disciplines_count ?? 0,
        },
        {
            label: t("history.stats.ranks"),
            value: stats?.ranks_count ?? 0,
        },
    ];

    return (
        <div className="completion-stats">
            {items.map((item) => (
                <article className="completion-stat" key={item.label}>
                    <h3>{item.label}</h3>
                    <p className="completion-stat__value">
                        {loading ? "—" : item.value}
                    </p>
                </article>
            ))}
        </div>
    );
}
