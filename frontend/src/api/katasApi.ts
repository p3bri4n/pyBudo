import {apiClient} from "./apiClient.ts";
import type {Kata} from "../interfaces/interfaces";

export const getKatas = async (): Promise<Kata[]> => {
    const response = await apiClient.get("/katas");
    return response.data;
}
