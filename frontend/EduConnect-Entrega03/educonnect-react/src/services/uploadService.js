const API_BASE_URL = "http://localhost:5267/api";

async function uploadArquivo(endpoint, file, mensagemErroPadrao) {
    const formData = new FormData();
    formData.append("arquivo", file);

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(data?.mensagem || mensagemErroPadrao);
    }

    return data;
}

export function uploadDocumento(file) {
    return uploadArquivo(
        "/Uploads/documentos",
        file,
        "Falha ao enviar documento."
    );
}

export function uploadFoto(file) {
    return uploadArquivo(
        "/Uploads/fotos",
        file,
        "Falha ao enviar foto."
    );
}

export function uploadMaterial(file) {
    return uploadArquivo(
        "/Uploads/materiais",
        file,
        "Falha ao enviar material."
    );
}