import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaClipboardCheck,
    FaSearch,
    FaSave,
    FaTimes,
    FaInfoCircle,
    FaEdit,
} from "react-icons/fa";

import {
    listarMinhasTurmasProfessor,
    obterMinhaTurmaDetalheProfessor,
} from "../../../services/professorTurmaService";
import {
    listarFrequenciasTurma,
    registrarFrequenciaTurma,
} from "../../../services/frequenciaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/select.css";
import "../../../styles/textarea.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/professor.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";

function formatarDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export default function ProfessorFrequenciaPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [respostaTurmas, setRespostaTurmas] = useState(null);

    const [turmaId, setTurmaId] = useState("");
    const [dataAula, setDataAula] = useState(formatarDataHoje());

    const [detalheTurma, setDetalheTurma] = useState(null);
    const [registrosChamada, setRegistrosChamada] = useState([]);

    const [carregandoTurmas, setCarregandoTurmas] = useState(true);
    const [carregandoDados, setCarregandoDados] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // idle | nova | edicao
    const [statusChamada, setStatusChamada] = useState("idle");

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Professor";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Professor";

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const data = await listarMinhasTurmasProfessor();
                setRespostaTurmas(data);
            } catch (error) {
                setErro(error.message || "Erro ao carregar turmas.");
            } finally {
                setCarregandoTurmas(false);
            }
        }

        carregarTurmas();
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

    const turmas = useMemo(() => {
        if (!respostaTurmas) return [];
        if (Array.isArray(respostaTurmas)) return respostaTurmas;
        if (Array.isArray(respostaTurmas.turmas)) return respostaTurmas.turmas;
        return [];
    }, [respostaTurmas]);

    const turmaSelecionada = useMemo(() => {
        return turmas.find((turma) => Number(turma.turmaId) === Number(turmaId));
    }, [turmas, turmaId]);

    function limparTela(preservarMensagens = false) {
        setTurmaId("");
        setDataAula(formatarDataHoje());
        setDetalheTurma(null);
        setRegistrosChamada([]);
        setStatusChamada("idle");
        setCarregandoDados(false);

        if (!preservarMensagens) {
            setErro("");
            setSucesso("");
        }
    }

    async function handleCarregarFormulario() {
        if (!turmaId) {
            setErro("Selecione uma turma.");
            return;
        }

        if (!dataAula) {
            setErro("Selecione uma data.");
            return;
        }

        setErro("");
        setSucesso("");
        setCarregandoDados(true);

        try {
            const dataAulaIso = new Date(`${dataAula}T00:00:00`).toISOString();

            const [detalhe, frequenciasResposta] = await Promise.all([
                obterMinhaTurmaDetalheProfessor(turmaId),
                listarFrequenciasTurma(turmaId, dataAulaIso),
            ]);

            setDetalheTurma(detalhe);

            const frequenciasDaData = Array.isArray(frequenciasResposta)
                ? frequenciasResposta
                : [];

            const existeChamada = frequenciasDaData.length > 0;
            setStatusChamada(existeChamada ? "edicao" : "nova");

            const alunosOrdenados = [...(detalhe.alunos || [])].sort((a, b) => {
                const nomeA = (a.nomeCompletoAluno || "").toLowerCase();
                const nomeB = (b.nomeCompletoAluno || "").toLowerCase();
                return nomeA.localeCompare(nomeB);
            });

            const registros = alunosOrdenados.map((aluno, index) => {
                const frequenciaExistente = frequenciasDaData.find(
                    (f) => Number(f.alunoId) === Number(aluno.alunoId)
                );

                return {
                    alunoId: aluno.alunoId,
                    numeroChamada: String(index + 1).padStart(2, "0"),
                    nomeCompletoAluno: aluno.nomeCompletoAluno || "-",
                    registroAluno: aluno.registroAluno || "-",
                    ativo: aluno.ativo,
                    presente: frequenciaExistente ? Boolean(frequenciaExistente.presente) : true,
                    observacao: frequenciaExistente?.observacao ?? "",
                };
            });

            setRegistrosChamada(registros);
        } catch (error) {
            setErro(error.message || "Erro ao carregar chamada.");
            setDetalheTurma(null);
            setRegistrosChamada([]);
            setStatusChamada("idle");
        } finally {
            setCarregandoDados(false);
        }
    }

    function handleTogglePresenca(alunoId) {
        setRegistrosChamada((prev) =>
            prev.map((item) =>
                Number(item.alunoId) === Number(alunoId)
                    ? { ...item, presente: !item.presente }
                    : item
            )
        );
    }

    function handleAlterarObservacao(alunoId, valor) {
        setRegistrosChamada((prev) =>
            prev.map((item) =>
                Number(item.alunoId) === Number(alunoId)
                    ? { ...item, observacao: valor }
                    : item
            )
        );
    }

    function handleCancelar() {
        limparTela();
    }

    async function handleSalvarChamada(event) {
        event.preventDefault();

        if (!turmaId) {
            setErro("Selecione uma turma.");
            return;
        }

        if (!dataAula) {
            setErro("Selecione uma data.");
            return;
        }

        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            await registrarFrequenciaTurma(turmaId, {
                dataAula: new Date(`${dataAula}T00:00:00`).toISOString(),
                alunos: registrosChamada.map((item) => ({
                    alunoId: Number(item.alunoId),
                    presente: item.presente,
                    observacao: item.observacao || "",
                })),
            });

            const mensagem =
                statusChamada === "edicao"
                    ? "Chamada atualizada com sucesso."
                    : "Chamada registrada com sucesso.";

            limparTela(true);
            setSucesso(mensagem);
        } catch (error) {
            setErro(error.message || "Erro ao salvar chamada.");
        } finally {
            setSalvando(false);
        }
    }

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
        { label: "Chamada" },
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
                homePath="/professor"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container">
                <main className="main-content professor-frequencia-page">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="professor-page-header">
                        <h1 className="page-title">Chamada</h1>
                        <p className="professor-page-subtitle">
                            Selecione uma turma e uma data para registrar ou editar a frequência da aula.
                        </p>
                    </div>

                    {(erro || sucesso) && (
                        <div className="professor-form-feedback">
                            {erro && <p className="public-feedback-error">{erro}</p>}
                            {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                        </div>
                    )}

                    <section className="professor-frequencia-card">
                        <div className="form-section-title">
                            <FaClipboardCheck className="form-section-icon" />
                            <h2>Selecionar turma e data</h2>
                        </div>

                        {carregandoTurmas ? (
                            <p className="professor-frequencia-feedback">Carregando turmas...</p>
                        ) : (
                            <div className="professor-frequencia-toolbar">
                                <div className="professor-frequencia-filter">
                                    <Select
                                        id="turmaId"
                                        label="Turma / Disciplina"
                                        value={turmaId}
                                        onChange={(e) => setTurmaId(e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        {turmas.map((turma) => (
                                            <option key={turma.turmaId} value={turma.turmaId}>
                                                {turma.turmaNome} - {turma.disciplinaNome}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="professor-frequencia-date">
                                    <Input
                                        id="dataAula"
                                        label="Data da aula"
                                        type="date"
                                        value={dataAula}
                                        onChange={(e) => setDataAula(e.target.value)}
                                    />
                                </div>

                                <div className="professor-frequencia-toolbar-action">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleCarregarFormulario}
                                        disabled={carregandoDados}
                                    >
                                        <FaSearch />
                                        {carregandoDados ? "Carregando..." : "Carregar chamada"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>

                    {statusChamada !== "idle" && (
                        <>
                            <section className="professor-frequencia-card">
                                <div className="form-section-title">
                                    <FaInfoCircle className="form-section-icon" />
                                    <h2>
                                        {turmaSelecionada?.turmaNome || "Turma selecionada"}
                                        {statusChamada === "edicao"
                                            ? " — Modo de edição"
                                            : " — Primeira chamada"}
                                    </h2>
                                </div>

                                {detalheTurma && (
                                    <div className="professor-frequencia-info-grid">
                                        <div className="professor-frequencia-info-item">
                                            <span className="professor-frequencia-info-label">Disciplina</span>
                                            <strong>{detalheTurma.disciplinaNome || "-"}</strong>
                                        </div>

                                        <div className="professor-frequencia-info-item">
                                            <span className="professor-frequencia-info-label">Nível</span>
                                            <strong>{detalheTurma.nivelEnsino || "-"}</strong>
                                        </div>

                                        <div className="professor-frequencia-info-item">
                                            <span className="professor-frequencia-info-label">Sala</span>
                                            <strong>{detalheTurma.sala || "-"}</strong>
                                        </div>

                                        <div className="professor-frequencia-info-item">
                                            <span className="professor-frequencia-info-label">Total de alunos</span>
                                            <strong>{detalheTurma.totalAlunos ?? registrosChamada.length}</strong>
                                        </div>
                                    </div>
                                )}

                                {statusChamada === "nova" && (
                                    <div className="professor-frequencia-alert professor-frequencia-alert-info">
                                        <div className="professor-frequencia-alert-header">
                                            <FaInfoCircle />
                                            <span>Primeira chamada</span>
                                        </div>
                                        <p>
                                            Nenhuma chamada foi encontrada para a turma{" "}
                                            <strong>{turmaSelecionada?.turmaNome || "-"}</strong> na data{" "}
                                            <strong>{dataAula}</strong>. Você pode registrar a chamada normalmente.
                                        </p>
                                    </div>
                                )}

                                {statusChamada === "edicao" && (
                                    <div className="professor-frequencia-alert professor-frequencia-alert-edit">
                                        <div className="professor-frequencia-alert-header">
                                            <FaEdit />
                                            <span>Modo de edição</span>
                                        </div>
                                        <p>
                                            Esta chamada já foi realizada para a turma{" "}
                                            <strong>{turmaSelecionada?.turmaNome || "-"}</strong> na data{" "}
                                            <strong>{dataAula}</strong>. Os dados existentes foram carregados e
                                            podem ser revisados antes de salvar novamente.
                                        </p>
                                    </div>
                                )}
                            </section>

                            <section className="professor-frequencia-card">
                                <div className="form-section-title">
                                    <FaClipboardCheck className="form-section-icon" />
                                    <h2>Registro de frequência</h2>
                                </div>

                                {registrosChamada.length === 0 ? (
                                    <p className="professor-frequencia-feedback">
                                        Nenhum aluno encontrado para esta turma.
                                    </p>
                                ) : (
                                    <form onSubmit={handleSalvarChamada}>
                                        <div className="professor-table-wrapper">
                                            <table className="professor-table professor-frequencia-table">
                                                <thead>
                                                    <tr>
                                                        <th>N. Chamada</th>
                                                        <th>Nome</th>
                                                        <th>Registro</th>
                                                        <th>Status</th>
                                                        <th>Presente</th>
                                                        <th>Observação</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {registrosChamada.map((item) => (
                                                        <tr key={item.alunoId}>
                                                            <td>{item.numeroChamada}</td>
                                                            <td>{item.nomeCompletoAluno}</td>
                                                            <td>{item.registroAluno}</td>
                                                            <td>
                                                                <span
                                                                    className={
                                                                        item.ativo
                                                                            ? "professor-status-badge ativo"
                                                                            : "professor-status-badge inativo"
                                                                    }
                                                                >
                                                                    {item.ativo ? "Ativo" : "Inativo"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <label className="professor-frequencia-checkbox">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={item.presente}
                                                                        onChange={() =>
                                                                            handleTogglePresenca(item.alunoId)
                                                                        }
                                                                    />
                                                                    <span>
                                                                        {item.presente ? "Presente" : "Ausente"}
                                                                    </span>
                                                                </label>
                                                            </td>
                                                            <td>
                                                                <input
                                                                    className="professor-frequencia-note"
                                                                    type="text"
                                                                    value={item.observacao}
                                                                    onChange={(e) =>
                                                                        handleAlterarObservacao(
                                                                            item.alunoId,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    placeholder="Observação"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="form-actions professor-frequencia-actions">
                                            {statusChamada === "edicao" && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleCancelar}
                                                >
                                                    <FaTimes />
                                                    Cancelar
                                                </Button>
                                            )}

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                loading={salvando}
                                                disabled={salvando}
                                            >
                                                <FaSave />
                                                {salvando
                                                    ? "Salvando..."
                                                    : statusChamada === "edicao"
                                                        ? "Salvar edição"
                                                        : "Salvar chamada"}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </section>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}