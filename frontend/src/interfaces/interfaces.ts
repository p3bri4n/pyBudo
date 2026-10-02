import type { components } from "./tsschema"
import type {RANKS} from "../constants/constants.ts";

export type RegisterRequest = components["schemas"]["UserRegister"]
export type LoginRequest = components["schemas"]["UserLogin"]
export type TokenResponse = components["schemas"]["Token"]
export type User = components["schemas"]["UserPublic"];
export type Kata = components["schemas"]["KataPublic"]
export type UserProgression = components["schemas"]["ProgressionPublic"]
export type KataCompletion = components["schemas"]["KataCompletionPublic"]

export type Rank = typeof RANKS[number]

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
