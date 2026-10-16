
import { useTranslation } from "react-i18next";

export type CompletionFiltersValue = {
    discipline: string;
    rank: string;
    period: "all" | "7d" | "30d";
};

type CompletionFiltersProps = {
    value: CompletionFiltersValue;
    disciplines: string[];
    ranks: string[];
    onChange: (value: CompletionFiltersValue) => void;
};

export default function CompletionFilters({
                                              value,
                                              disciplines,
                                              ranks,
                                              onChange,
                                          }: CompletionFiltersProps) {
    const { t } = useTranslation();

    return (
        <div className="completion-filters">
            <label>
                {t("history.filters.discipline")}
                <select
                    value={value.discipline}
                    onChange={(event) =>
                        onChange({ ...value, discipline: event.target.value })
                    }
                >
                    <option value="all">{t("history.filters.all")}</option>
                    {disciplines.map((discipline) => (
                        <option key={discipline} value={discipline}>
                            {discipline}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                {t("history.filters.rank")}
                <select
                    value={value.rank}
                    onChange={(event) =>
                        onChange({ ...value, rank: event.target.value })
                    }
                >
                    <option value="all">{t("history.filters.all")}</option>
                    {ranks.map((rank) => (
                        <option key={rank} value={rank}>
                            {rank}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                {t("history.filters.period")}
                <select
                    value={value.period}
                    onChange={(event) =>
                        onChange({
                            ...value,
                            period: event.target.value as CompletionFiltersValue["period"],
                        })
                    }
                >
                    <option value="all">{t("history.filters.periods.all")}</option>
                    <option value="7d">{t("history.filters.periods.7d")}</option>
                    <option value="30d">{t("history.filters.periods.30d")}</option>
                </select>
            </label>
        </div>
    );
}
