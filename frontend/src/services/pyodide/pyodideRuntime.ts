import { loadPyodide, type PyodideInterface } from "pyodide";

let pyodide: PyodideInterface | null = null;

export async function getPyodide(): Promise<PyodideInterface> {
    if (!pyodide) {
        pyodide = await loadPyodide({ indexURL: "/pyodide/" });
    }
    return pyodide;
}
