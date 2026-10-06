import type {WorkerRequest, WorkerResponse} from "../../interfaces/interfaces.ts";
import { getPyodide } from "./pyodideRuntime";
import { runWorkerTask } from "./runWorkerTask";
import {executePython} from "./PyodideService.ts";

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
            const result = await executePython(event.data.code);

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
