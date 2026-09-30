import "./dojo.css";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {PythonRunner} from "../../../components/PythonEditor.tsx";
import { useAuth } from "../../../contexts/useAuth.ts";
import {Progression} from "../../../components/progress/progression.tsx";
import {DEFAULT_RANK, useKatas} from "../../../hooks/useKatas.ts";
import {useProgression} from "../../../hooks/useProgression.ts";
import {useKataProgression} from "../../../hooks/useKataProgression.ts";
import type {Kata} from "../../../interfaces/interfaces.ts";

function Dojo() {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const { user, loading, signOut } = useAuth();
    const {
        progression,
        loading: progressionLoading,
        error: progressionError,
        refresh: refreshProgression,
    } = useProgression();
    const { passedKataIds, error: completionError, completeKata } = useKataProgression();
    // Rang à travailler calculé par le backend. Il passe au suivant quand tous
    // les katas du rang sont réussis (après refreshProgression). kyu_10 si la
    // progression n'a pas pu être chargée.
    const rank = progression
        ? progression.current_rank
        : progressionLoading ? undefined : DEFAULT_RANK;
    const { katas, loading: katasLoading, error: katasError } = useKatas(rank);
    const [selectedKata, setSelectedKata] = useState<Kata | null>(null);

    const handleKataPassed = async (kata: Kata) => {
        if (passedKataIds?.has(kata.id)) return;
        if (await completeKata(kata.id)) {
            refreshProgression();
        }
    };

    const handleLogout = () => {
        signOut()
        navigate('/');
    };

    if (loading) {
        return <p>{t("dojo.welcome-visitor")}</p>;
    }
    return (
        <div>
            <button className={"btn-dojo"} onClick={handleLogout}>
                {t('dojo.logout')}
            </button>
            <h1>Dojo</h1>

            <p>{t("dojo.welcome")}, {user?.username ?? "Bijita"}san.</p>

            <section>
                <h2>{t("dojo.katas")}</h2>
                {katasLoading && <p>{t("dojo.katas-loading")}</p>}
                {katasError && <p>{t("dojo.katas-error")}</p>}
                {completionError && <p>{t("dojo.completion-error")}</p>}
                {!katasLoading && !katasError && katas.length === 0 && <p>{t("dojo.katas-all-passed")}</p>}
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
