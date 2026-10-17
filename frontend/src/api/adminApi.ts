import type {
    AdminCompletionStats,
    AdminKata,
    AdminStats,
    AdminUser, AdminUserCompletions,
    KataVariantCreate,
    AdminKataSummary,
    AdminKataCompletions,
} from "../interfaces/interfaces.ts";

import {apiClient, authHeaders} from "./apiClient.ts";
import {token} from "./authApi.ts";

export const getAdminStats = async (): Promise<AdminStats>=> {
    const response = await apiClient.get(
        "/admin/stats",
        authHeaders(token()))
    return response.data;
}

export const getAdminUsers = async (): Promise<AdminUser[]>=> {
    const response = await apiClient.get(
        "/admin/users",
        authHeaders(token()))
    return response.data;
}

export const getAdminUser = async (userId: string): Promise<AdminUser>=> {
    const response = await apiClient.get(
        `/admin/users/${userId}`,
        authHeaders(token()))
    return response.data;
}

export const getAdminKatas = async (): Promise<AdminKata[]> => {
    const response = await apiClient.get(
        "/admin/katas",
        authHeaders(token()))
    return response.data;
}

export const getAdminKata = async (kataId: string): Promise<AdminKata> => {
    const response = await apiClient.get(
        `/admin/katas/${kataId}`,
        authHeaders(token()))
    return response.data;
}

export const addAdminKataVariant = async (kataId: string, body: KataVariantCreate): Promise<AdminKata> => {
    const response = await apiClient.post(
        `/admin/katas/${kataId}/variants`,
        body,
        authHeaders(token()))
    return response.data;
}

export const archiveAdminKata = async (kataId: string): Promise<AdminKata> => {
    const response = await apiClient.patch(
        `/admin/katas/${kataId}/archive`,
        null,
        authHeaders(token()))
    return response.data;
}



export async function getAdminCompletionStats() {
    const response = await apiClient.get<AdminCompletionStats>(
        "/admin/completions/stats",
        authHeaders(token()),
    );
    return response.data;
}

export async function searchAdminUsers(search: string) {
    const response = await apiClient.get<AdminUser[]>("/admin/users", {
        ...authHeaders(token()),
        params: { search, limit: 20 },
    });
    return response.data;
}

export async function getAdminUserCompletions(userId: number) {
    const response = await apiClient.get<AdminUserCompletions>(
        `/admin/users/${userId}/completions`,
        authHeaders(token()),
    );
    return response.data;
}

export async function searchAdminKatas(search: string) {
    const response = await apiClient.get<AdminKataSummary[]>(
        "/admin/katas/search",
        {
            ...authHeaders(token()),
            params: { search: search.trim(), limit: 20 },
        },
    );

    return response.data;
}

export async function getAdminKataCompletions(kataId: string) {
    const response = await apiClient.get<AdminKataCompletions>(
        `/admin/katas/${encodeURIComponent(kataId)}/completions`,
        authHeaders(token()),
    );

    return response.data;
}
