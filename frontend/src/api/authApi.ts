import {apiClient, authHeaders} from "./apiClient.ts";
import type {
    LoginRequest,
    RegisterRequest,
    TokenResponse, User
} from "../interfaces/interfaces";

export const token = () => localStorage.getItem('access_token');

export const register = async (registerRequest: RegisterRequest): Promise<TokenResponse> => {
    const response = await apiClient.post(
        "/auth/register", registerRequest
    );
    return response.data;
}

export const login = async (loginRequest: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post(
        "/auth/login", loginRequest
    );
    return response.data;
}

export const getMyInfos = async (): Promise<User>=> {
    const response = await apiClient.get(
        "/auth/me",
        authHeaders(token()))
    return response.data;
}
