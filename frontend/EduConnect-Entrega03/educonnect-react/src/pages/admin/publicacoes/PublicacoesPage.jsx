import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaBullhorn,
    FaEdit,
    FaBan,
    FaPlus,
} from "react-icons/fa";

import {
    listarPublicacoes,
    criarPublicacao,
    atualizarPublicacao,
    excluirPublicacao,
} from "../../../services/publicacaoService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/select.css";
import "../../../styles/textarea.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR");
}

export default function PublicacoesPage() {
    const navigate = useNavigate();

    const [publicacoes, setPublicacoes] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [ativa, setAtiva] = useState(true);

    const [modoEdicao, setModoEdicao] = useState(false);
    const [publicacaoEditandoId, setPublicacaoEditandoId] = useState(null);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const profileRef = useRef(null);

    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Administrador";

    const breadcrumbItems = [
        { label: "Home", path: "/admin" },
        { label: "Publicações" },
    ];

    async function carregarPublicacoes() {
        try {
            const data = await listarPublicacoes();
            setPublicacoes(Array.isArray(data) ? data : []);
        } catch (error) {
            setErro(error.message || "Erro ao carregar publicações.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarPublicacoes();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        }

        if (profileOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileOpen]);

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    function limparFormulario() {
        setTitulo("");
        setMensagem("");
        setAtiva(true);
        setModoEdicao(false);
        setPublicacaoEditandoId(null);
    }

    function handleEditar(publicacao) {
        setErro("");
        setSucesso("");

        setTitulo(publicacao.titulo || "");
        setMensagem(publicacao.mensagem || "");
        setAtiva(Boolean(publicacao.ativa));
        setModoEdicao(true);
        setPublicacaoEditandoId(publicacao.publicacaoId);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    function handleCancelarEdicao() {
        setErro("");
        setSucesso("");
        limparFormulario();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            if (modoEdicao && publicacaoEditandoId) {
                await atualizarPublicacao(publicacaoEditandoId, {
                    titulo,
                    mensagem,
                    ativa,
                });

                setSucesso("Publicação atualizada com sucesso.");
            } else {
                await criarPublicacao({
                    titulo,
                    mensagem,
                });

                setSucesso("Publicação criada com sucesso.");
            }

            limparFormulario();
            await carregarPublicacoes();
        } catch (error) {
            setErro(error.message || "Erro ao salvar publicação.");
        } finally {
            setSalvando(false);
        }
    }

    async function handleExcluir(publicacaoId) {
        setErro("");
        setSucesso("");

        try {
            await excluirPublicacao(publicacaoId);
            setSucesso("Publicação inativada com sucesso.");

            if (publicacaoEditandoId === publicacaoId) {
                limparFormulario();
            }

            await carregarPublicacoes();
        } catch (error) {
            setErro(error.message || "Erro ao inativar publicação.");
        }
    }

    const headerActions = (
        <div className="internal-header-actions">
            <div className="profile-anchor" ref={profileRef}>
                <button
                    type="button"
                    className="icon-btn"
                    title="Perfil"
                    onClick={() => setProfileOpen((prev) => !prev)}
                >
                    <FaUser />
                </button>

                <ProfileMenu
                    isOpen={profileOpen}
                    nome={nomeUsuario}
                    email={emailUsuario}
                    perfil={perfilUsuario}
                    registro={registroUsuario}
                    onLogout={handleLogout}
                />
            </div>

            <button
                type="button"
                className="icon-btn"
                title="Alternar tema"
                onClick={toggleTheme}
            >
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>
        </div>
    );

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/admin"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-form">
                <div className="admin-form-wrapper admin-publicacoes-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Publicações</h1>
                        <p className="admin-form-page-subtitle">
                            Crie, edite e gerencie comunicados para alunos e responsáveis.
                        </p>
                    </div>

                    {erro && <p className="public-feedback-error admin-form-feedback">{erro}</p>}
                    {sucesso && <p className="public-feedback-success admin-form-feedback">{sucesso}</p>}

                    <section className="admin-publicacoes-card">
                        <div className="form-section-title">
                            <FaBullhorn className="form-section-icon" />
                            <h2>{modoEdicao ? "Editar publicação" : "Nova publicação"}</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="form-base">
                            <div className="form-row">
                                <Input
                                    id="titulo"
                                    label="Título"
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => setTitulo(e.target.value)}
                                    placeholder="Título do comunicado"
                                    required
                                />
                            </div>

                            <Textarea
                                id="mensagem"
                                label="Mensagem"
                                value={mensagem}
                                onChange={(e) => setMensagem(e.target.value)}
                                placeholder="Escreva a mensagem"
                                rows={6}
                                required
                            />

                            {modoEdicao && (
                                <div className="form-row">
                                    <Select
                                        id="ativa"
                                        label="Status"
                                        value={ativa ? "ativa" : "inativa"}
                                        onChange={(e) => setAtiva(e.target.value === "ativa")}
                                    >
                                        <option value="ativa">Ativa</option>
                                        <option value="inativa">Inativa</option>
                                    </Select>
                                </div>
                            )}

                            <div className="form-actions">
                                {modoEdicao && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleCancelarEdicao}
                                    >
                                        Cancelar
                                    </Button>
                                )}

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={salvando}
                                    disabled={salvando}
                                >
                                    {modoEdicao ? <FaEdit /> : <FaPlus />}
                                    {modoEdicao ? "Salvar edição" : " Publicar"}
                                </Button>
                            </div>
                        </form>
                    </section>

                    <section className="admin-publicacoes-card">
                        <div className="form-section-title">
                            <FaBullhorn className="form-section-icon" />
                            <h2>Comunicados</h2>
                        </div>

                        {carregando ? (
                            <p className="admin-publicacoes-feedback">Carregando publicações...</p>
                        ) : publicacoes.length === 0 ? (
                            <p className="admin-publicacoes-feedback">Nenhuma publicação cadastrada.</p>
                        ) : (
                            <div className="admin-publicacoes-lista">
                                {publicacoes.map((publicacao) => (
                                    <article
                                        key={publicacao.publicacaoId}
                                        className="admin-publicacao-item"
                                    >
                                        <div className="admin-publicacao-header">
                                            <div className="admin-publicacao-header-texto">
                                                <div className="admin-publicacao-titulo-box">
                                                    {publicacao.titulo || "-"}
                                                </div>

                                                <div className="admin-publicacao-meta">
                                                    <span>
                                                        {formatarDataHora(publicacao.dataPublicacao)}
                                                    </span>
                                                    <span
                                                        className={`admin-publicacao-status ${publicacao.ativa
                                                            ? "ativa"
                                                            : "inativa"
                                                            }`}
                                                    >
                                                        {publicacao.ativa ? "Ativa" : "Inativa"}
                                                    </span>
                                                    <span>
                                                        Criado por: {publicacao.criadoPorNome || "-"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="admin-publicacao-actions">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => handleEditar(publicacao)}
                                                >
                                                    <FaEdit className="icon-edit" />
                                                    Editar
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    onClick={() => handleExcluir(publicacao.publicacaoId)}
                                                    disabled={!publicacao.ativa}
                                                >
                                                    <FaBan className="icon-delete" />
                                                    {publicacao.ativa ? "Inativar" : "Inativa"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="admin-publicacao-mensagem-box">
                                            {publicacao.mensagem || "-"}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}