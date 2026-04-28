import { apiFetch } from "./api";

export function listarOcorrenciasPorTurma(turmaId) {
    return apiFetch(`/Ocorrencias/turma/${turmaId}`);
}

export function listarOcorrenciasPorAluno(alunoId) {
    return apiFetch(`/Ocorrencias/aluno/${alunoId}`);
}

export function obterOcorrenciaPorId(id) {
    return apiFetch(`/Ocorrencias/${id}`);
}

export function criarOcorrencia(payload) {
    return apiFetch("/Ocorrencias", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function excluirOcorrencia(id) {
    return apiFetch(`/Ocorrencias/${id}`, {
        method: "DELETE",
    });
}