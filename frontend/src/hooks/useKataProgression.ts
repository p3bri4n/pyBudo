import {useCallback, useEffect, useState} from "react";
import {isAxiosError} from "axios";
import {addCompletion, getCompletions} from "../api/progressionApi.ts";

export function useKataProgression() {
    const [passedKataIds, setPassedKataIds] = useState<Set<string> | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getCompletions()
            .then((completions) => {
                if (!cancelled) setPassedKataIds(new Set(completions.map((completion) => completion.kata_id)));
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : String(err));
                setPassedKataIds(new Set());
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const completeKata = useCallback(async (kataId: string, code: string): Promise<boolean> => {
        setError(null);
        try {
            await addCompletion(kataId, code);
        } catch (err: unknown) {
            if (!(isAxiosError(err) && err.response?.status === 409)) {
                setError(err instanceof Error ? err.message : String(err));
                return false;
            }
        }
        setPassedKataIds((ids) => new Set(ids).add(kataId));
        return true;
    }, []);

    return {passedKataIds, loading: passedKataIds === null, error, completeKata};
}
