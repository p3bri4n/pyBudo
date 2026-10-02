import {useEffect, useState} from "react";
import {getKatas} from "../api/katasApi.ts";
import type {Kata} from "../interfaces/interfaces.ts";

// Le rang de l'utilisateur n'est pas calculé ici : il est renvoyé par le backend dans la progression.
export function useKatas() {
    const [katas, setKatas] = useState<Kata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getKatas()
            .then((data) => {
                if (!cancelled) setKatas(data);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return {katas, loading, error};
}
