const API_BASE_URL = "http://localhost:5267/api";

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

export async function buscarRelatorio(tipo) {
    const mapa = {
        situacaoAlunos: "/Relatorios/situacao-alunos",
        aprovacoesPorTurma: "/Relatorios/aprovacoes-por-turma",
        mediaPorDisciplina: "/Relatorios/media-por-disciplina",
        frequenciaMedia: "/Relatorios/frequencia-media",
    };

    const endpoint = mapa[tipo];

    if (!endpoint) {
        throw new Error("Tipo de relatório inválido.");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.mensagem || "Erro ao buscar relatório.");
    }

    return data;
}

export async function baixarRelatorioPdf(tipo) {
    const mapa = {
        situacaoAlunos: "/Relatorios/situacao-alunos/pdf",
        aprovacoesPorTurma: "/Relatorios/aprovacoes-por-turma/pdf",
        mediaPorDisciplina: "/Relatorios/media-por-disciplina/pdf",
        frequenciaMedia: "/Relatorios/frequencia-media/pdf",
    };

    const endpoint = mapa[tipo];

    if (!endpoint) {
        throw new Error("Tipo de relatório inválido.");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            ...getAuthHeaders(),
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao baixar PDF.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    window.open(url, "_blank");
}