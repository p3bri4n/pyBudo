import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { apiClient } from "./apiClient";
import { beforeEach, describe, expect, it } from "vitest";

function respondWith(status: number) {
    apiClient.defaults.adapter = (config: InternalAxiosRequestConfig) =>
        Promise.reject(new AxiosError("fail", "ERR", config, null, 
            {status, statusText: "", headers: {}, config, data: {}}))
}

beforeEach(() => {
    Object.defineProperty(window, "location", { value: { href: "/dojo" }, writable: true })
    localStorage.setItem("access_token", "jeton-test")
})
describe("Interceptor", () => {
    it.each([401, 403])("delete token and redirect sur %i", async (status) => {
        respondWith(status)
        // faire une requete qui renverra 401 ou 403
        await expect(apiClient.get("/auth/me")).rejects.toBeInstanceOf(AxiosError)
        expect(localStorage.getItem("access_token")).toBeNull()
        expect(window.location.href).toBe("/")
    })
    it("500 don't redirect and disconect", async () => {
        respondWith(500)
        await expect(apiClient.get("/auth/me")).rejects.toBeInstanceOf(AxiosError)
        expect(localStorage.getItem("access_token")).toBe("jeton-test")
        expect(window.location.href).toBe("/dojo")
    })
})