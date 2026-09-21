export interface ExecutionResult {
    stdout: string;
    stderr: string;
    result: unknown;
    error: string | null;
}
