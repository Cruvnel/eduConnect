import { apiFetch } from "./api";

export function listarMateriaisPorTurma(turmaId) {
    return apiFetch(`/Materiais/turma/${turmaId}`);
}

export function criarMaterial(payload) {
    return apiFetch("/Materiais", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function excluirMaterial(materialId) {
    return apiFetch(`/Materiais/${materialId}`, {
        method: "DELETE",
    });
}