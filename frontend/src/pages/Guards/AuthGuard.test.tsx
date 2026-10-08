import { describe, expect, it, vi } from "vitest";
import { useAuth } from "../../contexts/useAuth";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AuthGuard from "./AuthGuard"
import GuestGuard from "./GuestGuard.tsx";

vi.mock("../../contexts/useAuth.ts", () => ({
    useAuth: vi.fn()
}))
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === "loading.loading") {
                return "Chargement...";
            }

            return key;
        },
    }),
}));

describe("AuthGuard", () => {
    it("Check loading", () => {
        vi.mocked(useAuth).mockReturnValue({ user: null, loading: true, signIn: vi.fn(), signOut: vi.fn() })
        render(
            <MemoryRouter initialEntries={["/dojo"]}>
                <Routes>
                    <Route path="/" element={<p>Accueil</p>}/>
                    <Route element={<GuestGuard/>}>
                        <Route path="/dojo" element={<p>Contenu Protégé</p>}/>
                    </Route>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText("Chargement...")).toBeInTheDocument()
    })

    it("Check protect route without user", () => {
        vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signIn: vi.fn(), signOut: vi.fn() })
        render(
            <MemoryRouter initialEntries={["/dojo"]}>
                <Routes>
                    <Route path="/" element={<p>Accueil</p>}/>
                    <Route element={<AuthGuard/>}>
                        <Route path="/dojo" element={<p>Contenu Protégé</p>}/>
                    </Route>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText("Accueil")).toBeInTheDocument()
        expect(screen.queryByText("Contenu Protégé")).not.toBeInTheDocument()
    })

    it("Check protect route with user", () => {
        vi.mocked(useAuth).mockReturnValue({ user: {
            username: "test", email: "test@example.com",
            role: "user",
            created_at: "2023-01-01T00:00:00Z",
        }, loading: false, signIn: vi.fn(), signOut: vi.fn() })
        render(
            <MemoryRouter initialEntries={["/dojo"]}>
                <Routes>
                    <Route path="/" element={<p>Accueil</p>}/>
                    <Route element={<AuthGuard/>}>
                        <Route path="/dojo" element={<p>Contenu Protégé</p>}/>
                    </Route>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText("Contenu Protégé")).toBeInTheDocument()
        expect(screen.queryByText("Accueil")).not.toBeInTheDocument()
    })
})
