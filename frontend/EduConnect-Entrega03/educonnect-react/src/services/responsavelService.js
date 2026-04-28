import { apiFetch } from "./api";

// admin
export function listarResponsaveis() {
    return apiFetch("/Responsaveis");
}

export function obterResponsavelPorId(id) {
    return apiFetch(`/Responsaveis/${id}`);
}

export function atualizarResponsavel(id, payload) {
    return apiFetch(`/Responsaveis/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

// responsavel
export function listarMeusAlunosResponsavel() {
    return apiFetch("/Responsaveis/me/alunos");
}

export function listarAgendaResponsavel(alunoId) {
    return apiFetch(`/Responsaveis/me/alunos/${alunoId}/agenda`);
}

export function obterBoletimResponsavel(alunoId) {
    return apiFetch(`/Responsaveis/me/alunos/${alunoId}/boletim`);
}

export async function baixarBoletimResponsavelPdf(alunoId) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `http://localhost:5267/api/Responsaveis/me/alunos/${alunoId}/boletim/pdf`,
        {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    );

    if (!response.ok) {
        throw new Error("Erro ao baixar boletim em PDF.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
}

export function listarFrequenciaResponsavel(alunoId) {
    return apiFetch(`/Responsaveis/me/alunos/${alunoId}/frequencia`);
}

export function listarOcorrenciasResponsavel(alunoId) {
    return apiFetch(`/Responsaveis/me/alunos/${alunoId}/ocorrencias`);
}

export function listarFinanceiroResponsavel() {
    return apiFetch("/Responsaveis/me/financeiro");
}

export function listarPublicacoesResponsavel() {
    return apiFetch("/Responsaveis/me/publicacoes");
}