const API_BASE_URL = "http://localhost:5267/api";
import { apiFetch } from "./api";

export async function login({ registro, senha }) {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ registro, senha }),
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.mensagem || "Falha ao realizar login.");
    }

    return data;
}

export async function esqueciSenha({ identificador }) {
    const response = await fetch(`${API_BASE_URL}/Auth/esqueci-senha`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ identificador }),
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.mensagem || "Falha ao solicitar recuperação de senha.");
    }

    return data;
}

export async function redefinirSenha({ token, novaSenha }) {
    const response = await fetch(`${API_BASE_URL}/Auth/redefinir-senha`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, novaSenha }),
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.mensagem || "Falha ao redefinir senha.");
    }

    return data;
}

export async function obterUsuarioAtual() {
    return await apiFetch("/Auth/me", {
        method: "GET",
    });
}