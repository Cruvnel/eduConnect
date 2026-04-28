import { apiFetch } from "./api";

export function listarFrequenciasTurma(turmaId, dataAula) {
    const params = new URLSearchParams();

    if (dataAula) {
        params.append("dataAula", dataAula);
    }

    return apiFetch(`/Frequencias/${turmaId}?${params.toString()}`);
}

export function registrarFrequenciaTurma(turmaId, payload) {
    return apiFetch(`/Frequencias/${turmaId}`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}