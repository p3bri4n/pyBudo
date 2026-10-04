import {apiClient, authHeaders} from "./apiClient.ts";
import {token} from "./authApi.ts";
import type {KataCompletion, UserProgression} from "../interfaces/interfaces";

export const getProgression = async (): Promise<UserProgression> => {
    const response = await apiClient.get(
        "/progression",
        authHeaders(token()))
    return response.data;
}

export const addCompletion = async (kataId: string, code: string): Promise<KataCompletion> => {
    const response = await apiClient.post(
        "/completions",
        {kata_id: kataId, code: code},
        authHeaders(token()))
    return response.data;
}

export const getCompletions = async (): Promise<KataCompletion[]> => {
    const response = await apiClient.get(
        "/completions",
        authHeaders(token()))
    return response.data;
}
