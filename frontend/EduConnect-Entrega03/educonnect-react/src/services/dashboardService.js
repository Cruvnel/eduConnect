import { apiFetch } from "./api";

export async function obterDashboardAdmin() {
    return await apiFetch("/dashboard/admin");
}