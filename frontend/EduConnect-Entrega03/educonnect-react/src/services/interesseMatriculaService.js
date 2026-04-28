import { apiFetch } from "./api";

const API_BASE_URL = "http://localhost:5267/api";

export async function criarInteresseMatricula(payload) {
    const response = await fetch(`${API_BASE_URL}/InteressesMatricula`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.mensagem || "Falha ao enviar interesse de matrícula.");
    }

    return data;
}

export function listarInteressesMatricula() {
    return apiFetch("/InteressesMatricula");
}

export function obterInteresseMatriculaPorId(id) {
    return apiFetch(`/InteressesMatricula/${id}`);
}

export function marcarInteresseComoFeito(id) {
    return apiFetch(`/InteressesMatricula/${id}/marcar-como-feito`, {
        method: "PATCH",
    });
}