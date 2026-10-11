import type {Translated} from "../interfaces/interfaces.ts";

// Texte traduit {fr, en} dans la langue de l'interface ("en-US" -> "en"),
// sinon en français (seule traduction obligatoire, cf. Translated dans backend/app/schemas.py)
export function localize(text: Translated, language: string): string {
    const code = language.split("-")[0] ?? language;
    const translations: Record<string, string | null | undefined> = text;
    return translations[code] || text.fr;
}

export function formatDate(date: string): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));
}
