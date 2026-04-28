import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaGraduationCap,
    FaPencilAlt,
    FaTable,
    FaHistory,
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
    listarNotasTurma,
    criarNota,
    atualizarNota,
    listarHistoricoNota,
} from "../../../services/notasService";

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

const TIPOS_AVALIACAO = ["P1", "P2", "T1", "T2", "REC"];

function formatarNota(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";
    const numero = Number(valor);
    return Number.isNaN(numero) ? "-" : numero.toFixed(1);
}

function formatarDataHora(data) {
    if (!data) return "-";
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function obterClasseMedia(media) {
    if (media === null || media === undefined || media === "") return "";
    const valor = Number(media);

    if (Number.isNaN(valor)) return "";
    if (valor >= 7) return "nota-azul";
    if (valor >= 6) return "nota-amarela";
    return "nota-vermelha";
}

export default function ProfessorNotasPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [respostaTurmas, setRespostaTurmas] = useState(null);
    const [turmaId, setTurmaId] = useState("");

    const [detalheTurma, setDetalheTurma] = useState(null);
    const [notasTurma, setNotasTurma] = useState([]);
    const [historicoNota, setHistoricoNota] = useState([]);

    const [alunoId, setAlunoId] = useState("");
    const [tipoAvaliacao, setTipoAvaliacao] = useState("");
    const [valor, setValor] = useState("");
    const [motivoAlteracao, setMotivoAlteracao] = useState("");

    const [modoEdicao, setModoEdicao] = useState(false);
    const [notaExistente, setNotaExistente] = useState(null);
    const [painelFormularioAberto, setPainelFormularioAberto] = useState(false);

    const [carregandoTurmas, setCarregandoTurmas] = useState(true);
    const [carregandoDados, setCarregandoDados] = useState(false);
    const [carregandoHistorico, setCarregandoHistorico] = useState(false);
    const [salvando, setSalvando] = useState(false);

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

    const tabelaNotasPorAluno = useMemo(() => {
        return alunosOrdenados.map((aluno) => {
            const notasAluno = notasTurma.filter(
                (nota) => Number(nota.alunoId) === Number(aluno.alunoId)
            );

            const notaP1 = notasAluno.find(
                (n) => String(n.tipoAvaliacao).toUpperCase() === "P1"
            );
            const notaP2 = notasAluno.find(
                (n) => String(n.tipoAvaliacao).toUpperCase() === "P2"
            );
            const notaT1 = notasAluno.find(
                (n) => String(n.tipoAvaliacao).toUpperCase() === "T1"
            );
            const notaT2 = notasAluno.find(
                (n) => String(n.tipoAvaliacao).toUpperCase() === "T2"
            );
            const notaREC = notasAluno.find(
                (n) => String(n.tipoAvaliacao).toUpperCase() === "REC"
            );

            const valoresBase = [notaP1, notaP2, notaT1, notaT2]
                .map((n) => n?.valor)
                .filter((v) => v !== null && v !== undefined);

            let media = null;

            if (valoresBase.length > 0) {
                const soma = valoresBase.reduce((acc, item) => acc + Number(item), 0);
                media = soma / valoresBase.length;
            }

            if (notaREC && Number(notaREC.valor) >= 6) {
                media = Number(notaREC.valor);
            }

            return {
                alunoId: aluno.alunoId,
                alunoNome: aluno.nomeCompletoAluno,
                registroAluno: aluno.registroAluno,
                P1: notaP1 || null,
                P2: notaP2 || null,
                T1: notaT1 || null,
                T2: notaT2 || null,
                REC: notaREC || null,
                media,
            };
        });
    }, [alunosOrdenados, notasTurma]);

    function limparFormulario(manterTurma = true) {
        if (!manterTurma) {
            setTurmaId("");
            setDetalheTurma(null);
            setNotasTurma([]);
        }

        setAlunoId("");
        setTipoAvaliacao("");
        setValor("");
        setMotivoAlteracao("");
        setModoEdicao(false);
        setNotaExistente(null);
        setHistoricoNota([]);
        setPainelFormularioAberto(false);
    }

    async function carregarDadosTurma(idTurma) {
        if (!idTurma) {
            setDetalheTurma(null);
            setNotasTurma([]);
            limparFormulario(true);
            return;
        }

        setErro("");
        setSucesso("");
        setCarregandoDados(true);

        try {
            const [detalhe, notas] = await Promise.all([
                obterMinhaTurmaDetalheProfessor(idTurma),
                listarNotasTurma(idTurma),
            ]);

            setDetalheTurma(detalhe);
            setNotasTurma(Array.isArray(notas) ? notas : []);
            limparFormulario(true);
        } catch (error) {
            setErro(error.message || "Erro ao carregar dados da turma.");
            setDetalheTurma(null);
            setNotasTurma([]);
            limparFormulario(true);
        } finally {
            setCarregandoDados(false);
        }
    }

    useEffect(() => {
        carregarDadosTurma(turmaId);
    }, [turmaId]);

    useEffect(() => {
        async function detectarNotaExistente() {
            if (!alunoId || !tipoAvaliacao) {
                setModoEdicao(false);
                setNotaExistente(null);
                setHistoricoNota([]);
                setMotivoAlteracao("");
                return;
            }

            const notaEncontrada = notasTurma.find(
                (nota) =>
                    Number(nota.alunoId) === Number(alunoId) &&
                    String(nota.tipoAvaliacao).toUpperCase() ===
                    String(tipoAvaliacao).toUpperCase()
            );

            if (notaEncontrada) {
                setModoEdicao(true);
                setNotaExistente(notaEncontrada);
                setValor(String(notaEncontrada.valor ?? ""));
                setMotivoAlteracao("");

                setCarregandoHistorico(true);
                try {
                    const historico = await listarHistoricoNota(notaEncontrada.notaId);
                    setHistoricoNota(Array.isArray(historico) ? historico : []);
                } catch {
                    setHistoricoNota([]);
                } finally {
                    setCarregandoHistorico(false);
                }
            } else {
                setModoEdicao(false);
                setNotaExistente(null);
                setHistoricoNota([]);
                setMotivoAlteracao("");
                setValor("");
            }
        }

        detectarNotaExistente();
    }, [alunoId, tipoAvaliacao, notasTurma]);

    function handleSelecionarTurma(event) {
        setTurmaId(event.target.value);
        setErro("");
        setSucesso("");
    }

    function handleSelecionarAluno(event) {
        setAlunoId(event.target.value);
        setErro("");
        setSucesso("");
    }

    function handleSelecionarTipoAvaliacao(event) {
        setTipoAvaliacao(event.target.value);
        setErro("");
        setSucesso("");
    }

    function handleAbrirEdicaoAluno(alunoIdSelecionado) {
        setAlunoId(String(alunoIdSelecionado));
        setTipoAvaliacao("");
        setValor("");
        setMotivoAlteracao("");
        setModoEdicao(false);
        setNotaExistente(null);
        setHistoricoNota([]);
        setPainelFormularioAberto(true);
        setErro("");
        setSucesso("");
    }

    function handleCancelarEdicao() {
        setAlunoId("");
        setTipoAvaliacao("");
        setValor("");
        setMotivoAlteracao("");
        setModoEdicao(false);
        setNotaExistente(null);
        setHistoricoNota([]);
        setPainelFormularioAberto(false);
        setErro("");
        setSucesso("");
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

        if (!tipoAvaliacao) {
            setErro("Selecione um tipo de avaliação.");
            return;
        }

        if (valor === "") {
            setErro("Informe a nota.");
            return;
        }

        const valorNumerico = Number(valor);

        if (Number.isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 10) {
            setErro("A nota deve estar entre 0 e 10.");
            return;
        }

        if (modoEdicao && !motivoAlteracao.trim()) {
            setErro("Informe o motivo da alteração da nota.");
            return;
        }

        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            if (modoEdicao && notaExistente?.notaId) {
                await atualizarNota(notaExistente.notaId, {
                    valor: valorNumerico,
                    motivoAlteracao: motivoAlteracao.trim(),
                });

                setSucesso("Nota atualizada com sucesso.");
            } else {
                await criarNota({
                    turmaId: Number(turmaId),
                    tipoAvaliacao,
                    alunos: [
                        {
                            alunoId: Number(alunoId),
                            valor: valorNumerico,
                        },
                    ],
                    motivoAlteracao: "",
                });

                setSucesso("Nota lançada com sucesso.");
            }

            const notasAtualizadas = await listarNotasTurma(turmaId);
            setNotasTurma(Array.isArray(notasAtualizadas) ? notasAtualizadas : []);

            if (modoEdicao && notaExistente?.notaId) {
                const historicoAtualizado = await listarHistoricoNota(notaExistente.notaId);
                setHistoricoNota(Array.isArray(historicoAtualizado) ? historicoAtualizado : []);
            } else {
                setHistoricoNota([]);
            }

            setMotivoAlteracao("");
        } catch (error) {
            setErro(error.message || "Erro ao salvar nota.");
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
        { label: "Notas" },
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

            <main className="main-content professor-notas-page-v2">
                <Breadcrumb items={breadcrumbItems} />

                <div className="professor-page-header">
                    <h1 className="page-title">Lançamento de Notas</h1>
                    <p className="professor-page-subtitle">
                        Gerencie notas por turma e mantenha o histórico de alterações.
                    </p>
                </div>

                {(erro || sucesso) && (
                    <div className="professor-form-feedback">
                        {erro && <p className="public-feedback-error">{erro}</p>}
                        {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                    </div>
                )}

                <section className="professor-notas-top-card">
                    <div className="form-section-title">
                        <FaGraduationCap className="form-section-icon cap" />
                        <h2>Turma selecionada</h2>
                    </div>

                    {carregandoTurmas ? (
                        <p className="professor-notas-feedback">Carregando turmas...</p>
                    ) : (
                        <div className="professor-notas-top-grid">
                            <div className="professor-notas-top-select">
                                <Select
                                    id="turmaId"
                                    label="Turma"
                                    value={turmaId}
                                    onChange={handleSelecionarTurma}
                                >
                                    <option value="">Selecione</option>
                                    {turmas.map((turma) => (
                                        <option key={turma.turmaId} value={turma.turmaId}>
                                            {turma.turmaNome} - {turma.disciplinaNome}
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            <div className="professor-notas-summary-grid">
                                <div className="professor-notas-summary-item">
                                    <span>Disciplina</span>
                                    <strong>{detalheTurma?.disciplinaNome || "-"}</strong>
                                </div>
                                <div className="professor-notas-summary-item">
                                    <span>Nível</span>
                                    <strong>{detalheTurma?.nivelEnsino || "-"}</strong>
                                </div>
                                <div className="professor-notas-summary-item">
                                    <span>Sala</span>
                                    <strong>{detalheTurma?.sala || "-"}</strong>
                                </div>
                                <div className="professor-notas-summary-item">
                                    <span>Total de alunos</span>
                                    <strong>{detalheTurma?.totalAlunos ?? alunosOrdenados.length}</strong>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {turmaId && (
                    <div className="professor-notas-main-grid">
                        <section className="professor-notas-form-card">
                            <div className="form-section-title">
                                <FaPencilAlt className="form-section-icon" />
                                <h2>Inserir / Atualizar Nota</h2>
                            </div>

                            {carregandoDados ? (
                                <p className="professor-notas-feedback">Carregando dados da turma...</p>
                            ) : (
                                <>
                                    {!painelFormularioAberto && (
                                        <div className="professor-notas-empty-panel">
                                            <p>Selecione um aluno na tabela para abrir o painel de lançamento.</p>
                                        </div>
                                    )}

                                    {painelFormularioAberto && !modoEdicao && alunoId && tipoAvaliacao && (
                                        <div className="professor-notas-alert professor-notas-alert-info">
                                            <div className="professor-notas-alert-header">
                                                <FaInfoCircle />
                                                <span>Nova nota</span>
                                            </div>
                                            <p>Nenhuma nota foi lançada ainda para este aluno nessa avaliação.</p>
                                        </div>
                                    )}

                                    {painelFormularioAberto && modoEdicao && (
                                        <div className="professor-notas-alert professor-notas-alert-edit">
                                            <div className="professor-notas-alert-header">
                                                <FaEdit />
                                                <span>Modo de edição</span>
                                            </div>
                                            <p>
                                                Já existe uma nota lançada para este aluno nessa avaliação.
                                                Ao salvar, a nota será atualizada e o histórico será preservado.
                                            </p>
                                        </div>
                                    )}

                                    {painelFormularioAberto && (
                                        <form onSubmit={handleSubmit} className="form-base professor-notas-v2-form">
                                            <Select
                                                id="alunoId"
                                                label="Aluno"
                                                value={alunoId}
                                                onChange={handleSelecionarAluno}
                                            >
                                                <option value="">Selecione</option>
                                                {alunosOrdenados.map((aluno) => (
                                                    <option key={aluno.alunoId} value={aluno.alunoId}>
                                                        {aluno.nomeCompletoAluno} ({aluno.registroAluno})
                                                    </option>
                                                ))}
                                            </Select>

                                            <div className="professor-notas-v2-row">
                                                <Select
                                                    id="tipoAvaliacao"
                                                    label="Avaliação"
                                                    value={tipoAvaliacao}
                                                    onChange={handleSelecionarTipoAvaliacao}
                                                >
                                                    <option value="">Selecione</option>
                                                    {TIPOS_AVALIACAO.map((tipo) => (
                                                        <option key={tipo} value={tipo}>
                                                            {tipo}
                                                        </option>
                                                    ))}
                                                </Select>

                                                <Input
                                                    id="valor"
                                                    label="Nota"
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="10"
                                                    value={valor}
                                                    onChange={(e) => setValor(e.target.value)}
                                                    placeholder="0 a 10"
                                                />
                                            </div>

                                            {modoEdicao && (
                                                <Input
                                                    id="motivoAlteracao"
                                                    label="Motivo da alteração"
                                                    type="text"
                                                    value={motivoAlteracao}
                                                    onChange={(e) => setMotivoAlteracao(e.target.value)}
                                                    placeholder="Descreva o motivo da alteração"
                                                />
                                            )}

                                            <div className="form-actions professor-notas-v2-actions">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleCancelarEdicao}
                                                >
                                                    <FaTimes />
                                                    Cancelar
                                                </Button>

                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    loading={salvando}
                                                    disabled={salvando}
                                                >
                                                    <FaSave />
                                                    {salvando
                                                        ? "Salvando..."
                                                        : modoEdicao
                                                            ? "Salvar edição"
                                                            : "  Lançar nota"}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </section>

                        <section className="professor-notas-table-card">
                            <div className="form-section-title">
                                <FaTable className="form-section-icon" />
                                <h2>Notas da Turma</h2>
                            </div>

                            {carregandoDados ? (
                                <p className="professor-notas-feedback">Carregando notas...</p>
                            ) : tabelaNotasPorAluno.length === 0 ? (
                                <p className="professor-notas-feedback">
                                    Nenhum aluno encontrado para esta turma.
                                </p>
                            ) : (
                                <div className="professor-table-wrapper">
                                    <table className="professor-table professor-notas-v2-table">
                                        <thead>
                                            <tr>
                                                <th>Aluno</th>
                                                <th>P1</th>
                                                <th>P2</th>
                                                <th>T1</th>
                                                <th>T2</th>
                                                <th>REC</th>
                                                <th>Média</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tabelaNotasPorAluno.map((linha) => (
                                                <tr key={linha.alunoId}>
                                                    <td>
                                                        <div className="professor-notas-student-cell">
                                                            <strong>{linha.alunoNome}</strong>
                                                            <span>{linha.registroAluno || "-"}</span>
                                                        </div>
                                                    </td>
                                                    <td>{linha.P1 ? formatarNota(linha.P1.valor) : "-"}</td>
                                                    <td>{linha.P2 ? formatarNota(linha.P2.valor) : "-"}</td>
                                                    <td>{linha.T1 ? formatarNota(linha.T1.valor) : "-"}</td>
                                                    <td>{linha.T2 ? formatarNota(linha.T2.valor) : "-"}</td>
                                                    <td>{linha.REC ? formatarNota(linha.REC.valor) : "-"}</td>
                                                    <td>
                                                        {linha.media !== null ? (
                                                            <span className={`grade-badge ${obterClasseMedia(linha.media)}`}>
                                                                {formatarNota(linha.media)}
                                                            </span>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            onClick={() => handleAbrirEdicaoAluno(linha.alunoId)}
                                                        >
                                                            <FaEdit />
                                                            Editar
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                {turmaId && painelFormularioAberto && (
                    <section className="professor-notas-history-card">
                        <div className="form-section-title">
                            <FaHistory className="form-section-icon" />
                            <h2>Histórico de Alterações</h2>
                        </div>

                        {modoEdicao ? (
                            carregandoHistorico ? (
                                <p className="professor-notas-feedback">Carregando histórico...</p>
                            ) : historicoNota.length === 0 ? (
                                <p className="professor-notas-feedback">
                                    Nenhuma alteração registrada para esta nota.
                                </p>
                            ) : (
                                <div className="professor-notas-history-list-v2">
                                    {historicoNota.map((item) => (
                                        <div
                                            key={item.historicoNotaId}
                                            className="professor-notas-history-item-v2"
                                        >
                                            <div className="professor-notas-history-top">
                                                <span>
                                                    <strong>Anterior:</strong> {formatarNota(item.valorAnterior)}
                                                </span>
                                                <span>
                                                    <strong>Novo:</strong> {formatarNota(item.valorNovo)}
                                                </span>
                                                <span className="professor-notas-history-date-v2">
                                                    {formatarDataHora(item.dataAlteracao)}
                                                </span>
                                            </div>
                                            <p>{item.motivo || "-"}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <p className="professor-notas-feedback">
                                O histórico será exibido quando você selecionar uma nota já existente.
                            </p>
                        )}
                    </section>
                )}
            </main>
        </>
    );
}