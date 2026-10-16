
import { useTranslation } from "react-i18next";
import { localize } from "../../utils/utils";
import type {KataCompletionHistory} from "../../interfaces/interfaces.ts";

type CompletionHistoryProps = {
    completions: KataCompletionHistory[];
    loading: boolean;
};

export default function CompletionHistory({
                                              completions,
                                              loading,
                                          }: CompletionHistoryProps) {
    const { t, i18n } = useTranslation();

    if (loading) {
        return <p>{t("history.loading")}</p>;
    }

    if (completions.length === 0) {
        return <p>{t("history.empty")}</p>;
    }

    return (
        <div className="completion-history">
            <div className="completion-history__header">
                <h2>{t("history.recent-completions")}</h2>
                <span>{completions.length}</span>
            </div>

            <ul className="completion-history__list">
                {completions.map((completion, index) => {
                    return (
                        <li
                            className="completion-history__item"
                            key={`${completion.kata_id}-${completion.completed_at}-${index}`}
                        >
                            <div className="completion-history__info">
                                <h3>
                                    {localize(completion.kata.title, i18n.language)}
                                </h3>

                                <p>
                                    {completion.kata.discipline}
                                    {" · "}
                                    {completion.kata.rank}
                                </p>
                                <p>
                                    {completion.code}
                                </p>
                                <time dateTime={completion.completed_at}>
                                    {new Date(
                                        completion.completed_at
                                    ).toLocaleString(i18n.language)}
                                </time>

                                <p>
                                    {completion.verified
                                        ? t("history.verified")
                                        : t("history.not-verified")}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
