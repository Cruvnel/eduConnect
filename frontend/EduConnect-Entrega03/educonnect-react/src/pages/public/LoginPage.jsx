import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login } from "../../services/authService";

import "../../styles/global.css";
import "../../styles/public.css";
import "../../styles/login.css";

import logoSplash from "../../assets/images/logo_splash.png";
import roboLogin from "../../assets/images/robo_login.png";

// componentes
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import AppHeader from "../../components/header/AppHeader";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [registro, setRegistro] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const data = await login({ registro, senha });

            localStorage.setItem("token", data.token);
            localStorage.setItem("perfil", data.perfil);
            localStorage.setItem("nome", data.nome);
            localStorage.setItem("usuarioId", String(data.usuarioId));
            localStorage.setItem("email", data.email);

            if (data.registro) {
                localStorage.setItem("registro", data.registro);
            }

            if (data.perfil === "Administrador") {
                navigate("/admin");
            } else if (data.perfil === "Professor") {
                navigate("/professor");
            } else if (data.perfil === "Aluno") {
                navigate("/aluno");
            } else if (data.perfil === "Responsavel") {
                navigate("/responsavel");
            } else {
                setErro("Perfil inválido.");
            }
        } catch (error) {
            setErro(error.message || "Erro ao realizar login.");
        } finally {
            setCarregando(false);
        }
    }

    function abrirEsqueciSenha() {
        navigate("/esqueci-senha", {
            state: { backgroundLocation: location },
        });
    }

    return (
        <>
            <AppHeader
                logo={logoSplash}
                homePath="/"
                rightContent={
                    <button
                        type="button"
                        className="public-nav-link"
                        onClick={() => navigate("/matricula")}
                        style={{ background: "none", border: "none", cursor: "pointer" }}
                    >
                        Matrículas
                    </button>
                }
            />

            <main className="auth-page" role="main">
                <div className="auth-layout">
                    <section className="auth-visual" aria-hidden="true">
                        <img
                            src={roboLogin}
                            alt="Assistente virtual EduConnect"
                            className="auth-visual__image"
                        />
                    </section>

                    <section className="auth-content">
                        <div className="auth-card">
                            <header className="auth-card__header">
                                <h1 className="auth-title">EduConnect</h1>
                                <p className="auth-subtitle">Bem-vindo!</p>
                            </header>

                            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                                <Input
                                    id="registro"
                                    label="Registro"
                                    type="text"
                                    value={registro}
                                    onChange={(e) => setRegistro(e.target.value)}
                                    placeholder="Digite seu registro"
                                    required
                                />

                                <Input
                                    id="senha"
                                    label="Senha"
                                    type="password"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="Digite sua senha"
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    loading={carregando}
                                >
                                    Entrar
                                </Button>

                                <button
                                    type="button"
                                    className="link-secondary"
                                    onClick={abrirEsqueciSenha}
                                >
                                    Esqueci minha senha
                                </button>
                            </form>

                            {erro && (
                                <p className="form-feedback public-feedback-error">
                                    {erro}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}