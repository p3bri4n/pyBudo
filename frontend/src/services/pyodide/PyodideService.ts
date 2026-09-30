import { loadPyodide, type PyodideInterface } from "pyodide";
import type {ExecutionResult, Kata, KataTestReport} from "../../interfaces/interfaces.ts";
import kataRunnerSource from "./kataRunner.py?raw";

let pyodide: PyodideInterface | null = null;

export async function getPyodide() {
    if (!pyodide) {
        pyodide = await loadPyodide({ indexURL: "/pyodide/" });
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

let kataRunnerLoaded = false;

export function getKataFunctionName(signature: string): string | null {
    return signature.match(/^\s*def\s+(\w+)/)?.[1] ?? null;
}

export async function runKataTests(code: string, kata: Kata): Promise<KataTestReport> {
    const runtime = await getPyodide();
    const functionName = getKataFunctionName(kata.signature);

    if (!functionName) {
        return {error: `Invalid kata signature: ${kata.signature}`, results: []};
    }

    if (!kataRunnerLoaded) {
        runtime.runPython(kataRunnerSource);
        kataRunnerLoaded = true;
    }

    // Les print() de l'élève sont capturés pour être affichés sous l'éditeur
    let stdout = "";
    runtime.setStdout({batched: (text: string): void => {stdout += text + "\n"}});
    runtime.setStderr({batched: (text: string): void => {stdout += text + "\n"}});

    const runKataTestsPy = runtime.globals.get("_run_kata_tests");
    try {
        const report: string = runKataTestsPy(code, functionName, JSON.stringify(kata.tests));
        return {...JSON.parse(report), stdout} as KataTestReport;
    } finally {
        runKataTestsPy.destroy();
    }
}

export function isKataPassed(report: KataTestReport): boolean {
    return report.error === null
        && report.results.length > 0
        && report.results.every((result) => result.passed);
}
