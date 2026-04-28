import { apiFetch } from "./api";

// admin
export function criarAluno(payload) {
    return apiFetch("/Alunos", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function listarAlunos() {
    return apiFetch("/Alunos");
}

export function obterAlunoPorId(id) {
    return apiFetch(`/Alunos/${id}`);
}

export function atualizarAluno(id, payload) {
    return apiFetch(`/Alunos/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

// aluno
export function obterMeuPerfilAluno() {
    return apiFetch("/Alunos/me");
}

export function listarPublicacoesAluno() {
    return apiFetch("/Alunos/me/publicacoes");
}

export function listarAgendaAluno() {
    return apiFetch("/Alunos/me/agenda");
}

export function listarMateriaisAluno() {
    return apiFetch("/Alunos/me/materiais");
}

export function listarFrequenciaAluno() {
    return apiFetch("/Alunos/me/frequencia");
}

export function listarOcorrenciasAluno() {
    return apiFetch("/Alunos/me/ocorrencias");
}

export function obterBoletimAluno() {
    return apiFetch("/Alunos/me/boletim");
}

export async function baixarBoletimAlunoPdf() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5267/api/Alunos/me/boletim/pdf", {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao baixar boletim em PDF.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
}
