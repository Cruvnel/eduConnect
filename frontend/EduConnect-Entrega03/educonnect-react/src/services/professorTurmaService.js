import { apiFetch } from "./api";

const API_BASE_URL = "http://localhost:5267/api";

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export function listarMinhasTurmasProfessor() {
    return apiFetch("/Professores/minhas-turmas");
}

export function obterMinhaTurmaDetalheProfessor(turmaId) {
    return apiFetch(`/Professores/minhas-turmas/${turmaId}`);
}

export async function baixarRelatorioNotasMinhasTurmasPdf() {
    const response = await fetch(`${API_BASE_URL}/Notas/minhas-turmas/pdf`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao baixar relatório em PDF.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
}