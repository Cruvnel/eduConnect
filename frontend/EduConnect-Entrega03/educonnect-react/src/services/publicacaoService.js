import { apiFetch } from "./api";

export function listarPublicacoes() {
    return apiFetch("/Publicacoes");
}

export function criarPublicacao(payload) {
    return apiFetch("/Publicacoes", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function excluirPublicacao(publicacaoId) {
    return apiFetch(`/Publicacoes/${publicacaoId}`, {
        method: "DELETE",
    });
}

export function atualizarPublicacao(id, payload) {
    return apiFetch(`/Publicacoes/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}