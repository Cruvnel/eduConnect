import { apiFetch } from "./api";

export function listarDisciplinas() {
    return apiFetch("/Disciplinas");
}

export function criarDisciplina(payload) {
    return apiFetch("/Disciplinas", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}