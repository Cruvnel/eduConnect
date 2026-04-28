import { apiFetch } from "./api";

export function listarProfessores() {
    return apiFetch("/Professores");
}

export function criarProfessor(payload) {
    return apiFetch("/Professores", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function obterProfessorPorId(id) {
    return apiFetch(`/Professores/${id}`);
}

export function atualizarProfessor(id, payload) {
    return apiFetch(`/Professores/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}