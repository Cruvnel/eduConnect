import { apiFetch } from "./api";

export function listarNiveisEnsino() {
    return apiFetch("/NiveisEnsino");
}