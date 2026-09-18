import { loadPyodide, type PyodideInterface } from "pyodide";
import type {ExecutionResult} from "../../interfaces/interfaces.ts";

let pyodide: PyodideInterface | null = null;

export async function getPyodide() {
    if (!pyodide) {
        pyodide = await loadPyodide();
    }

    return pyodide;
}


export async function executePython(code: string): Promise<ExecutionResult> {
    const runtime = await getPyodide();

    let stdout = "";
    let stderr = "";

    runtime.setStdout({
        batched: (text: string): void => {stdout += text},
    });
    runtime.setStderr({
        batched: (text: string): void => {stderr += text;},
    });

    try {
        const result = await runtime.runPythonAsync(code);
        return {
            result,
            stdout,
            stderr,
            error: null,
        };
    } catch (error) {
        return {
            result: undefined,
            stdout,
            stderr,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
