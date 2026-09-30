import { describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useProgression } from "./useProgression";
import { getProgression } from "../api/progressionApi";

vi.mock("../api/progressionApi", () => ({
    getProgression: vi.fn(),
}))

describe("useProgression", () => {
    it("Returns the user progression", async () => {
        const data = { core_dan: "kyu_8" as const, current_rank: "kyu_5" as const, disciplines: [{ discipline: "web", highest_dan_practiced: "kyu_10" as const }] };
        vi.mocked(getProgression).mockResolvedValue(data);

        const { result } = renderHook(() => useProgression());

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.progression).toEqual(data);
        expect(result.current.error).toBeNull();
    })

    it("Returns the error when the request fails", async () => {
        vi.mocked(getProgression).mockRejectedValue(new Error("Network Error"));

        const { result } = renderHook(() => useProgression());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.progression).toBeNull();
        expect(result.current.error).toBe("Network Error");
    })
})

describe("useProgression refresh", () => {
    it("Fetches the progression again", async () => {
        vi.mocked(getProgression).mockResolvedValue({ core_dan: null, current_rank: "kyu_10" as const, disciplines: [] });
        const { result } = renderHook(() => useProgression());
        await waitFor(() => expect(result.current.loading).toBe(false));

        vi.mocked(getProgression).mockResolvedValue({ core_dan: "kyu_10" as const, current_rank: "kyu_8" as const, disciplines: [] });
        act(() => result.current.refresh());

        await waitFor(() => expect(result.current.progression?.core_dan).toBe("kyu_10"));
    })
})
