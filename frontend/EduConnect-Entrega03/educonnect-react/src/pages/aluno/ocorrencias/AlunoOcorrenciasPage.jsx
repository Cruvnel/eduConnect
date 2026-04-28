import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaExclamationTriangle,
    FaClipboardList,
    FaCalendarAlt,
    FaChalkboardTeacher,
} from "react-icons/fa";

import { listarOcorrenciasAluno } from "../../../services/alunoService";
import { obterUsuarioAtual } from "../../../services/authService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/aluno.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function AlunoOcorrenciasPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [ocorrencias, setOcorrencias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const [usuario, setUsuario] = useState({
        nome: "",
        email: "",
        registro: "",
        perfil: "",
    });

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const data = await obterUsuarioAtual();

                setUsuario({
                    nome: data.nome || "",
                    email: data.email || "",
                    registro: data.registro || "",
                    perfil: data.perfil || "",
                });

                localStorage.setItem("nome", data.nome || "");
                localStorage.setItem("email", data.email || "");
                localStorage.setItem("perfil", data.perfil || "");
                localStorage.setItem("registro", data.registro || "");
            } catch {
                setUsuario({
                    nome: localStorage.getItem("nome") || "Aluno",
                    email: localStorage.getItem("email") || "email@educonnect.com",
                    registro: localStorage.getItem("registro") || "",
                    perfil: localStorage.getItem("perfil") || "Aluno",
                });
            }
        }

        carregarUsuario();
    }, []);

    useEffect(() => {
        async function carregarOcorrencias() {
            try {
                const data = await listarOcorrenciasAluno();
                const lista = Array.isArray(data) ? data : [];
                setOcorrencias(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar ocorrências.");
            } finally {
                setCarregando(false);
            }
        }

        carregarOcorrencias();
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

    const ocorrenciasOrdenadas = useMemo(() => {
        return [...ocorrencias].sort(
            (a, b) => new Date(b.dataOcorrencia) - new Date(a.dataOcorrencia)
        );
    }, [ocorrencias]);

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    const breadcrumbItems = [
        { label: "Home", path: "/aluno" },
        { label: "Ocorrências" },
    ];

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
                    nome={usuario.nome}
                    email={usuario.email}
                    perfil={usuario.perfil}
                    registro={usuario.registro}
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
                homePath="/aluno"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-content aluno-ocorrencias-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="aluno-page-header">
                    <h1 className="page-title aluno-page-title">Ocorrências</h1>
                    <p className="aluno-page-subtitle">
                        Consulte os registros realizados pelos professores ao longo do período.
                    </p>
                </div>

                {erro && (
                    <div className="aluno-form-feedback">
                        <p className="public-feedback-error">{erro}</p>
                    </div>
                )}

                <section className="aluno-ocorrencias-card">
                    <div className="form-section-title">
                        <FaClipboardList className="form-section-icon" />
                        <h2>Minhas ocorrências</h2>
                    </div>

                    {carregando ? (
                        <p className="aluno-feedback">Carregando ocorrências...</p>
                    ) : ocorrenciasOrdenadas.length === 0 ? (
                        <div className="aluno-ocorrencias-empty">
                            <FaExclamationTriangle />
                            <p>Nenhuma ocorrência registrada.</p>
                        </div>
                    ) : (
                        <div className="aluno-ocorrencias-list">
                            {ocorrenciasOrdenadas.map((ocorrencia) => (
                                <article
                                    key={ocorrencia.ocorrenciaId}
                                    className="aluno-ocorrencia-item"
                                >
                                    <div className="aluno-ocorrencia-top">
                                        <div className="aluno-ocorrencia-icon">
                                            <FaExclamationTriangle />
                                        </div>

                                        <div className="aluno-ocorrencia-content">
                                            <p className="aluno-ocorrencia-descricao">
                                                {ocorrencia.descricao || "-"}
                                            </p>

                                            <div className="aluno-ocorrencia-meta">
                                                <span>
                                                    <FaChalkboardTeacher />
                                                    {ocorrencia.professorNome || "-"}
                                                </span>

                                                <span>
                                                    {ocorrencia.disciplinaNome || "-"}
                                                </span>

                                                <span>
                                                    <FaCalendarAlt />
                                                    {formatarDataHora(ocorrencia.dataOcorrencia)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}