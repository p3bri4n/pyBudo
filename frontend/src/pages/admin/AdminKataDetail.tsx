import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
    archiveAdminKata,
    getAdminKata,
} from "../../api/adminApi";
import type { AdminKata } from "../../interfaces/interfaces";
import { Loading } from "../../components/ui/Loading";

function AdminKataDetail() {
    const { kataId } = useParams<{ kataId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [kata, setKata] = useState<AdminKata | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!kataId) {
            setError(t("admin.katas.missing-id"));
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadKata() {
            try {
                const data = await getAdminKata(kataId!);

                if (!cancelled) {
                    setKata(data);
                }
            } catch (error) {
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : t("admin.katas.load-error"),
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadKata();

        return () => {
            cancelled = true;
        };
    }, [kataId, t]);

    async function handleArchive() {
        if (!kataId || !kata) return;

        const confirmed = window.confirm(
            t("admin.katas.confirm-archive"),
        );

        if (!confirmed) return;

        setSaving(true);
        setError(null);

        try {
            const archivedKata = await archiveAdminKata(kataId);
            setKata(archivedKata);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : t("admin.katas.archive-error"),
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <Loading />;
    }

    if (error && !kata) {
        return (
            <section>
                <p role="alert">{error}</p>
                <button onClick={() => navigate("/back-office/katas")}>
                    {t("common.back")}
                </button>
            </section>
        );
    }

    if (!kata) return null;

    return (
        <section className="admin-kata-detail">
            <button
                type="button"
                onClick={() => navigate("/back-office/katas")}
            >
                ← {t("common.back")}
            </button>

            <h1>{kata.title}</h1>

            {error && <p role="alert">{error}</p>}

            <dl>
                <dt>{t("admin.katas.id")}</dt>
                <dd>{kata.id}</dd>

                <dt>{t("admin.katas.type")}</dt>
                <dd>{kata.kata_type}</dd>

                <dt>{t("admin.katas.rank")}</dt>
                <dd>{kata.rank}</dd>

                <dt>{t("admin.katas.discipline")}</dt>
                <dd>{kata.discipline}</dd>
            </dl>

            <div className="admin-kata-actions">
                <button
                    type="button"
                    onClick={handleArchive}
                    disabled={saving || kata.metadata.status === "archive"}
                >
                    {saving
                        ? t("common.saving")
                        : t("admin.katas.archive")}
                </button>
            </div>
        </section>
    );
}

export default AdminKataDetail;
