import fr from "./fr-FR.json"
import en from "./en-US.json"
import { describe, expect, it } from "vitest";

function flattenKeys(obj: unknown, prefix = ""): string[] {
  let keys: string[] = [];

  if (typeof obj === "object" && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      keys.push(currentPath);
      // Appel récursif uniquement si la valeur est un sous-objet
      keys = keys.concat(flattenKeys(value, currentPath));
    }
  }

  return keys;
}

describe("locales", () => {
    it("check fr-FR and en-US have same keys", () => {
        // Extraction des chemins sous forme de Set pour la comparaison
        const paths1 = new Set(flattenKeys(fr));
        const paths2 = new Set(flattenKeys(en));

        // Calcul des différences
        const missingInF2 = [...paths1].filter(x => !paths2.has(x));
        const missingInF1 = [...paths2].filter(x => !paths1.has(x));

        // Résultat
        expect(missingInF1, "Keys are missing on fr-FR.json").toEqual([]);
        expect(missingInF2, "Keys are missing on en-US.json").toEqual([]);
    })
})
