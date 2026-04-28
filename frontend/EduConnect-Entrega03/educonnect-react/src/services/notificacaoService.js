import { apiFetch } from "./api";

export async function listarMinhasNotificacoes() {
    return await apiFetch("/Notificacoes/me");
}

export async function marcarNotificacaoComoLida(notificacaoId) {
    return await apiFetch(`/Notificacoes/${notificacaoId}/marcar-como-lida`, {
        method: "PATCH",
    });
}

export async function limparMinhasNotificacoes() {
    return await apiFetch("/Notificacoes/limpar", {
        method: "PATCH",
    });
}