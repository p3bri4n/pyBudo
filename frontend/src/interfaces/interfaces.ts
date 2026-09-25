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
