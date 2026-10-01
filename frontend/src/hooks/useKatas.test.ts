import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { currentRank, useKatas } from "./useKatas";
import { getKatas } from "../api/katasApi";
import type { Kata } from "../interfaces/interfaces.ts";

vi.mock("../api/katasApi", () => ({
    getKatas: vi.fn(),
}))

const kata = (id: string, rank: string, discipline = "core") => ({ id, rank, discipline }) as Kata;
const katas = [kata("a", "kyu_10"), kata("b", "kyu_10"), kata("c", "kyu_8"), kata("d", "kyu_5")];

describe("currentRank", () => {
    it("Starts at the lowest rank", () => {
        expect(currentRank(katas, new Set())).toBe("kyu_10");
    })

    it("Stays on the rank until all its katas are passed", () => {
        expect(currentRank(katas, new Set(["a"]))).toBe("kyu_10");
    })

    it("Moves to the next rank with katas", () => {
        expect(currentRank(katas, new Set(["a", "b"]))).toBe("kyu_8");
        expect(currentRank(katas, new Set(["a", "b", "c"]))).toBe("kyu_5");
    })

    it("Requires the lower rank first", () => {
        expect(currentRank(katas, new Set(["a", "c"]))).toBe("kyu_10");
    })

    it("Ignores the katas of other disciplines", () => {
        expect(currentRank([kata("w", "kyu_10", "web"), kata("c", "kyu_8")], new Set())).toBe("kyu_8");
    })

    it("Returns null when every kata is passed", () => {
        expect(currentRank(katas, new Set(["a", "b", "c", "d"]))).toBeNull();
    })
})

describe("useKatas", () => {
    beforeEach(() => {
        vi.mocked(getKatas).mockResolvedValue(katas);
    })

    it("Returns only the katas of the current rank", async () => {
        const { result } = renderHook(() => useKatas(new Set()));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.rank).toBe("kyu_10");
        expect(result.current.katas.map((k) => k.id)).toEqual(["a", "b"]);
    })

    it("Moves to the next rank when the passed katas change", async () => {
        const { result, rerender } = renderHook(({ passed }) => useKatas(passed), {
            initialProps: { passed: new Set(["a"]) },
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        rerender({ passed: new Set(["a", "b"]) });

        expect(result.current.katas.map((k) => k.id)).toEqual(["c"]);
    })

    it("Returns no kata when every kata is passed", async () => {
        const { result } = renderHook(() => useKatas(new Set(["a", "b", "c", "d"])));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.katas).toEqual([]);
    })

    it("Returns the error when the request fails", async () => {
        vi.mocked(getKatas).mockRejectedValue(new Error("Network Error"));
        const { result } = renderHook(() => useKatas(new Set()));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("Network Error");
        expect(result.current.katas).toEqual([]);
    })

    it("Stays loading while the passed katas are unknown", async () => {
        const { result } = renderHook(() => useKatas(null));

        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(result.current.loading).toBe(true);
        expect(result.current.katas).toEqual([]);
    })
})
