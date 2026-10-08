import { describe, expect, it, vi } from "vitest";
import { useAuth } from "../../contexts/useAuth";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import GuestGuard from "./GuestGuard";
import AuthGuard from "./AuthGuard.tsx";
import AdminGuard from "./AdminGuard.tsx";

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

const renderHome = () => render(
    <MemoryRouter initialEntries={["/"]}>
        <Routes>
            <Route element={<GuestGuard/>}>
                <Route path="/" element={<p>Accueil</p>}/>
            </Route>
            <Route element={<AuthGuard/>}>
                <Route path="/dojo" element={<p>Dojo</p>}/>
            </Route>
            <Route element={<AdminGuard/>}>
                <Route path="/back-office" element={<p>Back-office</p>}/>
            </Route>
        </Routes>
    </MemoryRouter>
)

describe("GuestGuard", () => {
    it("Check loading", () => {
        vi.mocked(useAuth).mockReturnValue({ user: null, loading: true, signIn: vi.fn(), signOut: vi.fn() })
        renderHome()
        expect(screen.getByText("Chargement...")).toBeInTheDocument()
    })

    it("Shows the page without user", () => {
        vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signIn: vi.fn(), signOut: vi.fn() })
        renderHome()
        expect(screen.getByText("Accueil")).toBeInTheDocument()
        expect(screen.queryByText("Dojo")).not.toBeInTheDocument()
    })

    it("Redirects to the dojo with user", () => {
        vi.mocked(useAuth).mockReturnValue({ user: {
            username: "test", email: "test@example.com",
            role: "user",
            created_at: "2023-01-01T00:00:00Z"
        }, loading: false, signIn: vi.fn(), signOut: vi.fn() })
        renderHome()
        expect(screen.getByText("Dojo")).toBeInTheDocument()
        expect(screen.queryByText("Accueil")).not.toBeInTheDocument()
    })
    it("redirige un admin vers /back-office", () => {
        vi.mocked(useAuth).mockReturnValue({user: {role: "admin"}, loading: false,} as ReturnType<typeof useAuth>);
        renderHome()
        expect(screen.getByText("Back-office")).toBeInTheDocument();
    })
})
