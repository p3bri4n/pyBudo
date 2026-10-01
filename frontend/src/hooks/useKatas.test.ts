import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useKatas } from "./useKatas";
import { getKatas } from "../api/katasApi";
import type { Kata } from "../interfaces/interfaces.ts";

vi.mock("../api/katasApi", () => ({
    getKatas: vi.fn(),
}))

const kata = (id: string, rank: string, discipline = "core") => ({ id, rank, discipline }) as Kata;
const katas = [kata("a", "kyu_10"), kata("b", "kyu_10"), kata("c", "kyu_8"), kata("w", "kyu_5", "web")];

describe("useKatas", () => {
    beforeEach(() => {
        vi.mocked(getKatas).mockResolvedValue(katas);
    })

    it("Returns every kata", async () => {
        const { result } = renderHook(() => useKatas());

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.katas).toEqual(katas);
        expect(result.current.error).toBeNull();
    })

    it("Returns the error when the request fails", async () => {
        vi.mocked(getKatas).mockRejectedValue(new Error("Network Error"));
        const { result } = renderHook(() => useKatas());

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.error).toBe("Network Error");
        expect(result.current.katas).toEqual([]);
    })
})
