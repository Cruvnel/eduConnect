import { apiFetch } from "./api";

export function listarDisciplinasProfessor(professorId) {
    return apiFetch(`/professores/${professorId}/disciplinas`);
}

export function criarDisciplinaProfessor(professorId, payload) {
    return apiFetch(`/professores/${professorId}/disciplinas`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}