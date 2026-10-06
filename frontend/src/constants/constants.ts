export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

// Rangs dans l'ordre croissant, identique à backend/app/rank.py
export const RANKS = [
    "kyu_10", "kyu_9", "kyu_8", "kyu_7", "kyu_6",
    "kyu_5", "kyu_4", "kyu_3", "kyu_2", "kyu_1",
    "shodan", "nidan", "sandan", "yondan", "godan",
] as const;

export const EXECUTION_TIMEOUT_MS = 2000;
