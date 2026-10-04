import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PythonRunner } from "./PythonEditor";
import { executePython, runKataTests } from "../services/pyodide/PyodideService";
import type { Kata } from "../interfaces/interfaces.ts";

vi.mock("../services/pyodide/PyodideService", async (importOriginal) => ({
    ...await importOriginal<typeof import("../services/pyodide/PyodideService")>(),
    executePython: vi.fn(),
    runKataTests: vi.fn(),
}))

const kata = {
    id: "kyu_10_perimetre",
    signature: "def calculer_perimetre_rectangle(largeur: float, hauteur: float) -> float:",
    tests: [{ input: [3, 4], output: 14 }, { input: [0, 0], output: 0 }],
} as Kata;

describe("PythonRunner", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it("Renders the initial code", () => {
        const { container } = render(<PythonRunner/>);
        expect(container.querySelector(".cm-content")).toHaveTextContent("print('Hello pyBudo!')");
    })

    it("Renders the provided initial code", () => {
        const { container } = render(<PythonRunner initialCode={"def f(x):\n    pass"}/>);
        expect(container.querySelector(".cm-content")).toHaveTextContent("def f(x):");
    })

    it("Highlights Python syntax", () => {
        const { container } = render(<PythonRunner/>);
        expect(container.querySelectorAll(".cm-line span").length).toBeGreaterThan(0);
    })

    it("Has a single execute button", () => {
        render(<PythonRunner kata={kata}/>);
        expect(screen.getAllByRole("button")).toHaveLength(1);
        expect(screen.getByText("python-runner.execute")).toBeInTheDocument();
    })

    it("Runs the code without tests when no kata is selected", async () => {
        vi.mocked(executePython).mockResolvedValue({ stdout: "Hello", stderr: "", result: undefined, error: null });
        render(<PythonRunner/>);

        fireEvent.click(screen.getByText("python-runner.execute"));

        expect(await screen.findByText("Hello")).toBeInTheDocument();
        expect(runKataTests).not.toHaveBeenCalled();
    })

    it("Calls onKataPassed when every test passes", async () => {
        vi.mocked(runKataTests).mockResolvedValue({
            error: null,
            results: [
                { input: [3, 4], expected: 14, got: 14, error: null, passed: true },
                { input: [0, 0], expected: 0, got: 0, error: null, passed: true },
            ],
        });
        const onKataPassed = vi.fn();
        render(<PythonRunner kata={kata} onKataPassed={onKataPassed}/>);

        fireEvent.click(screen.getByText("python-runner.execute"));

        expect(await screen.findByText("python-runner.kata-passed")).toBeInTheDocument();
        expect(onKataPassed).toHaveBeenCalledWith(kata, "print('Hello pyBudo!')");
    })

    it("Shows failed tests without calling onKataPassed", async () => {
        vi.mocked(runKataTests).mockResolvedValue({
            error: null,
            results: [
                { input: [3, 4], expected: 14, got: 7, error: null, passed: false },
                { input: [0, 0], expected: 0, got: 0, error: null, passed: true },
            ],
        });
        const onKataPassed = vi.fn();
        render(<PythonRunner kata={kata} onKataPassed={onKataPassed}/>);

        fireEvent.click(screen.getByText("python-runner.execute"));

        expect(await screen.findByText("python-runner.tests-summary")).toBeInTheDocument();
        expect(screen.getByText("7")).toBeInTheDocument();
        expect(onKataPassed).not.toHaveBeenCalled();
    })
})
