import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaBell,
    FaUsers,
    FaChalkboardTeacher,
    FaDoorOpen,
    FaGraduationCap,
    FaBookOpen,
} from "react-icons/fa";

import { obterMinhaTurmaDetalheProfessor } from "../../../services/professorTurmaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/professor.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function ProfessorTurmaDetalhePage() {
    const navigate = useNavigate();
    const { turmaId } = useParams();
    const profileRef = useRef(null);

    const [turma, setTurma] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Professor";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Professor";

    useEffect(() => {
        async function carregarDetalheTurma() {
            try {
                const data = await obterMinhaTurmaDetalheProfessor(turmaId);
                setTurma(data);
            } catch (error) {
                setErro(error.message || "Erro ao carregar turma.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDetalheTurma();
    }, [turmaId]);

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

    const alunosOrdenados = useMemo(() => {
        const alunos = turma?.alunos || [];

        return [...alunos].sort((a, b) => {
            const nomeA = (a.nomeCompletoAluno || "").toLowerCase();
            const nomeB = (b.nomeCompletoAluno || "").toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
    }, [turma]);

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    const breadcrumbItems = [
        { label: "Home", path: "/professor" },
        { label: "Turmas", path: "/professor/turmas" },
        { label: turma?.turmaNome || "Detalhes" },
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

    if (carregando) {
        return (
            <>
                <AppHeader
                    logo={logoSplash}
                    title="EduConnect"
                    homePath="/professor"
                    rightContent={headerActions}
                    showNotifications
                />
                <main className="main-content professor-turma-detalhe-page">
                    <p className="professor-turma-detalhe-feedback">Carregando turma...</p>
                </main>
            </>
        );
    }

    if (!turma) {
        return (
            <>
                <AppHeader
                    logo={logoSplash}
                    title="EduConnect"
                    homePath="/professor"
                    rightContent={headerActions}
                />
                <main className="main-content professor-turma-detalhe-page">
                    <p className="professor-turma-detalhe-feedback">Turma não encontrada.</p>

                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/professor"
                rightContent={headerActions}
            />

            <div className="main-container">
                <main className="main-content professor-turma-detalhe-page">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="professor-turma-detalhe-page-header">
                        <div>
                            <h1 className="page-title professor-turma-detalhe-page-title">
                                {turma.turmaNome || "Turma"}
                            </h1>
                            <p className="professor-turma-detalhe-page-subtitle">
                                Visualize os dados gerais da turma e a relação de alunos vinculados.
                            </p>
                        </div>
                    </div>

                    {erro && (
                        <div className="professor-form-feedback">
                            <p className="public-feedback-error">{erro}</p>
                        </div>
                    )}

                    <section className="professor-turma-detalhe-card">
                        <div className="form-section-title">
                            <FaUsers className="form-section-icon" />
                            <h2>Dados da Turma</h2>
                        </div>

                        <div className="professor-turma-detalhe-info-grid">
                            <div className="professor-turma-detalhe-info-item">
                                <span className="professor-turma-detalhe-info-label">
                                    <FaChalkboardTeacher className="professor-turma-detalhe-inline-icon" />
                                    Professor tutor
                                </span>
                                <strong className="professor-turma-detalhe-info-value">
                                    {turma.professorTutorNome || "-"}
                                </strong>
                            </div>

                            <div className="professor-turma-detalhe-info-item">
                                <span className="professor-turma-detalhe-info-label">
                                    <FaDoorOpen className="professor-turma-detalhe-inline-icon" />
                                    Sala
                                </span>
                                <strong className="professor-turma-detalhe-info-value">
                                    {turma.sala || "-"}
                                </strong>
                            </div>

                            <div className="professor-turma-detalhe-info-item">
                                <span className="professor-turma-detalhe-info-label">
                                    <FaGraduationCap className="professor-turma-detalhe-inline-icon" />
                                    Nível
                                </span>
                                <strong className="professor-turma-detalhe-info-value">
                                    {turma.nivelEnsino || "-"}
                                </strong>
                            </div>

                            <div className="professor-turma-detalhe-info-item">
                                <span className="professor-turma-detalhe-info-label">
                                    <FaBookOpen className="professor-turma-detalhe-inline-icon" />
                                    Disciplina
                                </span>
                                <strong className="professor-turma-detalhe-info-value">
                                    {turma.disciplinaNome || "-"}
                                </strong>
                            </div>

                            <div className="professor-turma-detalhe-info-item professor-turma-detalhe-info-item-full">
                                <span className="professor-turma-detalhe-info-label">
                                    <FaUsers className="professor-turma-detalhe-inline-icon" />
                                    Total de alunos
                                </span>
                                <strong className="professor-turma-detalhe-info-value">
                                    {turma.totalAlunos ?? alunosOrdenados.length}
                                </strong>
                            </div>
                        </div>
                    </section>

                    <section className="professor-turma-detalhe-card">
                        <div className="form-section-title">
                            <FaUsers className="form-section-icon" />
                            <h2>Alunos da Turma</h2>
                        </div>

                        {alunosOrdenados.length === 0 ? (
                            <p className="professor-turma-detalhe-feedback">
                                Nenhum aluno encontrado nesta turma.
                            </p>
                        ) : (
                            <div className="professor-table-wrapper">
                                <table className="professor-table professor-turma-detalhe-table">
                                    <thead>
                                        <tr>
                                            <th>N. Chamada</th>
                                            <th>Nome</th>
                                            <th>Registro</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alunosOrdenados.map((aluno, index) => (
                                            <tr key={aluno.alunoId || index}>
                                                <td>{String(index + 1).padStart(2, "0")}</td>
                                                <td>{aluno.nomeCompletoAluno || "-"}</td>
                                                <td>{aluno.registroAluno || "-"}</td>
                                                <td>
                                                    <span
                                                        className={
                                                            aluno.ativo
                                                                ? "professor-turma-detalhe-status professor-turma-detalhe-status-active"
                                                                : "professor-turma-detalhe-status professor-turma-detalhe-status-inactive"
                                                        }
                                                    >
                                                        {aluno.ativo ? "Ativo" : "Inativo"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}