import { apiFetch } from "./api";

export function listarTurmas() {
    return apiFetch("/Turmas");
}

export function obterTurmaPorId(id) {
    return apiFetch(`/Turmas/${id}`);
}

export function criarTurma(payload) {
    return apiFetch("/Turmas", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function atualizarTurma(id, payload) {
    return apiFetch(`/Turmas/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function excluirTurma(id) {
    return apiFetch(`/Turmas/${id}`, {
        method: "DELETE",
    });
}