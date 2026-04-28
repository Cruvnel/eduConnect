import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { redefinirSenha } from "../../services/authService";

import "../../styles/global.css";
import "../../styles/public.css";
import "../../styles/login.css";

import logoSplash from "../../assets/images/logo_splash.png";

import AppHeader from "../../components/header/AppHeader";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function RedefinirSenhaPage() {
    const navigate = useNavigate();

    const [token, setToken] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");

        if (novaSenha !== confirmarSenha) {
            setErro("A confirmação da senha não confere.");
            return;
        }

        setCarregando(true);

        try {
            await redefinirSenha({ token, novaSenha });
            setSucesso("Senha redefinida com sucesso.");

            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (error) {
            setErro(error.message || "Erro ao redefinir senha.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <>
            <AppHeader
                logo={logoSplash}
                homePath="/"
                onBack={() => navigate("/")}
            />

            <main className="auth-page" role="main">
                <div className="auth-layout">
                    <section className="auth-content" style={{ width: "100%" }}>
                        <div className="auth-card">
                            <header className="auth-card__header">
                                <h1 className="auth-title">Redefinir senha</h1>
                                <p className="auth-subtitle">
                                    Informe o token recebido e defina sua nova senha.
                                </p>
                            </header>

                            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                                <Input
                                    id="token"
                                    label="Token"
                                    type="text"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Digite o token"
                                    required
                                />

                                <Input
                                    id="novaSenha"
                                    label="Nova senha"
                                    type="password"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    placeholder="Digite a nova senha"
                                    required
                                />

                                <Input
                                    id="confirmarSenha"
                                    label="Confirmar senha"
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    placeholder="Confirme a nova senha"
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    loading={carregando}
                                >
                                    Redefinir senha
                                </Button>

                                <button
                                    type="button"
                                    className="link-secondary"
                                    onClick={() => navigate("/")}
                                >
                                    Voltar para login
                                </button>
                            </form>

                            {erro && (
                                <p className="form-feedback public-feedback-error">
                                    {erro}
                                </p>
                            )}

                            {sucesso && (
                                <p className="form-feedback public-feedback-success">
                                    {sucesso}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}