import type { components } from "./tsschema"

export type RegisterRequest = components["schemas"]["UserRegister"]
export type LoginRequest = components["schemas"]["UserLogin"]
export type TokenResponse = components["schemas"]["Token"]
export type User = components["schemas"]["UserPublic"];
export type FunctionKata = components["schemas"]["FunctionKataPublic"]
export type ClassKata = components["schemas"]["ClassKataPublic"]
export type Kata = FunctionKata | ClassKata
export type UserProgression = components["schemas"]["ProgressionPublic"]
export type KataCompletion = components["schemas"]["KataCompletionPublic"]

export type Rank = Kata["rank"]

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => void;
}

export interface ExecutionResult {
    stdout: string
    stderr: string
    result: unknown
    error: string | null
}

export interface KataTestResult {
    input: unknown[]
    expected: unknown
    got: unknown
    error: string | null
    passed: boolean
}

export interface KataTestReport {
    error: string | null
    results: KataTestResult[]
    stdout?: string
}

export type WorkerRequest = | { type: "execute"; code: string; } | { type: "kata"; code: string; kata: Kata; };
export type WorkerResponse =
    | {
    type: "ready";
}
    | {
    type: "execute-result";
    result: ExecutionResult;
}
    | {
    type: "kata-result";
    report: KataTestReport;
}
    | {
    type: "error";
    error: string;
};

export type WorkerResult =
    Exclude<WorkerResponse, { type: "ready" }>;

export type WorkerError = Extract<
    WorkerResponse,
    { type: "error" }
>;
