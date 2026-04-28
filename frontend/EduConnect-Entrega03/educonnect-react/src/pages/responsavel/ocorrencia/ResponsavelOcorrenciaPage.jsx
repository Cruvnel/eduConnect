import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaExclamationTriangle,
    FaClipboardList,
    FaUserTie,
    FaBookOpen,
} from "react-icons/fa";

import { listarOcorrenciasResponsavel } from "../../../services/responsavelService";
import { useResponsavelAluno } from "../../../contexts/ResponsavelAlunoContext";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/responsavel.css";

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

export default function ResponsavelOcorrenciasPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const {
        alunos,
        alunoSelecionado,
        alunoSelecionadoId,
        carregandoAlunos,
        erroAlunos,
        obterNomeAluno,
    } = useResponsavelAluno();

    const alunoEmFoco = alunoSelecionado;
    const deveMostrarAlunoEmFoco = alunos.length > 1 && alunoEmFoco;

    const [ocorrencias, setOcorrencias] = useState([]);
    const [carregandoOcorrencias, setCarregandoOcorrencias] = useState(false);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Responsável";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Responsável";

    useEffect(() => {
        async function carregarOcorrencias() {
            if (!alunoSelecionadoId) {
                setOcorrencias([]);
                return;
            }

            setErro("");
            setCarregandoOcorrencias(true);

            try {
                const data = await listarOcorrenciasResponsavel(alunoSelecionadoId);
                const lista = Array.isArray(data) ? data : [];
                setOcorrencias(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar ocorrências.");
                setOcorrencias([]);
            } finally {
                setCarregandoOcorrencias(false);
            }
        }

        carregarOcorrencias();
    }, [alunoSelecionadoId]);

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
        localStorage.removeItem("responsavel_aluno_em_foco");
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    const erroGeral = erro || erroAlunos;

    const breadcrumbItems = [
        { label: "Home", path: "/responsavel" },
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
                homePath="/responsavel"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-content responsavel-ocorrencias-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="responsavel-page-header">
                    <h1 className="page-title responsavel-page-title">Ocorrências</h1>
                    <p className="responsavel-page-subtitle">
                        Consulte as ocorrências registradas para o aluno em foco.
                    </p>
                </div>

                {erroGeral && (
                    <div className="responsavel-form-feedback">
                        <p className="public-feedback-error">{erroGeral}</p>
                    </div>
                )}

                {(carregandoAlunos || carregandoOcorrencias) ? (
                    <p className="responsavel-feedback">Carregando ocorrências...</p>
                ) : !alunoSelecionado ? (
                    <p className="responsavel-feedback">
                        Selecione um aluno na página inicial do responsável.
                    </p>
                ) : (
                    <>
                        {deveMostrarAlunoEmFoco && (
                            <section className="responsavel-desempenho-focus-card responsavel-home-focus-card">
                                <div className="responsavel-home-focus-compact">
                                    <div className="responsavel-home-focus-compact-header">
                                        <span className="responsavel-home-focus-label">Aluno em foco</span>
                                    </div>

                                    <div className="responsavel-home-focus-inline-info">
                                        <span>{obterNomeAluno(alunoEmFoco)}</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="responsavel-ocorrencias-card">
                            <div className="form-section-title">
                                <FaClipboardList className="form-section-icon" />
                                <h2>Lista de ocorrências</h2>
                            </div>

                            {ocorrenciasOrdenadas.length === 0 ? (
                                <p className="responsavel-feedback">
                                    Nenhuma ocorrência encontrada para o aluno em foco.
                                </p>
                            ) : (
                                <div className="responsavel-table-wrapper">
                                    <table className="responsavel-table responsavel-ocorrencias-table">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Professor</th>
                                                <th>Disciplina</th>
                                                <th>Descrição</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ocorrenciasOrdenadas.map((item) => (
                                                <tr key={item.ocorrenciaId}>
                                                    <td>{formatarDataHora(item.dataOcorrencia)}</td>
                                                    <td>
                                                        <span className="responsavel-ocorrencia-professor">
                                                            <FaUserTie />
                                                            {item.professorNome || "-"}
                                                        </span>
                                                    </td>
                                                    <td>{item.disciplinaNome || "-"}</td>
                                                    <td>
                                                        <div className="responsavel-ocorrencia-descricao">
                                                            <FaExclamationTriangle />
                                                            <span>{item.descricao || "-"}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </>
    );
}