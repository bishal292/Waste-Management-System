import { HOST } from "@/utils/constant";
import axios from "axios";

export const apiClient = axios.create({
    baseURL: HOST,
    withCredentials: true,
});