import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { useKataProgression } from "./useKataProgression";
import { addCompletion, getCompletions } from "../api/progressionApi";

vi.mock("../api/progressionApi", () => ({
    addCompletion: vi.fn(),
    getCompletions: vi.fn(),
}))

const axiosError = (status: number) => new AxiosError("Request failed", undefined, undefined, undefined, {
    status, statusText: "", data: {}, headers: {}, config: { headers: new AxiosHeaders() },
});

const completion = (kata_id: string) => ({ kata_id, user_id: 1, completed_at: "2026-09-30T10:00:00Z", verified: false });

describe("useKataProgression", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getCompletions).mockResolvedValue([completion("kyu_10_perimetre")]);
    })

    it("Loads the passed katas of the user", async () => {
        const { result } = renderHook(() => useKataProgression());

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.passedKataIds).toEqual(new Set(["kyu_10_perimetre"]));
    })

    it("Sends the kata id and adds it to the passed katas", async () => {
        vi.mocked(addCompletion).mockResolvedValue(completion("kyu_10_celsius"));
        const { result } = renderHook(() => useKataProgression());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let saved;
        await act(async () => {
            saved = await result.current.completeKata("kyu_10_celsius");
        });

        expect(addCompletion).toHaveBeenCalledWith("kyu_10_celsius");
        expect(saved).toBe(true);
        expect(result.current.passedKataIds).toEqual(new Set(["kyu_10_perimetre", "kyu_10_celsius"]));
    })

    it("Treats an already recorded completion as saved", async () => {
        vi.mocked(addCompletion).mockRejectedValue(axiosError(409));
        const { result } = renderHook(() => useKataProgression());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let saved;
        await act(async () => {
            saved = await result.current.completeKata("kyu_10_celsius");
        });

        expect(saved).toBe(true);
        expect(result.current.error).toBeNull();
        expect(result.current.passedKataIds?.has("kyu_10_celsius")).toBe(true);
    })

    it("Returns the error without marking the kata when saving fails", async () => {
        vi.mocked(addCompletion).mockRejectedValue(axiosError(500));
        const { result } = renderHook(() => useKataProgression());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let saved;
        await act(async () => {
            saved = await result.current.completeKata("kyu_10_celsius");
        });

        expect(saved).toBe(false);
        expect(result.current.error).toBe("Request failed");
        expect(result.current.passedKataIds?.has("kyu_10_celsius")).toBe(false);
    })
})
