import type {AdminKata, AdminStats, AdminUser, KataVariantCreate} from "../interfaces/interfaces.ts";
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

export const getAdminUser = async (userId: number): Promise<AdminUser>=> {
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
        authHeaders(token()))
    return response.data;
}
