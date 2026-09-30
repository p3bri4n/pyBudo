import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useKatas } from "./useKatas";
import { getKatas } from "../api/katasApi";
import type { Kata } from "../interfaces/interfaces.ts";

vi.mock("../api/katasApi", () => ({
    getKatas: vi.fn(),
}))

const kata = (id: string, rank: string) => ({ id, rank }) as Kata;
const katas = [kata("a", "kyu_10"), kata("b", "kyu_10"), kata("c", "kyu_8"), kata("d", "kyu_5")];

describe("useKatas", () => {
    beforeEach(() => {
        vi.mocked(getKatas).mockResolvedValue(katas);
    })

    it("Returns only the katas of the given rank", async () => {
        const { result } = renderHook(() => useKatas("kyu_10"));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.katas.map((k) => k.id)).toEqual(["a", "b"]);
    })

    it("Follows the rank when it changes", async () => {
        const { result, rerender } = renderHook(({ rank }) => useKatas(rank), {
            initialProps: { rank: "kyu_10" as Kata["rank"] },
        });
        await waitFor(() => expect(result.current.loading).toBe(false));

        rerender({ rank: "kyu_8" });

        expect(result.current.katas.map((k) => k.id)).toEqual(["c"]);
    })

    it("Returns no kata when every kata is passed", async () => {
        const { result } = renderHook(() => useKatas(null));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.katas).toEqual([]);
    })

    it("Returns the error when the request fails", async () => {
        vi.mocked(getKatas).mockRejectedValue(new Error("Network Error"));
        const { result } = renderHook(() => useKatas("kyu_10"));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("Network Error");
        expect(result.current.katas).toEqual([]);
    })

    it("Stays loading while the rank is unknown", async () => {
        const { result } = renderHook(() => useKatas(undefined));

        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(result.current.loading).toBe(true);
        expect(result.current.katas).toEqual([]);
    })
})
