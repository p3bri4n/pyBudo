import { useEffect, useState } from "react";
import { getAdminKatas } from "../../api/adminApi";
import type {AdminKata} from "../../interfaces/interfaces";
import "./admin-katas.css"

function AdminKatas() {
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
        return <p>Chargement...</p>;
    }

    return (
        <div className={"AdminKatas"}>
            <h1>Katas</h1>

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Rank</th>
                    <th>Discipline</th>
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
