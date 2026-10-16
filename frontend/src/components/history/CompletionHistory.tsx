
import { useTranslation } from "react-i18next";
import { localize } from "../../utils/utils";
import type {Kata, KataCompletion} from "../../interfaces/interfaces.ts";

type CompletionHistoryProps = {
    completions: KataCompletion[];
    katas: Kata[];
    loading: boolean;
};

export default function CompletionHistory({
                                              completions,
                                              katas,
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
                    const kata = katas.find(
                        (item) => item.id === completion.kata_id
                    );

                    if (!kata) return null;

                    return (
                        <li
                            className="completion-history__item"
                            key={`${completion.kata_id}-${completion.completed_at}-${index}`}
                        >
                            <div className="completion-history__info">
                                <h3>
                                    {localize(kata.title, i18n.language)}
                                </h3>

                                <p>
                                    {kata.discipline}
                                    {" · "}
                                    {kata.rank}
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
