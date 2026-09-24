import {apiClient} from "./apiClient.tsx";
import type {LoginRequest, LoginResponse, RegisterRequest, RegisterResponse} from "../interfaces/interfaces";

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
