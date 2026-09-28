import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "./useAuth";
import { AuthProvider } from "./AuthProvider";
import { renderHook } from "@testing-library/react";
import { act } from "react";

vi.mock("../api/authApi.ts", () => ({
    getMyInfos: vi.fn().mockResolvedValue({ username: "test", email: "test@example.com" }),
}));


beforeEach(() => localStorage.clear())

describe("AuthProvider", () => {
    it("Load token and User with Sign", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

        await act(() => result.current.signIn("jeton-test"))

        expect(localStorage.getItem("access_token")).equal("jeton-test")
        expect(result.current.user?.email).equal("test@example.com")
        expect(result.current.user?.username).equal("test")
    });

    it("Delete token and User with SignOut", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })

        await act(() => result.current.signIn("jeton-test"))
        act(() => result.current.signOut())

        expect(localStorage.getItem("access_token")).toBeNull()
        expect(result.current.user).toBeNull()
    });

})

