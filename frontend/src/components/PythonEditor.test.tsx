import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { PythonRunner } from "./PythonEditor";

vi.mock("../services/pyodide/PyodideService", () => ({
    executePython: vi.fn()
}))

describe("PythonRunner", () => {
    it("Renders the initial code", () => {
        const { container } = render(<PythonRunner/>);
        expect(container.querySelector(".cm-content")).toHaveTextContent("print('Hello pyBudo!')");
    })

    it("Highlights Python syntax", () => {
        const { container } = render(<PythonRunner/>);
        expect(container.querySelectorAll(".cm-line span").length).toBeGreaterThan(0);
    })
})
