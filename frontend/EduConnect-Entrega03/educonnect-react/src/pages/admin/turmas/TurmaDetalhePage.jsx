import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaUser, FaMoon, FaSun, FaUserPlus, FaTrash } from "react-icons/fa";

import { obterTurmaPorId } from "../../../services/turmaService";
import {
    listarAlunosDaTurma,
    atribuirAlunoNaTurma,
    removerAlunoDaTurma,
} from "../../../services/turmaAlunoService";
import { listarAlunos } from "../../../services/alunoService";
import { listarNiveisEnsino } from "../../../services/nivelEnsinoService";
import { listarProfessoresDaTurma } from "../../../services/turmaProfessorDisciplinaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/select.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function TurmaDetalhePage() {
    const navigate = useNavigate();
    const { turmaId } = useParams();

    const [turma, setTurma] = useState(null);
    const [niveis, setNiveis] = useState([]);
    const [alunosTurma, setAlunosTurma] = useState([]);
    const [todosAlunos, setTodosAlunos] = useState([]);
    const [vinculosProfessor, setVinculosProfessor] = useState([]);
    const [alunoSelecionadoId, setAlunoSelecionadoId] = useState("");

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erroGeral, setErroGeral] = useState("");

    const [erroAdicionarAluno, setErroAdicionarAluno] = useState("");
    const [sucessoAdicionarAluno, setSucessoAdicionarAluno] = useState("");

    const [erroRemoverAluno, setErroRemoverAluno] = useState("");
    const [sucessoRemoverAluno, setSucessoRemoverAluno] = useState("");

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
        { label: "Turmas", path: "/admin/turmas" },
        { label: "Detalhes da Turma" },
    ];

    async function carregarDados() {
        try {
            setErroGeral("");

            const [
                turmaData,
                alunosTurmaData,
                todosAlunosData,
                niveisData,
                vinculosProfessorData,
            ] = await Promise.all([
                obterTurmaPorId(turmaId),
                listarAlunosDaTurma(turmaId),
                listarAlunos(),
                listarNiveisEnsino(),
                listarProfessoresDaTurma(turmaId),
            ]);

            setTurma(turmaData);
            setNiveis(Array.isArray(niveisData) ? niveisData : []);
            setAlunosTurma(Array.isArray(alunosTurmaData) ? alunosTurmaData : []);
            setTodosAlunos(Array.isArray(todosAlunosData) ? todosAlunosData : []);
            setVinculosProfessor(Array.isArray(vinculosProfessorData) ? vinculosProfessorData : []);
        } catch (error) {
            setErroGeral(error.message || "Erro ao carregar turma.");
        } finally {
            setCarregando(false);
        }
    }

    useEffect(() => {
        carregarDados();
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

    const alunosDisponiveis = useMemo(() => {
        const idsJaNaTurma = alunosTurma.map((a) => Number(a.alunoId));

        return todosAlunos.filter(
            (aluno) => !idsJaNaTurma.includes(Number(aluno.alunoId))
        );
    }, [todosAlunos, alunosTurma]);

    const alunosTurmaDetalhados = useMemo(() => {
        return alunosTurma.map((item) => {
            const alunoCompleto = todosAlunos.find(
                (aluno) => Number(aluno.alunoId) === Number(item.alunoId)
            );

            return {
                ...item,
                registroAluno: alunoCompleto?.registroAluno || alunoCompleto?.registro || "-",
                nomeCompletoAluno:
                    alunoCompleto?.nomeCompletoAluno ||
                    alunoCompleto?.nomeCompleto ||
                    item.alunoNome ||
                    "-",
                emailAluno:
                    alunoCompleto?.email ||
                    alunoCompleto?.emailContato ||
                    alunoCompleto?.emailAluno ||
                    "-",
            };
        });
    }, [alunosTurma, todosAlunos]);

    function obterNomeNivel(nivelEnsinoId) {
        const nivel = niveis.find(
            (n) => Number(n.nivelEnsinoId) === Number(nivelEnsinoId)
        );

        return nivel ? nivel.nome : "-";
    }

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    async function handleAdicionarAluno(event) {
        event.preventDefault();

        setErroAdicionarAluno("");
        setSucessoAdicionarAluno("");
        setErroRemoverAluno("");
        setSucessoRemoverAluno("");
        setErroGeral("");
        setSalvando(true);

        try {
            await atribuirAlunoNaTurma(turmaId, {
                alunoId: Number(alunoSelecionadoId),
            });

            setSucessoAdicionarAluno("Aluno atribuído à turma com sucesso.");
            setAlunoSelecionadoId("");
            await carregarDados();
        } catch (error) {
            setErroAdicionarAluno(error.message || "Erro ao adicionar aluno.");
        } finally {
            setSalvando(false);
        }
    }

    async function handleRemoverAluno(alunoId) {
        setErroRemoverAluno("");
        setSucessoRemoverAluno("");
        setErroAdicionarAluno("");
        setSucessoAdicionarAluno("");
        setErroGeral("");

        try {
            await removerAlunoDaTurma(turmaId, alunoId);
            setSucessoRemoverAluno("Aluno removido da turma com sucesso.");
            await carregarDados();
        } catch (error) {
            setErroRemoverAluno(error.message || "Erro ao remover aluno.");
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

    if (carregando) {
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
                    <div className="admin-turma-detalhe-wrapper">
                        <p className="admin-form-feedback">Carregando turma...</p>
                    </div>
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
                    homePath="/admin"
                    rightContent={headerActions}
                />

                <main className="main-form">
                    <div className="admin-turma-detalhe-wrapper">
                        <p className="public-feedback-error">Turma não encontrada.</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/admin"
                rightContent={headerActions}
            />

            <main className="main-form">
                <div className="admin-turma-detalhe-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-turma-detalhe-page-header">
                        <div>
                            <h1 className="page-title admin-turma-detalhe-page-title">
                                {turma.nome || "Turma"}
                            </h1>
                            <p className="admin-turma-detalhe-page-subtitle">
                                Visualize informações, atribuições pedagógicas e alunos vinculados.
                            </p>
                        </div>
                    </div>

                    {erroGeral && (
                        <p className="public-feedback-error admin-form-feedback">
                            {erroGeral}
                        </p>
                    )}

                    <section className="admin-turma-detalhe-card">
                        <h2 className="admin-turma-detalhe-section-title">
                            Informações da Turma
                        </h2>

                        <div className="admin-turma-detalhe-info-grid">
                            <div className="admin-turma-detalhe-info-item">
                                <span className="admin-turma-detalhe-info-label">Nome</span>
                                <span className="admin-turma-detalhe-info-value">
                                    {turma.nome || "-"}
                                </span>
                            </div>

                            <div className="admin-turma-detalhe-info-item">
                                <span className="admin-turma-detalhe-info-label">Nível</span>
                                <span className="admin-turma-detalhe-info-value">
                                    {obterNomeNivel(turma.nivelEnsinoId)}
                                </span>
                            </div>

                            <div className="admin-turma-detalhe-info-item">
                                <span className="admin-turma-detalhe-info-label">Ano letivo</span>
                                <span className="admin-turma-detalhe-info-value">
                                    {turma.anoLetivo || "-"}
                                </span>
                            </div>

                            <div className="admin-turma-detalhe-info-item">
                                <span className="admin-turma-detalhe-info-label">Sala</span>
                                <span className="admin-turma-detalhe-info-value">
                                    {turma.sala || "-"}
                                </span>
                            </div>

                            <div className="admin-turma-detalhe-info-item">
                                <span className="admin-turma-detalhe-info-label">Professor tutor</span>
                                <span className="admin-turma-detalhe-info-value">
                                    {turma.professorTutorNome || "-"}
                                </span>
                            </div>

                            <div className="admin-turma-detalhe-info-item">
                                <span className="admin-turma-detalhe-info-label">Total de alunos</span>
                                <span className="admin-turma-detalhe-info-value">
                                    {alunosTurmaDetalhados.length}
                                </span>
                            </div>

                            <div className="admin-turma-detalhe-info-item admin-turma-detalhe-info-item-full">
                                <span className="admin-turma-detalhe-info-label">Descrição</span>
                                <span className="admin-turma-detalhe-info-value">
                                    {turma.descricao || "-"}
                                </span>
                            </div>
                        </div>
                    </section>

                    <section className="admin-turma-detalhe-card">
                        <h2 className="admin-turma-detalhe-section-title">
                            Atribuições pedagógicas
                        </h2>

                        {vinculosProfessor.length === 0 ? (
                            <p className="admin-turma-detalhe-feedback">
                                Nenhum professor/disciplina atribuído a esta turma.
                            </p>
                        ) : (
                            <div className="admin-turma-detalhe-table-wrapper">
                                <table className="admin-turma-detalhe-table">
                                    <thead>
                                        <tr>
                                            <th>Professor</th>
                                            <th>Disciplina</th>
                                            <th>Data do vínculo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vinculosProfessor.map((vinculo) => (
                                            <tr key={vinculo.turmaProfessorDisciplinaId}>
                                                <td>{vinculo.professorNome || "-"}</td>
                                                <td>{vinculo.disciplinaNome || "-"}</td>
                                                <td>
                                                    {vinculo.dataVinculo
                                                        ? new Date(vinculo.dataVinculo).toLocaleString("pt-BR")
                                                        : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="admin-turma-detalhe-card">
                        <h2 className="admin-turma-detalhe-section-title">
                            Adicionar aluno à turma
                        </h2>

                        <form
                            onSubmit={handleAdicionarAluno}
                            className="admin-turma-detalhe-add-student"
                        >
                            <div className="admin-turma-detalhe-add-student-field">
                                <Select
                                    id="alunoSelecionadoId"
                                    label=""
                                    value={alunoSelecionadoId}
                                    onChange={(e) => setAlunoSelecionadoId(e.target.value)}
                                >
                                    <option value="">Selecione um aluno</option>
                                    {alunosDisponiveis.map((aluno) => (
                                        <option key={aluno.alunoId} value={aluno.alunoId}>
                                            {aluno.nomeCompletoAluno ||
                                                aluno.nomeCompleto ||
                                                aluno.registroAluno ||
                                                `Aluno ${aluno.alunoId}`}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={salvando || !alunoSelecionadoId}
                            >
                                <FaUserPlus />
                                {salvando ? "Salvando..." : "Adicionar aluno"}
                            </Button>
                        </form>

                        {erroAdicionarAluno && (
                            <p className="public-feedback-error admin-turma-detalhe-inline-feedback">
                                {erroAdicionarAluno}
                            </p>
                        )}

                        {sucessoAdicionarAluno && (
                            <p className="public-feedback-success admin-turma-detalhe-inline-feedback">
                                {sucessoAdicionarAluno}
                            </p>
                        )}
                    </section>

                    <section className="admin-turma-detalhe-card">
                        <h2 className="admin-turma-detalhe-section-title">
                            Alunos da turma
                        </h2>

                        {erroRemoverAluno && (
                            <p className="public-feedback-error admin-turma-detalhe-inline-feedback">
                                {erroRemoverAluno}
                            </p>
                        )}

                        {sucessoRemoverAluno && (
                            <p className="public-feedback-success admin-turma-detalhe-inline-feedback">
                                {sucessoRemoverAluno}
                            </p>
                        )}

                        {alunosTurmaDetalhados.length === 0 ? (
                            <p className="admin-turma-detalhe-feedback">
                                Nenhum aluno vinculado a esta turma.
                            </p>
                        ) : (
                            <div className="admin-turma-detalhe-table-wrapper">
                                <table className="admin-turma-detalhe-table">
                                    <thead>
                                        <tr>
                                            <th>Registro</th>
                                            <th>Aluno</th>
                                            <th>Email</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alunosTurmaDetalhados.map((aluno) => (
                                            <tr key={aluno.alunoId}>
                                                <td>{aluno.registroAluno}</td>
                                                <td>{aluno.nomeCompletoAluno}</td>
                                                <td>{aluno.emailAluno || "-"}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="admin-turma-detalhe-btn-danger"
                                                        onClick={() => handleRemoverAluno(aluno.alunoId)}
                                                        title="Remover aluno"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}