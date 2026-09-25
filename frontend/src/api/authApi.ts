import {apiClient, authHeaders} from "./apiClient.ts";
import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse, User
} from "../interfaces/interfaces";

const token = () => localStorage.getItem('access_token');

export const register = async (registerRequest: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post(
        "/auth/register", registerRequest
    );
    return response.data;
}

export const login = async (loginRequest: LoginRequest): Promise<LoginResponse> => {
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
