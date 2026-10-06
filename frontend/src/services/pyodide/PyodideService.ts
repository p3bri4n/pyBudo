import { EXECUTION_TIMEOUT_MS } from "../../constants/constants.ts";
import type {
    ExecutionResult,
    Kata,
    KataTestReport,
    WorkerRequest,
    WorkerResponse,
    WorkerResult
} from "../../interfaces/interfaces.ts";

export function getKataFunctionName(
    signature: string,
): string | null {
    return signature.match(/^\s*def\s+(\w+)/)?.[1] ?? null;
}

export function isKataPassed(
    report: KataTestReport,
): boolean {
    return report.error === null
        && report.results.length > 0
        && report.results.every((result) => result.passed);
}

let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let requestInProgress = false;

function createWorker(): Worker {
    return new Worker(
        new URL("./PyodideWorker.ts", import.meta.url),
        { type: "module" },
    );
}

function getWorker(): Worker {
    if (worker) {
        return worker;
    }

    worker = createWorker();

    readyPromise = new Promise<void>((resolve, reject) => {
        const currentWorker = worker;

        if (!currentWorker) {
            reject(new Error("Worker was not created"));
            return;
        }

        const handleMessage = (
            event: MessageEvent<WorkerResponse>,
        ): void => {
            if (event.data.type === "ready") {
                currentWorker.removeEventListener(
                    "message",
                    handleMessage,
                );

                currentWorker.removeEventListener(
                    "error",
                    handleError,
                );

                resolve();
                return;
            }

            if (event.data.type === "error") {
                currentWorker.removeEventListener(
                    "message",
                    handleMessage,
                );

                currentWorker.removeEventListener(
                    "error",
                    handleError,
                );

                reject(new Error(event.data.error));
            }
        };

        const handleError = (): void => {
            currentWorker.removeEventListener(
                "message",
                handleMessage,
            );

            currentWorker.removeEventListener(
                "error",
                handleError,
            );

            reject(new Error("Worker initialization failed"));
        };

        currentWorker.addEventListener(
            "message",
            handleMessage,
        );

        currentWorker.addEventListener(
            "error",
            handleError,
        );
    });

    return worker;
}

function resetWorker(): void {
    worker?.terminate();

    worker = null;
    readyPromise = null;
}


export function runWorker(
    request: WorkerRequest,
): Promise<WorkerResult> {
    if (requestInProgress) {
        return Promise.resolve({
            type: "error",
            error: "EXECUTION_IN_PROGRESS",
        });
    }
    return new Promise((resolve) => {
        const currentWorker = getWorker();

        const handleMessage = (
            event: MessageEvent<WorkerResponse>,
        ): void => {
            if (event.data.type === "ready") {
                return;
            }

            window.clearTimeout(timeoutId);

            currentWorker.removeEventListener(
                "message",
                handleMessage,
            );

            currentWorker.removeEventListener(
                "error",
                handleError,
            );

            requestInProgress = false;

            resolve(event.data);
        };

        const handleError = (event: ErrorEvent): void => {
            window.clearTimeout(timeoutId);

            currentWorker.removeEventListener(
                "message",
                handleMessage,
            );

            currentWorker.removeEventListener(
                "error",
                handleError,
            );

            requestInProgress = false;

            resolve({
                type: "error",
                error: event.message || "Worker error",
            });
        };

        let timeoutId: number | undefined;

        void readyPromise
            ?.then(() => {
                if (worker !== currentWorker) {
                    return;
                }

                requestInProgress = true;

                currentWorker.addEventListener(
                    "message",
                    handleMessage,
                );

                currentWorker.addEventListener(
                    "error",
                    handleError,
                );

                // Le timeout commence ICI.
                timeoutId = window.setTimeout(() => {
                    currentWorker.removeEventListener(
                        "message",
                        handleMessage,
                    );

                    currentWorker.removeEventListener(
                        "error",
                        handleError,
                    );

                    requestInProgress = false;

                    resetWorker();

                    resolve({
                        type: "error",
                        error: "TIMEOUT",
                    });
                }, EXECUTION_TIMEOUT_MS);

                currentWorker.postMessage(request);
            })
            .catch((error: unknown) => {
                requestInProgress = false;

                resolve({
                    type: "error",
                    error: error instanceof Error
                        ? error.message
                        : String(error),
                });
            });
    });
}

export async function executePython(
    code: string,
): Promise<ExecutionResult> {
    const response = await runWorker({
        type: "execute",
        code,
    });

    if (response.type === "execute-result") {
        return response.result;
    }

    if (response.type === "error") {
        return {
            result: undefined,
            stdout: "",
            stderr: "",
            error: response.error,
        };
    }

    throw new Error(
        `Unexpected worker response: ${response.type}`,
    );
}

export async function runKataTests(
    code: string,
    kata: Kata,
): Promise<KataTestReport> {
    const response = await runWorker({
        type: "kata",
        code,
        kata,
    });

    if (response.type === "kata-result") {
        return response.report;
    }

    if (response.type === "error") {
        return {
            error: response.error,
            results: [],
            stdout: "",
        };
    }

    throw new Error(
        `Unexpected worker response: ${response.type}`,
    );
}
