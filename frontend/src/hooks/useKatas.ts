import {useEffect, useState} from "react";
import {getKatas} from "../api/katasApi.ts";
import {RANKS} from "../constants/constants.ts";
import type {Kata, Rank} from "../interfaces/interfaces.ts";

// Premier rang, dans l'ordre croissant, qui a encore des katas "core" à réussir.
// null quand tous les katas "core" sont réussis. Les rangs sans kata sont ignorés.
export function currentRank(katas: Kata[], passedKataIds: Set<string>): Rank | null {
    const coreKatas = katas.filter((kata) => kata.discipline === "core");
    return RANKS.find((rank) =>
        coreKatas.some((kata) => kata.rank === rank && !passedKataIds.has(kata.id))
    ) ?? null;
}

// passedKataIds : les katas réussis par l'utilisateur, null tant qu'ils ne sont pas chargés.
// Renvoie les katas du rang à travailler, qui passe au suivant quand tous
// les katas "core" du rang sont réussis.
export function useKatas(passedKataIds: Set<string> | null) {
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

    const rank = passedKataIds ? currentRank(allKatas, passedKataIds) : null;
    const katas = rank ? allKatas.filter((kata) => kata.rank === rank) : [];

    return {katas, rank, loading: loading || passedKataIds === null, error};
}
