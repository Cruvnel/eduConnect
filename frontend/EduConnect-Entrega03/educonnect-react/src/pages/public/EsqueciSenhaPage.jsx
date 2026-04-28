import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { esqueciSenha } from "../../services/authService";

import "../../styles/global.css";
import "../../styles/public.css";
import "../../styles/login.css";

import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function EsqueciSenhaPage() {
    const navigate = useNavigate();

    const [identificador, setIdentificador] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setErro("");
        setSucesso("");
        setCarregando(true);

        try {
            await esqueciSenha({ identificador });
            setSucesso("Solicitação enviada. Verifique seu e-mail.");
            setIdentificador("");

            setTimeout(() => {
                navigate("/redefinir-senha");
            }, 1200);
        } catch (error) {
            setErro(error.message || "Erro ao solicitar redefinição.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <Modal
            title="Esqueci minha senha"
            description="Por favor, informe seu registro. Um e-mail de redefinição será enviado."
            onClose={() => navigate(-1)}
        >
            <form onSubmit={handleSubmit} className="auth-form">
                <Input
                    id="identificador"
                    label="Registro"
                    type="text"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="Digite seu registro"
                    required
                />

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={carregando}
                >
                    Enviar
                </Button>

                {erro && <div className="public-feedback-error">{erro}</div>}
                {sucesso && <div className="public-feedback-success">{sucesso}</div>}
            </form>
        </Modal>
    );
}