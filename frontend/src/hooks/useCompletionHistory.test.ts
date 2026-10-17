import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCompletionHistory } from "./useCompletionHistory";
import {getCompletionsHistory, getCompletionsStats} from "../api/progressionApi";
import type {KataCompletionHistory} from "../interfaces/interfaces.ts";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("../api/progressionApi", () => ({
    getCompletionsHistory: vi.fn(),
    getCompletionsStats: vi.fn(),
}));

const mockedGetCompletionsHistory = vi.mocked(getCompletionsHistory);
const mockedGetCompletionsStats = vi.mocked(getCompletionsStats);

describe("useCompletionHistory", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("retourne les complétions et les statistiques après le chargement", async () => {
        const completions: KataCompletionHistory[] = [
            {
                kata_id: "kata-1",
                code: "ABC123",
                user_id: 1,
                completed_at: "2026-10-01T10:00:00Z",
                verified: false,
                kata: {
                    id: "kata-1",
                    title: {
                        fr: "Heian Shodan",
                        en: "Heian Shodan",
                    },
                    discipline: "core",
                    rank: "kyu_10",
                },
            },
        ];

        const stats = {
            total_completions: 1,
            completions_last_7_days: 1,
            disciplines_count: 1,
            ranks_count: 1,
        };

        mockedGetCompletionsHistory.mockResolvedValue(completions);
        mockedGetCompletionsStats.mockResolvedValue(stats);

        const { result } = renderHook(() => useCompletionHistory());

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.completions).toEqual(completions);
        expect(result.current.stats).toEqual(stats);
        expect(result.current.error).toBeNull();

        expect(mockedGetCompletionsHistory).toHaveBeenCalled();
        expect(mockedGetCompletionsStats).toHaveBeenCalled();
    });

    it("retourne une erreur si le chargement échoue", async () => {
        mockedGetCompletionsHistory.mockRejectedValue(
            new Error("Erreur API"),
        );
        mockedGetCompletionsStats.mockResolvedValue({} as never);

        const { result } = renderHook(() => useCompletionHistory());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe("history.error");
        expect(result.current.completions).toEqual([]);
        expect(result.current.stats).toBeNull();
    });

    it("ne met pas à jour l'état après le démontage du hook", async () => {
        let resolveHistory!: (value: never[]) => void;
        let resolveStats!: (value: never) => void;

        mockedGetCompletionsHistory.mockReturnValue(
            new Promise((resolve) => {
                resolveHistory = resolve;
            }),
        );

        mockedGetCompletionsStats.mockReturnValue(
            new Promise((resolve) => {
                resolveStats = resolve;
            }),
        );

        const { unmount } = renderHook(() => useCompletionHistory());

        unmount();

        resolveHistory([]);
        resolveStats({} as never);

        await Promise.resolve();
        await Promise.resolve();

        expect(mockedGetCompletionsHistory).toHaveBeenCalled();
        expect(mockedGetCompletionsStats).toHaveBeenCalled();
    });
});
