import {useTranslation} from "react-i18next";
import type {UserProgression} from "../../interfaces/interfaces.ts";
import {Loading} from "../ui/Loading.tsx";

type ProgressionProps = {
    progression: UserProgression | null
    loading: boolean
    error: string | null
}

export function Progression({progression, loading, error}: ProgressionProps) {
    const {t} = useTranslation();

    if (loading) {
        return <Loading message={t("progression.loading")}/>;
    }
    if (error || !progression) {
        return <p>{t("progression.error")}</p>;
    }

    return (
        <div className="progression">
            <p>{t("progression.core")} : {progression.core_dan ?? t("progression.no-rank")}</p>
            {progression.disciplines.length > 0 && (
                <ul>
                    {progression.disciplines.map((discipline) => (
                        <li key={discipline.discipline}>
                            {discipline.discipline} : {discipline.highest_dan_practiced}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
