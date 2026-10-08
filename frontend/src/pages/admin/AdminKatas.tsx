import { useEffect, useState } from "react";
import { getAdminKatas } from "../../api/adminApi";
import type {AdminKata} from "../../interfaces/interfaces";
import "./admin-katas.css"
import {Loading} from "../../components/ui/Loading.tsx";
import {useTranslation} from "react-i18next";

function AdminKatas() {
    const {t} = useTranslation();
    const [katas, setKatas] = useState<AdminKata[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadKatas() {
            try {
                const data = await getAdminKatas();
                setKatas(data);
            } finally {
                setLoading(false);
            }
        }

        void loadKatas();
    }, []);

    if (loading) {
        return <Loading/>;
    }

    return (
        <div className={"AdminKatas"}>
            <h1>Katas</h1>

            <table>
                <thead>
                <tr>
                    <th>{t("admin.katas.id")}</th>
                    <th>{t("admin.katas.title")}</th>
                    <th>{t("admin.katas.type")}</th>
                    <th>{t("admin.katas.rank")}</th>
                    <th>{t("admin.katas.discipline")}</th>
                </tr>
                </thead>

                <tbody>
                {katas.map((kata) => (
                    <tr key={kata.id}>
                        <td>{kata.id}</td>
                        <td>{kata.title}</td>
                        <td>{kata.kata_type}</td>
                        <td>{kata.rank}</td>
                        <td>{kata.discipline}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminKatas;
