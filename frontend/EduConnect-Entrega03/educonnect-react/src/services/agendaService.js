import { apiFetch } from "./api";

export function listarAgendaPorTurma(turmaId) {
    return apiFetch(`/Agenda/turma/${turmaId}`);
}

export function obterEventoAgenda(id) {
    return apiFetch(`/Agenda/${id}`);
}

export function criarEventoAgenda(payload) {
    return apiFetch("/Agenda", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function excluirEventoAgenda(id) {
    return apiFetch(`/Agenda/${id}`, {
        method: "DELETE",
    });
}

export async function listarAgendaDeMultiplasTurmas(turmasIds) {
    const resultados = await Promise.all(
        turmasIds.map((turmaId) =>
            listarAgendaPorTurma(turmaId)
                .then((itens) => (Array.isArray(itens) ? itens : []))
                .catch(() => [])
        )
    );

    return resultados.flat();
}