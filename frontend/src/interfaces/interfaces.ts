export type RegisterRequest = {
    username: string,
    email: string,
    password: string
}

export type RegisterResponse = {
    token: string;
}

export type LoginRequest = {
    email: string,
    password: string
}

export type LoginResponse = {
    token: string;
};

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    result: unknown;
    error: string | null;
}
