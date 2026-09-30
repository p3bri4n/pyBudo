import {useEffect, useState} from "react";
import {getKatas} from "../api/katasApi.ts";
import type {Kata, Rank} from "../interfaces/interfaces.ts";

export const DEFAULT_RANK: Rank = "kyu_10";

// rank : le rang des katas à afficher (current_rank de la progression)
//   - undefined tant qu'il n'est pas connu
//   - null quand tous les katas sont réussis
export function useKatas(rank: Rank | null | undefined) {
    const [allKatas, setAllKatas] = useState<Kata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getKatas()
            .then((katas) => {
                if (!cancelled) setAllKatas(katas);
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

    const katas = rank ? allKatas.filter((kata) => kata.rank === rank) : [];

    return {katas, loading: loading || rank === undefined, error};
}
