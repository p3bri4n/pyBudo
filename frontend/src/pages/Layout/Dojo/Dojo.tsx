import "./dojo.css";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {PythonRunner} from "../../../components/PythonEditor.tsx";
import { useAuth } from "../../../contexts/useAuth.ts";
import {Progression} from "../../../components/progress/progression.tsx";
import {useKatas} from "../../../hooks/useKatas.ts";
import {useProgression} from "../../../hooks/useProgression.ts";
import {useKataProgression} from "../../../hooks/useKataProgression.ts";
import type {Kata, Rank} from "../../../interfaces/interfaces.ts";
import {RANKS} from "../../../constants/constants.ts";

function Dojo() {
    const {t} = useTranslation();
    const { loading } = useAuth();
    const {
        progression,
        loading: progressionLoading,
        error: progressionError,
        refresh: refreshProgression,
    } = useProgression();

    const { passedKataIds, error: completionError, completeKata } = useKataProgression();
    const { katas: allKatas, loading: katasLoading, error: katasError } = useKatas();
    const [selectedRank, setSelectedRank] = useState<Rank | null>(null);
    const [selectedKata, setSelectedKata] = useState<Kata | null>(null);

    // Rangs présents dans la réponse /katas, dans l'ordre croissant
    const ranks = RANKS.filter((rank) => allKatas.some((kata) => kata.rank === rank));
    // Par défaut, le rang de l'utilisateur, ou le premier rang disponible s'il n'a pas de kata
    const userRank = progression?.core_dan && ranks.includes(progression.core_dan) ? progression.core_dan : null;
    const displayedRank = selectedRank ?? userRank ?? ranks[0] ?? null;
    const katas = allKatas.filter((kata) => kata.rank === displayedRank);

    const handleRankChange = (rank: Rank) => {
        setSelectedRank(rank);
        setSelectedKata(null);
    };

    const handleKataPassed = async (kata: Kata) => {
        if (passedKataIds?.has(kata.id)) return;
        if (await completeKata(kata.id)) {
            refreshProgression();
        }
    };

    if (loading) {
        return <p>{t("dojo.welcome-visitor")}</p>;
    }
    return (
        <div>

            <section>
                <h2>{t("dojo.katas")}</h2>
                {ranks.length > 0 && (
                    <label className="kata-rank-select">
                        {t("dojo.rank")}{" "}
                        <select
                            value={displayedRank ?? ""}
                            onChange={(event) => handleRankChange(event.target.value as Rank)}
                        >
                            {ranks.map((rank) => (
                                <option key={rank} value={rank}>{rank}</option>
                            ))}
                        </select>
                    </label>
                )}
                {katasLoading && <p>{t("dojo.katas-loading")}</p>}
                {katasError && <p>{t("dojo.katas-error")}</p>}
                {completionError && <p>{t("dojo.completion-error")}</p>}
                <ul className="kata-list">
                    {katas.map((kata) => (
                        <li key={kata.id}>
                            <button
                                type="button"
                                className={`kata-item${selectedKata?.id === kata.id ? " kata-item--selected" : ""}`}
                                onClick={() => setSelectedKata(kata)}
                            >
                                <h3>{kata.title}</h3>
                                <span className="kata-rank">{kata.rank}</span>
                                {passedKataIds?.has(kata.id) && (
                                    <span className="kata-passed"> ✅ {t("dojo.kata-passed")}</span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2>{t("dojo.progression")}</h2>
                <Progression
                    progression={progression}
                    loading={progressionLoading}
                    error={progressionError}
                />
            </section>

            <section className="kata-workspace">
                {selectedKata && (
                    <aside className="kata-details">
                        <h2>{selectedKata.title}</h2>
                        <p>{selectedKata.statement}</p>
                    </aside>
                )}
                <div className="kata-editor">
                    {/* key : remonte l'éditeur pour repartir de la signature à chaque changement de kata */}
                    <PythonRunner
                        key={selectedKata?.id}
                        initialCode={selectedKata ? `${selectedKata.signature}\n    pass\n` : undefined}
                        kata={selectedKata ?? undefined}
                        onKataPassed={handleKataPassed}
                    />
                </div>
            </section>
        </div>
    );
}

export default Dojo;
