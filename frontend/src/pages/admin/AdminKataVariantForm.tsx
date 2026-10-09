
import { useState } from "react";
import type {FormEvent} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
    addAdminKataVariant,
} from "../../api/adminApi";
import type {
    AdminKata,
    ClassKataInput,
    ClassKataTest,
    FunctionKataInput,
    FunctionKataTest
} from "../../interfaces/interfaces";

import "./admin-katas.css";
import {RANKS} from "../../constants/constants.ts";

interface AdminKataVariantFormProps {
    kata: AdminKata;
}

function rankValue(value: string): AdminKata["rank"] {
    return value as AdminKata["rank"];
}

export function AdminKataVariantForm({
                                         kata,
                                     }: AdminKataVariantFormProps) {
    const {t} = useTranslation();
    const navigate = useNavigate();

    const [id, setId] = useState("");
    const [title, setTitle] = useState(kata.title);
    const [statement, setStatement] = useState(kata.statement);
    const [signature, setSignature] = useState(kata.signature);
    const [discipline, setDiscipline] = useState(kata.discipline);
    const [rank, setRank] = useState(kata.rank);
    const [concepts, setConcepts] = useState(kata.concepts_used.join(", "));
    const [solutionReference, setSolutionReference] = useState(kata.solution_reference);
    const [metadata, setMetadata] = useState(JSON.stringify(kata.metadata, null, 2));
    const [tests, setTests] = useState(JSON.stringify(kata.tests, null, 2));
    const [className, setClassName] = useState(kata.kata_type === "class" ? kata.class_name : "");
    const [replace, setReplace] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();
        setError(null);

        if (!id.trim()) {
            setError("L’identifiant est obligatoire.");
            return;
        }

        if (id.trim() === kata.id) {
            setError(
                "La variante doit avoir un identifiant différent du kata de base.",
            );
            return;
        }

        let parsedMetadata: Record<string, unknown>;
        let parsedTests: | FunctionKataTest[] | ClassKataTest[];

        try {
            parsedMetadata = JSON.parse(metadata);
            if (
                parsedMetadata === null ||
                Array.isArray(parsedMetadata) ||
                typeof parsedMetadata !== "object"
            ) {
                throw new Error("Les métadonnées doivent être un objet JSON.");
            }
        } catch {
            setError("Les métadonnées doivent être un JSON valide.");
            return;
        }

        try {
            const value: unknown = JSON.parse(tests);
            if (!Array.isArray(value)) {
                throw new Error("Les tests doivent être un tableau JSON.");
            }
            parsedTests = value;
        } catch {
            setError("Les tests doivent être un tableau JSON valide.");
            return;
        }

        const common = {
            id: id.trim(),
            title,
            statement,
            signature,
            discipline,
            rank,
            concepts_used: concepts
                .split(",")
                .map((concept) => concept.trim())
                .filter(Boolean),
            kata_type: kata.kata_type,
            meta: {
                ...parsedMetadata,
                status: "publie",
            },
            solution_reference: solutionReference,
        };

        try {
            setSaving(true);

            let created: AdminKata;


            if (kata.kata_type === "class") {
                const classTests = parsedTests as ClassKataTest[];
                const newKata: ClassKataInput = {
                    ...common,
                    kata_type: "class",
                    class_name: className,
                    tests: classTests,
                };
                created = await addAdminKataVariant(kata.id, {kata: newKata, replace});
            } else {
                const functionTests = parsedTests as FunctionKataTest[];
                const newKata: FunctionKataInput = {
                    ...common,
                    kata_type: "function",
                    tests: functionTests,
                };
                created = await addAdminKataVariant(kata.id, {kata: newKata, replace});
            }
            navigate(`/back-office/katas/${encodeURIComponent(created.id)}`);
        } catch {
            setError(
                "Impossible de créer la variante. Vérifie l’identifiant et les données saisies.",
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className="variant-form" onSubmit={handleSubmit}>
            <h2>Créer une variante</h2>

            {error && (
                <p className="variant-form__error" role="alert">
                    {error}
                </p>
            )}

            <label>
                Nouvel identifiant
                <input
                    value={id}
                    onChange={(event) => setId(event.target.value)}
                    required
                />
            </label>

            <label>
                Titre
                <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                />
            </label>

            <label>
                Énoncé
                <textarea
                    value={statement}
                    onChange={(event) => setStatement(event.target.value)}
                    required
                    rows={5}
                />
            </label>

            <label>
                Signature
                <textarea
                    value={signature}
                    onChange={(event) => setSignature(event.target.value)}
                    required
                    rows={3}
                />
            </label>

            <label>
                Discipline
                <input
                    value={discipline}
                    onChange={(event) => setDiscipline(event.target.value)}
                    required
                />
            </label>

            <label>
                Rang
                <select
                    value={rank}
                    onChange={(event) =>
                        setRank(rankValue(event.target.value))
                    }
                >
                    {RANKS.map((value) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Concepts (séparés par des virgules)
                <input
                    value={concepts}
                    onChange={(event) => setConcepts(event.target.value)}
                />
            </label>

            <label>
                Référence de solution
                <input
                    value={solutionReference}
                    onChange={(event) =>
                        setSolutionReference(event.target.value)
                    }
                    required
                />
            </label>

            {kata.kata_type === "class" && (
                <label>
                    Nom de la classe
                    <input
                        value={className}
                        onChange={(event) => setClassName(event.target.value)}
                        required
                    />
                </label>
            )}

            <label>
                Tests (JSON)
                <textarea
                    value={tests}
                    onChange={(event) => setTests(event.target.value)}
                    required
                    rows={12}
                />
            </label>

            <label>
                Métadonnées (JSON)
                <textarea
                    value={metadata}
                    onChange={(event) => setMetadata(event.target.value)}
                    required
                    rows={6}
                />
            </label>

            <label className="variant-form__checkbox">
                <input
                    type="checkbox"
                    checked={replace}
                    onChange={(event) => setReplace(event.target.checked)}
                />
                Archiver le kata de base après la création
            </label>

            <div className="variant-form__actions">
                <button type="submit" disabled={saving}>
                    {saving ? "Création…" : "Créer la variante"}
                </button>

                <button
                    type="button"
                    disabled={saving}
                    onClick={() => navigate(-1)}
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}
