import axios from 'axios';

import {API_URL} from "../constants/constants";

export const apiClient:any = axios.create({
    baseURL: API_URL,
});

apiClient.interceptors.request.use((config: any) => {
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
    (response: any) => response,
    (error:any) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
