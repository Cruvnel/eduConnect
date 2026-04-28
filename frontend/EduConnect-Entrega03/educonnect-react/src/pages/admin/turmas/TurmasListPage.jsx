import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMoon, FaSun } from "react-icons/fa";

import { listarTurmas } from "../../../services/turmaService";
import { listarNiveisEnsino } from "../../../services/nivelEnsinoService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

function obterStatusTurma(turma) {
    if (turma?.ativo === false) return "arquivada";
    if (turma?.arquivada === true) return "arquivada";
    if (turma?.encerrada === true) return "arquivada";

    const status = String(turma?.status || "").toLowerCase();

    if (
        status.includes("arquiv") ||
        status.includes("encerr") ||
        status.includes("inativ")
    ) {
        return "arquivada";
    }

    return "ativa";
}

export default function TurmasListPage() {
    const navigate = useNavigate();

    const [turmas, setTurmas] = useState([]);
    const [niveis, setNiveis] = useState([]);
    const [nivelFiltro, setNivelFiltro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

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
        { label: "Turmas" }
    ];

    useEffect(() => {
        async function carregarDados() {
            try {
                const [turmasData, niveisData] = await Promise.all([
                    listarTurmas(),
                    listarNiveisEnsino(),
                ]);

                setTurmas(Array.isArray(turmasData) ? turmasData : []);
                setNiveis(Array.isArray(niveisData) ? niveisData : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar turmas.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
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

    function obterNomeNivel(nivelEnsinoId) {
        const nivel = niveis.find(
            (n) => Number(n.nivelEnsinoId) === Number(nivelEnsinoId)
        );

        return nivel ? nivel.nome : "-";
    }

    function formatarTituloTurma(turma) {
        const partes = [turma.nome];

        if (turma.anoLetivo) {
            partes.push(String(turma.anoLetivo));
        }

        return partes.filter(Boolean).join(" | ");
    }

    const turmasFiltradas = useMemo(() => {
        if (!nivelFiltro) return turmas;

        return turmas.filter(
            (turma) => Number(turma.nivelEnsinoId) === Number(nivelFiltro)
        );
    }, [turmas, nivelFiltro]);

    const turmasAtivas = useMemo(() => {
        return turmasFiltradas.filter((turma) => obterStatusTurma(turma) === "ativa");
    }, [turmasFiltradas]);

    const turmasArquivadas = useMemo(() => {
        return turmasFiltradas.filter((turma) => obterStatusTurma(turma) === "arquivada");
    }, [turmasFiltradas]);

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

            <div className="main-container">
                <main className="main-content admin-turmas-main-content">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-turmas-page-header">
                        <div>
                            <h1 className="page-title admin-turmas-page-title">Turmas</h1>
                            <p className="admin-turmas-page-subtitle">
                                Visualize, filtre e acesse as turmas cadastradas.
                            </p>
                        </div>

                    </div>

                    <div className="admin-turmas-filter-container">
                        <label htmlFor="nivelFiltro" className="admin-turmas-filter-label">
                            Filtrar por nível:
                        </label>

                        <select
                            id="nivelFiltro"
                            className="form-control admin-turmas-filter-select"
                            value={nivelFiltro}
                            onChange={(e) => setNivelFiltro(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {niveis.map((nivel) => (
                                <option key={nivel.nivelEnsinoId} value={nivel.nivelEnsinoId}>
                                    {nivel.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {carregando && (
                        <p className="admin-turmas-feedback">Carregando turmas...</p>
                    )}

                    {!carregando && erro && (
                        <p className="public-feedback-error">{erro}</p>
                    )}

                    {!carregando && !erro && turmasFiltradas.length === 0 && (
                        <p className="admin-turmas-feedback">Nenhuma turma encontrada.</p>
                    )}

                    {!carregando && !erro && turmasAtivas.length > 0 && (
                        <section className="admin-turmas-section">
                            <h2 className="admin-turmas-section-title">Turmas Ativas</h2>

                            <div className="admin-turmas-list">
                                {turmasAtivas.map((turma) => (
                                    <div
                                        key={turma.turmaId}
                                        className="admin-turma-card"
                                    >
                                        <h3>{formatarTituloTurma(turma)}</h3>
                                        <p>{obterNomeNivel(turma.nivelEnsinoId)}</p>

                                        <div className="admin-turma-card-meta">
                                            <span>
                                                <strong>Professor tutor:</strong>{" "}
                                                {turma.professorTutorNome || "-"}
                                            </span>
                                        </div>

                                        <div className="admin-turma-card-actions">
                                            <Button
                                                type="button"
                                                variant="primary"
                                                onClick={() =>
                                                    navigate(`/admin/turmas/${turma.turmaId}`)
                                                }
                                            >
                                                Abrir Turma
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {!carregando && !erro && turmasArquivadas.length > 0 && (
                        <section className="admin-turmas-section admin-turmas-section-archived">
                            <h2 className="admin-turmas-section-title">Turmas Arquivadas</h2>

                            <div className="admin-turmas-list">
                                {turmasArquivadas.map((turma) => (
                                    <div
                                        key={turma.turmaId}
                                        className="admin-turma-card admin-turma-card-inactive"
                                    >
                                        <h3>{formatarTituloTurma(turma)}</h3>
                                        <p>{obterNomeNivel(turma.nivelEnsinoId)}</p>

                                        <div className="admin-turma-card-meta">
                                            <span>Status: Encerrada</span>
                                        </div>

                                        <div className="admin-turma-card-actions">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() =>
                                                    navigate(`/admin/turmas/${turma.turmaId}`)
                                                }
                                            >
                                                Visualizar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </>
    );
}