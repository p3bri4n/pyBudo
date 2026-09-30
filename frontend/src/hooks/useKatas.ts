import {useEffect, useState} from "react";
import type {Kata} from "../interfaces/interfaces.ts";

export function useKatas() {
    const [katas, setKatas] = useState<Kata[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        import("../../bootstrap_katas_v2.json")
            .then((module) => {
                if (!cancelled) setKatas(module.default as Kata[]);
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
