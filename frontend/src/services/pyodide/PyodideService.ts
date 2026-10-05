import {EXECUTION_TIMEOUT_MS} from "../../constants/constants.ts";
import type {ExecutionResult, Kata, KataTestReport, WorkerRequest, WorkerResponse} from "../../interfaces/interfaces";

export function getKataFunctionName(signature: string): string | null {
    return signature.match(/^\s*def\s+(\w+)/)?.[1] ?? null;
}

export function isKataPassed(report: KataTestReport): boolean {
    return report.error === null
        && report.results.length > 0
        && report.results.every((result) => result.passed);
}

export function runWorker(
    request: WorkerRequest,
    timeout: number,
): Promise<WorkerResponse> {
    return new Promise((resolve) => {
        const worker = new Worker(
            new URL("./PyodideWorker.ts", import.meta.url),
            {type: "module"},
        );

        let finished = false;
        const cleanup = () => {
            window.clearTimeout(timeoutId);
            worker.terminate();
        };
        const timeoutId = window.setTimeout(() => {
            if (finished) {
                return;
            }
            finished = true;
            cleanup();
            resolve({
                type: "error",
                error: "TIMEOUT",
            });
        }, timeout);

        worker.onmessage = (event: MessageEvent) => {
            if (finished) {
                return;
            }
            finished = true;
            cleanup();
            resolve(event.data);
        };

        worker.onerror = (event) => {
            if (finished) {
                return;
            }
            finished = true;
            cleanup();

            resolve({
                type: "error",
                error: event.message || "Worker error",
            });
        };
        worker.postMessage(request);
    });
}

export async function executePython(code: string): Promise<ExecutionResult> {
    const response = await runWorker(
        {
            type: "execute",
            code,
        },
        EXECUTION_TIMEOUT_MS,
    );

    if (
        typeof response === "object"
        && response !== null
        && "type" in response
        && response.type === "execute-result"
    ) {
        return response.result as ExecutionResult;
    }

    const error =
        typeof response === "object"
        && response !== null
        && "error" in response
            ? String(response.error)
            : "Unknown error";

    return {
        result: undefined,
        stdout: "",
        stderr: "",
        error,
    };
}

export async function runKataTests(
    code: string,
    kata: Kata,
): Promise<KataTestReport> {
    const response = await runWorker(
        {
            type: "kata",
            code,
            kata,
        },
        EXECUTION_TIMEOUT_MS,
    );

    if (
        typeof response === "object"
        && response !== null
        && "type" in response
        && response.type === "kata-result"
    ) {
        return response.report as KataTestReport;
    }

    const error =
        typeof response === "object"
        && response !== null
        && "error" in response
            ? String(response.error)
            : "Unknown error";

    return {
        error,
        results: [],
        stdout: "",
    };
}
