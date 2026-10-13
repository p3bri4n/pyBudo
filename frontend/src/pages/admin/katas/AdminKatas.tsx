import { useEffect, useState } from "react";
import { getAdminKatas } from "../../../api/adminApi.ts";
import type {AdminKata} from "../../../interfaces/interfaces.ts";
import "./admin-katas.css"
import {Loading} from "../../../components/ui/Loading.tsx";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";
import {localize} from "../../../utils/utils.ts";

function AdminKatas() {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate();
    const [katas, setKatas] = useState<AdminKata[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadKatas() {
            try {
                const data = await getAdminKatas();
                setKatas(data);
            } catch (error) {
            setError(error instanceof Error ? error.message : t("common.error"))
            } finally {
                setLoading(false);
            }
        }

        void loadKatas();
    }, [t]);

    const filteredKatas = katas.filter((kata) => {
        const query = search.toLowerCase();

        return (
            localize(kata.title, i18n.language).toLowerCase().includes(query) ||
            kata.rank.toLowerCase().includes(query) ||
            kata.discipline.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return <Loading/>;
    }

    return (
        <div className={"AdminKatas"}>
            <h1>Katas</h1>
            <input
                className={"input-dojo"}
                type="search"
                placeholder={t("admin.katas.search")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />
            {error && <p role="alert">{error}</p>}
            <table>
                <thead>
                <tr>
                    <th>{t("admin.katas.id")}</th>
                    <th>{t("admin.katas.title")}</th>
                    <th>{t("admin.katas.type")}</th>
                    <th>{t("admin.katas.rank")}</th>
                    <th>{t("admin.katas.discipline")}</th>
                    <th>{t("admin.katas.status")}</th>
                </tr>
                </thead>

                <tbody>
                {filteredKatas.map((kata: AdminKata) => (
                    <tr className={"kata-row"}
                        key={kata.id}
                        onClick={() =>
                            navigate(`/back-office/katas/${encodeURIComponent(kata.id)}`)
                        }>
                        <td>{kata.id}</td>
                        <td>{localize(kata.title, i18n.language)}</td>
                        <td>{kata.kata_type}</td>
                        <td>{kata.rank}</td>
                        <td>{kata.discipline}</td>
                        <td>
                            {typeof kata.metadata.status === "string"
                                ? kata.metadata.status
                                : "—"}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminKatas;
