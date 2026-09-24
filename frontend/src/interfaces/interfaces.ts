export type RegisterRequest = {
    username: string,
    email: string,
    password: string
}

export type RegisterResponse = {
    message: string;
    access_token: string;
    token_type: string;}

export type LoginRequest = {
    email: string,
    password: string
}

export type LoginResponse = {
    message: string;
    access_token: string;
    token_type: string;
};

export interface ExecutionResult {
    stdout: string;
    stderr: string;
    result: unknown;
    error: string | null;
}
