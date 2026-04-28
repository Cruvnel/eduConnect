import { apiFetch } from "./api";

export function listarNotasTurma(turmaId) {
    return apiFetch(`/Notas/turma/${turmaId}`);
}

export function criarNota(payload) {
    return apiFetch("/Notas", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function atualizarNota(notaId, payload) {
    return apiFetch(`/Notas/${notaId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export function listarResumoNotasProfessor() {
    return apiFetch("/Notas/minhas-turmas");
}

export function listarHistoricoNota(notaId) {
    return apiFetch(`/Notas/${notaId}/historico`);
}