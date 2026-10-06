import type {ExecutionResult, WorkerRequest, WorkerResponse} from "../../interfaces/interfaces.ts";
import { getPyodide } from "./pyodideRuntime";
import { runWorkerTask } from "./runWorkerTask";

async function executePythonInWorker(
    code: string,
): Promise<ExecutionResult> {
    const runtime = await getPyodide();

    let stdout = "";
    let stderr = "";

    runtime.setStdout({batched: (text: string): void => {stdout += text  + "\n"}});
    runtime.setStderr({batched: (text: string): void => {stderr += text  + "\n"}});

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

async function initializeWorker(): Promise<void> {
    try {
        await getPyodide();

        self.postMessage({
            type: "ready",
        } satisfies WorkerResponse);
    } catch (error) {
        self.postMessage({
            type: "error",
            error: error instanceof Error
                ? error.message
                : String(error),
        } satisfies WorkerResponse);
    }
}

self.onmessage = async (
    event: MessageEvent<WorkerRequest>,
): Promise<void> => {
    try {
        if (event.data.type === "execute") {
            const result = await executePythonInWorker(
                event.data.code,
            );
            self.postMessage({
                type: "execute-result",
                result,
            } satisfies WorkerResponse);

            return;
        }

        const report = await runWorkerTask(
            event.data.code,
            event.data.kata,
        );

        self.postMessage({
            type: "kata-result",
            report,
        } satisfies WorkerResponse);
    } catch (error) {
        self.postMessage({
            type: "error",
            error: error instanceof Error
                ? error.message
                : String(error),
        } satisfies WorkerResponse);
    }
};

void initializeWorker();
