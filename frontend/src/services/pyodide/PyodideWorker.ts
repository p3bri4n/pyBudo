import type {ExecutionResult, Kata, WorkerRequest} from "../../interfaces/interfaces";
import type { KataTestReport } from "../../interfaces/interfaces";
import { getPyodide } from "./pyodideRuntime";
import { getKataFunctionName } from "./PyodideService";
import kataRunnerSource from "./kataRunner.py?raw";

let kataRunnerLoaded = false;

export async function executePython(code: string,): Promise<ExecutionResult> {
    const runtime = await getPyodide();

    let stdout = "";
    let stderr = "";

    runtime.setStdout({batched: (text: string): void => {stdout += text;}});
    runtime.setStderr({batched: (text: string): void => {stderr += text;}});

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
            error: error instanceof Error
                ? error.message
                : String(error),
        };
    }
}

export async function runWorkerTask(
    code: string,
    kata: Kata,
): Promise<KataTestReport> {
    const runtime = await getPyodide();

    const functionName = getKataFunctionName(kata.signature);

    if (!functionName) {
        return {
            error: `Invalid kata signature: ${kata.signature}`,
            results: [],
            stdout: "",
        };
    }

    if (!kataRunnerLoaded) {
        runtime.runPython(kataRunnerSource);
        kataRunnerLoaded = true;
    }

    let stdout = "";

    runtime.setStdout({
        batched: (text: string): void => {
            stdout += text + "\n";
        },
    });

    runtime.setStderr({
        batched: (text: string): void => {
            stdout += text + "\n";
        },
    });

    const runKataTestsPy = runtime.globals.get("_run_kata_tests");

    try {
        const report: string = runKataTestsPy(
            code,
            functionName,
            JSON.stringify(kata.tests),
        );

        return {
            ...JSON.parse(report),
            stdout,
        };
    } finally {
        runKataTestsPy.destroy();
    }
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
    try {
        if (event.data.type === "execute") {
            const result = await executePython(event.data.code);

            self.postMessage({
                type: "execute-result",
                result,
            });

            return;
        }

        if (event.data.type === "kata") {
            const report = await runWorkerTask(
                event.data.code,
                event.data.kata,
            );

            self.postMessage({
                type: "kata-result",
                report,
            });
        }
    } catch (error) {
        self.postMessage({
            type: "error",
            error: error instanceof Error
                ? error.message
                : String(error),
        });
    }
};
