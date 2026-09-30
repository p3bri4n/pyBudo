import type {RANKS} from "../constants/constants.ts";

export type RegisterRequest = {
    username: string
    email: string
    password: string
}

export type RegisterResponse = {
    message: string
    access_token: string
    token_type: string
}

export type LoginRequest = {
    email: string
    password: string
}

export type LoginResponse = {
    message: string
    access_token: string
    token_type: string
};

export interface User {
    username: string;
    email: string;
}

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

export interface KataTest {
    input: unknown[]
    output: unknown
}

// Correspond à KataPublic renvoyé par GET /katas
export interface Kata {
    id: string
    rank: Rank
    discipline: string
    variant_of: string | null
    title: string
    statement: string
    signature: string
    tests: KataTest[]
    concepts_used: string[]
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

export type Rank = typeof RANKS[number]

export interface DisciplineProgression {
    discipline: string
    highest_dan_practiced: Rank
}

export interface UserProgression {
    core_dan: Rank | null
    disciplines: DisciplineProgression[]
}

export interface KataCompletion {
    kata_id: string
    user_id: number
    completed_at: string
    verified: boolean
}
