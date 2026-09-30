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

export interface Kata {
    id: string
    kata_type: string
    rank: string
    discipline: string
    variant_of: string | null
    title: string
    statement: string
    signature: string
    solution_reference: string
    tests: KataTest[]
    concepts_used: string[]
    metadata: {
        model: string
        level_spec_version: string
        attempts: number
        status: string
        violations_detected: string[]
    }
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
