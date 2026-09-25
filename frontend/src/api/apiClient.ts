import axios, {type AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig} from 'axios';

import {API_URL} from "../constants/constants";

export const apiClient:AxiosInstance = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
});

export const authHeaders = (token: string | null) => ({
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error:AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
