import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AdminGuard from "./AdminGuard";
import { useAuth } from "../../contexts/useAuth.ts";

vi.mock("../../contexts/useAuth.ts");

vi.mock("../../components/ui/Loading.tsx", () => ({
    Loading: () => <p>Chargement...</p>,
}));

function LocationDisplay() {
    const location = useLocation();

    return (
        <p data-testid="location">{location.pathname}</p>
    );
}

describe("AdminGuard", () => {
    it("affiche le chargement lorsque l'authentification est en cours", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: true,
        } as ReturnType<typeof useAuth>);

        render(
            <MemoryRouter>
                <AdminGuard />
            </MemoryRouter>,
        );
        expect(screen.getByText("Chargement...")).toBeInTheDocument();
    });

    it("redirige vers / si aucun utilisateur n'est connecté", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: null,
            loading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <MemoryRouter initialEntries={["/back-office"]}>
                <Routes>
                    <Route element={<AdminGuard />}>
                        <Route
                            path="/back-office"
                            element={<p>Back-office</p>}
                        />
                    </Route>
                    <Route
                        path="/"
                        element={<LocationDisplay />}
                    />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByTestId("location")).toHaveTextContent("/");
    });

    it("redirige un utilisateur non-admin vers /dojo", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {role: "user"},
            loading: false
        } as ReturnType<typeof useAuth>);

        render(
            <MemoryRouter initialEntries={["/back-office"]}>
                <Routes>
                    <Route element={<AdminGuard />}>
                        <Route
                            path="/back-office"
                            element={<p>Back-office</p>}
                        />
                    </Route>
                    <Route
                        path="/dojo"
                        element={<LocationDisplay />}
                    />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByTestId("location")).toHaveTextContent("/dojo");
    });

    it("autorise un administrateur", () => {
        vi.mocked(useAuth).mockReturnValue({
            user: {
                role: "admin",
            },
            loading: false,
        } as ReturnType<typeof useAuth>);

        render(
            <MemoryRouter initialEntries={["/back-office"]}>
                <Routes>
                    <Route element={<AdminGuard />}>
                        <Route
                            path="/back-office"
                            element={<p>Back-office</p>}
                        />
                    </Route>
                </Routes>
            </MemoryRouter>,
        );
        expect(screen.getByText("Back-office")).toBeInTheDocument();
    });
});
