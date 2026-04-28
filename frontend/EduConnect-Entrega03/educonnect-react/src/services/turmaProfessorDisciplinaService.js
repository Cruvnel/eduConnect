import { apiFetch } from "./api";

export function listarProfessoresDaTurma(turmaId) {
    return apiFetch(`/turmas/${turmaId}/professores`);
}

export function atribuirProfessorNaTurma(turmaId, payload) {
    return apiFetch(`/turmas/${turmaId}/professores`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function removerProfessorDaTurma(turmaId, professorId) {
    return apiFetch(`/turmas/${turmaId}/professores/${professorId}`, {
        method: "DELETE",
    });
}