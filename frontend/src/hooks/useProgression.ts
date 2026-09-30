import {useCallback, useEffect, useState} from "react";
import {getProgression} from "../api/progressionApi.ts";
import type {UserProgression} from "../interfaces/interfaces.ts";

export function useProgression() {
    const [progression, setProgression] = useState<UserProgression | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Incrémenté par refresh() pour relancer la requête
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let cancelled = false;

        getProgression()
            .then((data) => {
                if (!cancelled) setProgression(data);
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
    }, [version]);

    const refresh = useCallback(() => setVersion((v) => v + 1), []);

    return {progression, loading, error, refresh};
}
