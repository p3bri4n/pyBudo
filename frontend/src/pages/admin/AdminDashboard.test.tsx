import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdminDashboard from "./AdminDashboard";
import { getAdminStats } from "../../api/adminApi.ts";

vi.mock("../../api/adminApi.ts", () => ({
    getAdminStats: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                "admin.dashboard.dashboard": "Dashboard",
                "admin.dashboard.users": "Utilisateurs",
                "admin.dashboard.active-users": "Utilisateurs actifs",
                "admin.dashboard.katas": "Katas",
                "admin.dashboard.published-katas": "Katas publiés",
                "admin.dashboard.unknown-error": "Une erreur est survenue",
            };

            return translations[key] ?? key;
        },
    }),
}));

vi.mock("../../components/ui/Loading.tsx", () => ({
    Loading: () => <p>Chargement...</p>,
}));

const mockedGetAdminStats = vi.mocked(getAdminStats);

describe("AdminDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("affiche le chargement pendant la récupération des statistiques", () => {
        mockedGetAdminStats.mockReturnValue(new Promise(() => {}));

        render(<AdminDashboard />);

        expect(screen.getByText("Chargement...")).toBeInTheDocument();
    });

    it("affiche les statistiques récupérées", async () => {
        mockedGetAdminStats.mockResolvedValue({
            users: {
                total_users: 100,
                active_users: 72,
            },
            katas: {
                katas_number: 50,
                published_katas: 35,
            },
        });

        render(<AdminDashboard />);

        expect(await screen.findByText("Dashboard")).toBeInTheDocument();

        expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
        expect(screen.getByText("Utilisateurs actifs")).toBeInTheDocument();
        expect(screen.getByText("Katas")).toBeInTheDocument();
        expect(screen.getByText("Katas publiés")).toBeInTheDocument();

        expect(screen.getByText("100")).toBeInTheDocument();
        expect(screen.getByText("72")).toBeInTheDocument();
        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText("35")).toBeInTheDocument();
    });

    it("affiche l'erreur retournée par l'API", async () => {
        mockedGetAdminStats.mockRejectedValue(
            new Error("Erreur serveur"),
        );

        render(<AdminDashboard />);

        expect(
            await screen.findByText("Erreur serveur"),
        ).toBeInTheDocument();
    });

    it("affiche une erreur générique si l'erreur n'est pas une instance de Error", async () => {
        mockedGetAdminStats.mockRejectedValue("Erreur inconnue");

        render(<AdminDashboard />);

        expect(
            await screen.findByText("Une erreur est survenue"),
        ).toBeInTheDocument();
    });
});
