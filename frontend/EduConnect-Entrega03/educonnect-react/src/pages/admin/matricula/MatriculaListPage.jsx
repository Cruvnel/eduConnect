import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMoon, FaSun } from "react-icons/fa";

import {
    listarInteressesMatricula,
    marcarInteresseComoFeito,
} from "../../../services/interesseMatriculaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/modal.css";
import "../../../styles/button.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

const breadcrumbItems = [
    { label: "Home", path: "/admin" },
    { label: "Matrícula", path: "/admin/matricula" },
];

function formatarData(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR");
}

function obterUrlArquivo(url) {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `http://localhost:5267${url}`;
}

function obterExtensaoArquivo(url) {
    if (!url) return "";
    const limpa = url.split("?")[0].toLowerCase();
    const partes = limpa.split(".");
    return partes.length > 1 ? partes.pop() : "";
}

function isImagem(url) {
    const ext = obterExtensaoArquivo(url);
    return ["jpg", "jpeg", "png", "webp"].includes(ext);
}

function isPdf(url) {
    return obterExtensaoArquivo(url) === "pdf";
}

function PreviewDocumento({ label, url }) {
    if (!url) {
        return (
            <div className="admin-doc-preview-block">
                <p className="admin-doc-preview-text">
                    <strong>{label}:</strong> -
                </p>
            </div>
        );
    }

    const arquivoUrl = obterUrlArquivo(url);

    return (
        <div className="admin-doc-preview-block">
            <p className="admin-doc-preview-text">
                <strong>{label}:</strong>{" "}
                <a
                    href={arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-doc-link"
                >
                    Abrir em nova aba
                </a>
            </p>

            {isImagem(url) && (
                <div className="admin-doc-preview-frame">
                    <img
                        src={arquivoUrl}
                        alt={label}
                        className="admin-doc-preview-image"
                    />
                </div>
            )}

            {isPdf(url) && (
                <div className="admin-doc-preview-frame">
                    <iframe
                        src={arquivoUrl}
                        title={label}
                        className="admin-doc-preview-pdf"
                    />
                </div>
            )}

            {!isImagem(url) && !isPdf(url) && (
                <div className="admin-doc-preview-frame">
                    <p className="admin-doc-preview-text">
                        Visualização não disponível para esse tipo de arquivo.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function MatriculaListPage() {
    const navigate = useNavigate();

    const [interesses, setInteresses] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [carregando, setCarregando] = useState(true);
    const [processandoId, setProcessandoId] = useState(null);
    const [interesseSelecionado, setInteresseSelecionado] = useState(null);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const profileRef = useRef(null);

    const nome = localStorage.getItem("nome") || "Usuário";
    const email = localStorage.getItem("email") || "email@educonnect.com";
    const registro = localStorage.getItem("registro") || "";
    const perfil = localStorage.getItem("perfil") || "Administrador";

    useEffect(() => {
        async function carregarInteresses() {
            try {
                const data = await listarInteressesMatricula();
                setInteresses(Array.isArray(data) ? data : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar solicitações.");
            } finally {
                setCarregando(false);
            }
        }

        carregarInteresses();
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

    function normalizarStatus(item) {
        const status = (item.status || "").toLowerCase();

        if (status.includes("feito") || status.includes("conclu")) {
            return "feito";
        }

        return "pendente";
    }

    const interessesFiltrados = useMemo(() => {
        const listaBase =
            filtro === "todos"
                ? [...interesses]
                : interesses.filter((item) => normalizarStatus(item) === filtro);

        return listaBase.sort((a, b) => {
            const statusA = normalizarStatus(a);
            const statusB = normalizarStatus(b);

            if (statusA !== statusB) {
                return statusA === "pendente" ? -1 : 1;
            }

            return new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao);
        });
    }, [interesses, filtro]);

    async function handleMarcarComoFeito(id) {
        setErro("");
        setSucesso("");
        setProcessandoId(id);

        try {
            await marcarInteresseComoFeito(id);

            setInteresses((prev) =>
                prev.map((item) =>
                    item.interesseMatriculaId === id
                        ? { ...item, status: "Feito" }
                        : item
                )
            );

            setInteresseSelecionado((prev) =>
                prev && prev.interesseMatriculaId === id
                    ? { ...prev, status: "Feito" }
                    : prev
            );

            setSucesso("Solicitação marcada como feita.");
        } catch (error) {
            setErro(error.message || "Erro ao atualizar solicitação.");
        } finally {
            setProcessandoId(null);
        }
    }

    function abrirModal(interesse) {
        setInteresseSelecionado(interesse);
    }

    function fecharModal() {
        setInteresseSelecionado(null);
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
                    nome={nome}
                    email={email}
                    perfil={perfil}
                    registro={registro}
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

            <div className="main-container">
                <main className="main-content">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-matricula-page-header">
                        <div>
                            <h1 className="page-title admin-matricula-page-title">
                                Solicitações de Matrícula
                            </h1>
                            <p className="admin-matricula-page-subtitle">
                                Gerencie os interesses recebidos pelo formulário online.
                            </p>
                        </div>

                        <select
                            className="form-control admin-matricula-filter"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="pendente">Pendentes</option>
                            <option value="feito">Concluídos</option>
                        </select>
                    </div>

                    {carregando && (
                        <p className="admin-matricula-feedback">
                            Carregando solicitações...
                        </p>
                    )}

                    {!carregando && erro && (
                        <p className="public-feedback-error">{erro}</p>
                    )}

                    {!carregando && sucesso && (
                        <p className="public-feedback-success">{sucesso}</p>
                    )}

                    {!carregando && !erro && interessesFiltrados.length === 0 && (
                        <p className="admin-matricula-feedback">
                            Nenhuma solicitação encontrada.
                        </p>
                    )}

                    {!carregando && !erro && interessesFiltrados.length > 0 && (
                        <div className="admin-matricula-list-container">
                            {interessesFiltrados.map((item) => {
                                const status = normalizarStatus(item);

                                return (
                                    <div
                                        key={item.interesseMatriculaId}
                                        className={`admin-matricula-card ${status === "feito" ? "status-recebido" : ""
                                            }`}
                                    >
                                        <div className="card-info">
                                            <h3>{item.nomeAluno || "-"}</h3>
                                            <p>
                                                <strong>Responsável:</strong>{" "}
                                                {item.nomeResponsavel || "-"}
                                            </p>

                                            <div className="card-meta">
                                                <span>{formatarDataHora(item.dataSolicitacao)}</span>

                                                <span
                                                    className={`status-badge ${status === "feito"
                                                        ? "status-concluido"
                                                        : "status-pendente"
                                                        }`}
                                                >
                                                    {status === "feito"
                                                        ? "Concluído"
                                                        : "Pendente"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button
                                                type="button"
                                                className="btn-action btn-view"
                                                onClick={() => abrirModal(item)}
                                            >
                                                Ver detalhes
                                            </button>

                                            <button
                                                type="button"
                                                className={`btn-action btn-check ${status === "feito" ? "active" : ""
                                                    }`}
                                                onClick={() =>
                                                    handleMarcarComoFeito(item.interesseMatriculaId)
                                                }
                                                disabled={
                                                    processandoId === item.interesseMatriculaId ||
                                                    status === "feito"
                                                }
                                            >
                                                {status === "feito"
                                                    ? "Concluído"
                                                    : processandoId === item.interesseMatriculaId
                                                        ? "Salvando..."
                                                        : "Marcar como feito"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {interesseSelecionado && (
                <Modal
                    title="Detalhes da Solicitação"
                    onClose={fecharModal}
                    size="md"
                >
                    <div className="admin-matricula-modal-body">
                        <section className="admin-matricula-detail-section">
                            <h3>Responsável</h3>
                            <p>
                                <strong>Nome:</strong>{" "}
                                {interesseSelecionado.nomeResponsavel || "-"}
                            </p>
                            <p>
                                <strong>Data de nascimento:</strong>{" "}
                                {formatarData(
                                    interesseSelecionado.dataNascimentoResponsavel
                                )}
                            </p>
                            <p>
                                <strong>E-mail:</strong>{" "}
                                {interesseSelecionado.emailContato || "-"}
                            </p>
                            <p>
                                <strong>Telefone:</strong>{" "}
                                {interesseSelecionado.telefone || "-"}
                            </p>

                            <PreviewDocumento
                                label="Documento do responsável"
                                url={interesseSelecionado.documentoResponsavelUrl}
                            />
                        </section>

                        <section className="admin-matricula-detail-section">
                            <h3>Aluno</h3>
                            <p>
                                <strong>Nome:</strong>{" "}
                                {interesseSelecionado.nomeAluno || "-"}
                            </p>
                            <p>
                                <strong>Data de nascimento:</strong>{" "}
                                {formatarData(
                                    interesseSelecionado.dataNascimentoAluno
                                )}
                            </p>
                            <p>
                                <strong>Ano escolar atual:</strong>{" "}
                                {interesseSelecionado.anoEscolarAtual || "-"}
                            </p>

                            <PreviewDocumento
                                label="Documento do aluno"
                                url={interesseSelecionado.documentoAlunoUrl}
                            />
                        </section>

                        <section className="admin-matricula-detail-section">
                            <h3>Solicitação</h3>
                            <p>
                                <strong>Status:</strong>{" "}
                                {interesseSelecionado.status || "-"}
                            </p>
                            <p>
                                <strong>Data da solicitação:</strong>{" "}
                                {formatarDataHora(
                                    interesseSelecionado.dataSolicitacao
                                )}
                            </p>
                            <p>
                                <strong>Observações:</strong>{" "}
                                {interesseSelecionado.observacoes || "-"}
                            </p>
                        </section>

                        <div className="admin-matricula-modal-actions">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() =>
                                    handleMarcarComoFeito(
                                        interesseSelecionado.interesseMatriculaId
                                    )
                                }
                                disabled={
                                    processandoId ===
                                    interesseSelecionado.interesseMatriculaId ||
                                    normalizarStatus(interesseSelecionado) === "feito"
                                }
                            >
                                {normalizarStatus(interesseSelecionado) === "feito"
                                    ? "Concluído"
                                    : processandoId ===
                                        interesseSelecionado.interesseMatriculaId
                                        ? "Salvando..."
                                        : "Marcar como feito"}
                            </Button>

                            <Button
                                type="button"
                                onClick={fecharModal}
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}