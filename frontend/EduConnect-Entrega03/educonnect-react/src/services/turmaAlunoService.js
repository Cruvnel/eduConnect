import { apiFetch } from "./api";

export function listarAlunosDaTurma(turmaId) {
    return apiFetch(`/turmas/${turmaId}/alunos`);
}

export function atribuirAlunoNaTurma(turmaId, payload) {
    return apiFetch(`/turmas/${turmaId}/alunos`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function removerAlunoDaTurma(turmaId, alunoId) {
    return apiFetch(`/turmas/${turmaId}/alunos/${alunoId}`, {
        method: "DELETE",
    });
}