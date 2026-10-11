import {KATA_DEFAULT_LANGUAGE} from "../constants/constants.ts";

// Texte traduit {fr, en} dans la langue de l'interface ("en-US" -> "en"), sinon en langue par défaut
export function localize(text: Record<string, string>, language: string): string {
    const code = language.split("-")[0] ?? language;
    return text[code] ?? text[KATA_DEFAULT_LANGUAGE] ?? Object.values(text)[0] ?? "";
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
