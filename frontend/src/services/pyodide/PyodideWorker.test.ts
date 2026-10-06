import { beforeEach, describe, expect, it, vi } from "vitest";
import type {PyodideInterface} from "pyodide";
import { getPyodide } from "./pyodideRuntime";
import { runWorkerTask } from "./PyodideWorker";
import type {FunctionKata} from "../../interfaces/interfaces.ts";

const mockDestroy = vi.fn();

const mockRunKataTests = Object.assign(
    vi.fn(),
    {
        destroy: mockDestroy,
    },
);
const createTestKata = (overrides: Partial<FunctionKata> = {}): FunctionKata => ({
    id: "test-kata",
    rank: "kyu_10",
    title: "Test kata",
    discipline: "core",
    statement: "Test statement",
    signature: "def test():",
    concepts_used: [],
    kata_type: "function",
    tests: [],
    ...overrides,
});
const mockRunPython = vi.fn();
const mockSetStdout = vi.fn();
const mockSetStderr = vi.fn();

vi.mock("./pyodideRuntime", () => ({
    getPyodide: vi.fn(),
}));

describe("runWorkerTask", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(getPyodide).mockResolvedValue({
            runPython: mockRunPython,
            setStdout: mockSetStdout,
            setStderr: mockSetStderr,
            globals: {
                get: vi.fn(() => mockRunKataTests),
            },
        } as unknown as PyodideInterface);
    });

    it("Returns an error for an invalid kata signature", async () => {
        const kata = createTestKata({
            signature: "invalid signature",
        });
        const report = await runWorkerTask(
            "print('hello')", kata
        );

        expect(report).toEqual({
            error: "Invalid kata signature: invalid signature",
            results: [],
            stdout: "",
        });

        expect(mockRunKataTests).not.toHaveBeenCalled();
    });

    it("Runs the kata tests and returns the report", async () => {
        const pythonReport = {
            error: null,
            results: [
                {
                    input: [3, 4],
                    expected: 14,
                    got: 14,
                    error: null,
                    passed: true,
                },
            ],
        };

        mockRunKataTests.mockReturnValue(
            JSON.stringify(pythonReport),
        );
        const kata = createTestKata({
            signature: "def perimetre(a, b):",
            tests: [
                {
                    input: [3, 4],
                    output: 14,
                },
            ],
        });

        const code = `
def perimetre(a, b):
    return 2 * (a + b)
`;

        const report = await runWorkerTask(code, kata);

        expect(report).toEqual({
            ...pythonReport,
            stdout: "",
        });

        expect(mockRunKataTests).toHaveBeenCalledWith(
            code,
            "perimetre",
            JSON.stringify(kata.tests),
        );

        expect(mockDestroy).toHaveBeenCalled();
    });

    it("Returns an error when Pyodide throws", async () => {
        mockRunKataTests.mockImplementation(() => {
            throw new Error("Python execution failed");
        });
        const kata = createTestKata({
            signature: "def test():",
            tests: [],
        });

        await expect(
            runWorkerTask("raise Exception('test')", kata),
        ).rejects.toThrow("Python execution failed");

        expect(mockDestroy).toHaveBeenCalled();
    });
});
