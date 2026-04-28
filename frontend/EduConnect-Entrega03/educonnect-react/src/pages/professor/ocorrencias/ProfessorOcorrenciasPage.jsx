import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaUsers,
    FaExclamationCircle,
    FaList,
    FaSave,
    FaTrash,
} from "react-icons/fa";

import {
    listarMinhasTurmasProfessor,
    obterMinhaTurmaDetalheProfessor,
} from "../../../services/professorTurmaService";
import {
    listarOcorrenciasPorTurma,
    criarOcorrencia,
    excluirOcorrencia,
} from "../../../services/ocorrenciasService";

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
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function ProfessorOcorrenciasPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [respostaTurmas, setRespostaTurmas] = useState(null);
    const [turmaId, setTurmaId] = useState("");

    const [detalheTurma, setDetalheTurma] = useState(null);
    const [ocorrencias, setOcorrencias] = useState([]);

    const [alunoId, setAlunoId] = useState("");
    const [descricao, setDescricao] = useState("");

    const [carregandoTurmas, setCarregandoTurmas] = useState(true);
    const [carregandoDados, setCarregandoDados] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [excluindoId, setExcluindoId] = useState(null);

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

    const alunosOrdenados = useMemo(() => {
        const alunos = detalheTurma?.alunos || [];
        return [...alunos].sort((a, b) => {
            const nomeA = (a.nomeCompletoAluno || "").toLowerCase();
            const nomeB = (b.nomeCompletoAluno || "").toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
    }, [detalheTurma]);

    async function carregarDadosTurma(idTurma) {
        if (!idTurma) {
            setDetalheTurma(null);
            setOcorrencias([]);
            setAlunoId("");
            return;
        }

        setErro("");
        setSucesso("");
        setCarregandoDados(true);

        try {
            const [detalhe, listaOcorrencias] = await Promise.all([
                obterMinhaTurmaDetalheProfessor(idTurma),
                listarOcorrenciasPorTurma(idTurma),
            ]);

            const ocorrenciasOrdenadas = Array.isArray(listaOcorrencias)
                ? [...listaOcorrencias].sort(
                    (a, b) => new Date(b.dataOcorrencia) - new Date(a.dataOcorrencia)
                )
                : [];

            setDetalheTurma(detalhe);
            setOcorrencias(ocorrenciasOrdenadas);
            setAlunoId("");
        } catch (error) {
            setErro(error.message || "Erro ao carregar dados da turma.");
            setDetalheTurma(null);
            setOcorrencias([]);
            setAlunoId("");
        } finally {
            setCarregandoDados(false);
        }
    }

    useEffect(() => {
        carregarDadosTurma(turmaId);
    }, [turmaId]);

    function limparFormulario() {
        setAlunoId("");
        setDescricao("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!turmaId) {
            setErro("Selecione uma turma.");
            return;
        }

        if (!alunoId) {
            setErro("Selecione um aluno.");
            return;
        }

        if (!descricao.trim()) {
            setErro("Informe a descrição da ocorrência.");
            return;
        }

        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            await criarOcorrencia({
                turmaId: Number(turmaId),
                alunoId: Number(alunoId),
                descricao: descricao.trim(),
            });

            setSucesso("Ocorrência registrada com sucesso.");
            limparFormulario();
            await carregarDadosTurma(turmaId);
        } catch (error) {
            setErro(error.message || "Erro ao registrar ocorrência.");
        } finally {
            setSalvando(false);
        }
    }

    async function handleExcluirOcorrencia(ocorrenciaId) {
        setErro("");
        setSucesso("");
        setExcluindoId(ocorrenciaId);

        try {
            await excluirOcorrencia(ocorrenciaId);
            setSucesso("Ocorrência excluída com sucesso.");
            await carregarDadosTurma(turmaId);
        } catch (error) {
            setErro(error.message || "Erro ao excluir ocorrência.");
        } finally {
            setExcluindoId(null);
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
                homePath="/professor"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container">
                <main className="main-content professor-ocorrencias-page">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="professor-page-header">
                        <h1 className="page-title">Ocorrências</h1>
                        <p className="professor-page-subtitle">
                            Registre ocorrências dos alunos e acompanhe o histórico da turma.
                        </p>
                    </div>

                    {(erro || sucesso) && (
                        <div className="professor-form-feedback">
                            {erro && <p className="public-feedback-error">{erro}</p>}
                            {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                        </div>
                    )}

                    <div className="form-card-container">
                        <div className="form-grid-duplo">
                            <div className="coluna-esquerda">
                                <div className="form-section-title">
                                    <FaUsers className="form-section-icon" />
                                    <h2>Selecionar Turma</h2>
                                </div>

                                {carregandoTurmas ? (
                                    <p className="professor-ocorrencias-feedback">Carregando turmas...</p>
                                ) : (
                                    <Select
                                        id="turmaId"
                                        label="Turma"
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
                                )}

                                {turmaId && detalheTurma && (
                                    <div className="professor-ocorrencias-summary-grid">
                                        <div className="professor-ocorrencias-summary-item">
                                            <span>Turma</span>
                                            <strong>{turmaSelecionada?.turmaNome || "-"}</strong>
                                        </div>

                                        <div className="professor-ocorrencias-summary-item">
                                            <span>Disciplina</span>
                                            <strong>{turmaSelecionada?.disciplinaNome || "-"}</strong>
                                        </div>

                                        <div className="professor-ocorrencias-summary-item">
                                            <span>Total de alunos</span>
                                            <strong>{detalheTurma.totalAlunos ?? alunosOrdenados.length}</strong>
                                        </div>
                                    </div>
                                )}

                                <hr className="divisor-interno" />

                                <div className="form-section-title">
                                    <FaExclamationCircle className="form-section-icon" />
                                    <h2>Nova Ocorrência</h2>
                                </div>

                                {!turmaId ? (
                                    <p className="professor-ocorrencias-feedback">
                                        Selecione uma turma para registrar ocorrências.
                                    </p>
                                ) : carregandoDados ? (
                                    <p className="professor-ocorrencias-feedback">
                                        Carregando dados da turma...
                                    </p>
                                ) : (
                                    <form onSubmit={handleSubmit} className="form-base professor-ocorrencias-form">
                                        <Select
                                            id="alunoId"
                                            label="Aluno"
                                            value={alunoId}
                                            onChange={(e) => setAlunoId(e.target.value)}
                                        >
                                            <option value="">Selecione</option>
                                            {alunosOrdenados.map((aluno) => (
                                                <option key={aluno.alunoId} value={aluno.alunoId}>
                                                    {aluno.nomeCompletoAluno} ({aluno.registroAluno})
                                                </option>
                                            ))}
                                        </Select>

                                        <Textarea
                                            id="descricao"
                                            label="Descrição"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            rows={5}
                                            placeholder="Descreva a ocorrência..."
                                        />

                                        <div className="form-actions professor-ocorrencias-actions">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                loading={salvando}
                                                disabled={salvando}
                                            >
                                                <FaSave />
                                                {salvando ? "Salvando..." : "Publicar ocorrência"}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="coluna-direita">
                                <div className="form-section-title">
                                    <FaList className="form-section-icon" />
                                    <h2>Ocorrências Publicadas</h2>
                                </div>

                                {carregandoDados ? (
                                    <p className="professor-ocorrencias-feedback">Carregando ocorrências...</p>
                                ) : ocorrencias.length === 0 ? (
                                    <p className="professor-ocorrencias-feedback">
                                        Nenhuma ocorrência registrada para esta turma.
                                    </p>
                                ) : (
                                    <div className="table-container">
                                        <table className="professor-table professor-ocorrencias-table">
                                            <thead>
                                                <tr>
                                                    <th>Aluno</th>
                                                    <th>Ocorrência</th>
                                                    <th>Data</th>
                                                    <th>Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ocorrencias.map((ocorrencia) => (
                                                    <tr key={ocorrencia.ocorrenciaId}>
                                                        <td>{ocorrencia.alunoNome || "-"}</td>
                                                        <td>{ocorrencia.descricao || "-"}</td>
                                                        <td>{formatarDataHora(ocorrencia.dataOcorrencia)}</td>
                                                        <td>
                                                            <Button
                                                                type="button"
                                                                variant="danger"
                                                                onClick={() =>
                                                                    handleExcluirOcorrencia(ocorrencia.ocorrenciaId)
                                                                }
                                                                disabled={excluindoId === ocorrencia.ocorrenciaId}
                                                            >
                                                                <FaTrash />
                                                                {excluindoId === ocorrencia.ocorrenciaId
                                                                    ? "Excluindo..." : ""}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}