import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaClipboardCheck,
    FaListAlt,
    FaHistory,
    FaCalendarAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaPercent,
    FaBookOpen,
} from "react-icons/fa";

import { listarFrequenciaResponsavel } from "../../../services/responsavelService";
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

function formatarData(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("pt-BR");
}

function formatarPercentual(valor) {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return "-";
    return `${numero.toFixed(1)}%`;
}

function calcularResumoPorDisciplina(frequencias) {
    const mapa = {};

    for (const item of frequencias) {
        const chave = item.disciplinaNome || "Sem disciplina";

        if (!mapa[chave]) {
            mapa[chave] = {
                disciplinaNome: chave,
                totalAulas: 0,
                presencas: 0,
                ausencias: 0,
            };
        }

        mapa[chave].totalAulas += 1;

        if (item.presente) {
            mapa[chave].presencas += 1;
        } else {
            mapa[chave].ausencias += 1;
        }
    }

    return Object.values(mapa).map((disciplina) => ({
        ...disciplina,
        percentualFrequencia:
            disciplina.totalAulas > 0
                ? (disciplina.presencas / disciplina.totalAulas) * 100
                : 0,
    }));
}

function obterClassePercentual(percentual) {
    if (percentual >= 85) return "is-alta";
    if (percentual >= 75) return "is-media";
    return "is-baixa";
}

export default function ResponsavelFrequenciaPage() {
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

    const [frequencias, setFrequencias] = useState([]);
    const [carregandoFrequencia, setCarregandoFrequencia] = useState(false);
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
        async function carregarFrequencia() {
            if (!alunoSelecionadoId) {
                setFrequencias([]);
                return;
            }

            setErro("");
            setCarregandoFrequencia(true);

            try {
                const data = await listarFrequenciaResponsavel(alunoSelecionadoId);
                const lista = Array.isArray(data) ? data : [];
                setFrequencias(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar frequência.");
                setFrequencias([]);
            } finally {
                setCarregandoFrequencia(false);
            }
        }

        carregarFrequencia();
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

    const resumoGeral = useMemo(() => {
        const totalAulas = frequencias.length;
        const presencas = frequencias.filter((item) => item.presente).length;
        const ausencias = totalAulas - presencas;
        const percentualFrequencia =
            totalAulas > 0 ? (presencas / totalAulas) * 100 : 0;

        return {
            totalAulas,
            presencas,
            ausencias,
            percentualFrequencia,
        };
    }, [frequencias]);

    const resumoPorDisciplina = useMemo(() => {
        const resumo = calcularResumoPorDisciplina(frequencias);

        return resumo.sort((a, b) =>
            String(a.disciplinaNome).localeCompare(String(b.disciplinaNome))
        );
    }, [frequencias]);

    const frequenciasOrdenadas = useMemo(() => {
        return [...frequencias].sort(
            (a, b) => new Date(b.dataAula) - new Date(a.dataAula)
        );
    }, [frequencias]);

    const erroGeral = erro || erroAlunos;

    function handleLogout() {
        localStorage.clear();
        localStorage.removeItem("responsavel_aluno_em_foco");
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    const breadcrumbItems = [
        { label: "Home", path: "/responsavel" },
        { label: "Frequência" },
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

            <main className="main-content responsavel-frequencia-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="responsavel-page-header">
                    <h1 className="page-title responsavel-page-title">Frequência</h1>
                    <p className="responsavel-page-subtitle">
                        Acompanhe a presença do aluno em foco por disciplina e por aula.
                    </p>
                </div>

                {erroGeral && (
                    <div className="responsavel-form-feedback">
                        <p className="public-feedback-error">{erroGeral}</p>
                    </div>
                )}

                {carregandoAlunos || carregandoFrequencia ? (
                    <p className="responsavel-feedback">Carregando frequência...</p>
                ) : !alunoSelecionado ? (
                    <p className="responsavel-feedback">
                        Selecione um aluno na página inicial do responsável.
                    </p>
                ) : (
                    <>
                        {deveMostrarAlunoEmFoco && (
                            <section className="responsavel-frequencia-focus-card responsavel-home-focus-card">
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

                        <section className="responsavel-frequencia-summary-grid">
                            <div className="responsavel-frequencia-summary-card">
                                <div className="responsavel-frequencia-summary-icon">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <span>Total de aulas</span>
                                    <strong>{resumoGeral.totalAulas}</strong>
                                </div>
                            </div>

                            <div className="responsavel-frequencia-summary-card">
                                <div className="responsavel-frequencia-summary-icon">
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <span>Presenças</span>
                                    <strong>{resumoGeral.presencas}</strong>
                                </div>
                            </div>

                            <div className="responsavel-frequencia-summary-card">
                                <div className="responsavel-frequencia-summary-icon">
                                    <FaTimesCircle />
                                </div>
                                <div>
                                    <span>Ausências</span>
                                    <strong>{resumoGeral.ausencias}</strong>
                                </div>
                            </div>

                            <div className="responsavel-frequencia-summary-card">
                                <div className="responsavel-frequencia-summary-icon">
                                    <FaPercent />
                                </div>
                                <div>
                                    <span>Frequência geral</span>
                                    <strong>{formatarPercentual(resumoGeral.percentualFrequencia)}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="responsavel-frequencia-card">
                            <div className="form-section-title">
                                <FaClipboardCheck className="form-section-icon" />
                                <h2>Frequência por disciplina</h2>
                            </div>

                            {resumoPorDisciplina.length === 0 ? (
                                <p className="responsavel-feedback">
                                    Nenhum registro de frequência encontrado para o aluno em foco.
                                </p>
                            ) : (
                                <div className="responsavel-table-wrapper">
                                    <table className="responsavel-table responsavel-frequencia-table">
                                        <thead>
                                            <tr>
                                                <th>Disciplina</th>
                                                <th>Total de aulas</th>
                                                <th>Presenças</th>
                                                <th>Ausências</th>
                                                <th>Frequência</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {resumoPorDisciplina.map((item) => (
                                                <tr key={item.disciplinaNome}>
                                                    <td>{item.disciplinaNome}</td>
                                                    <td>{item.totalAulas}</td>
                                                    <td>{item.presencas}</td>
                                                    <td>{item.ausencias}</td>
                                                    <td>
                                                        <span
                                                            className={`responsavel-percentual-badge ${obterClassePercentual(
                                                                item.percentualFrequencia
                                                            )}`}
                                                        >
                                                            {formatarPercentual(item.percentualFrequencia)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="responsavel-frequencia-card">
                            <div className="form-section-title">
                                <FaHistory className="form-section-icon" />
                                <h2>Histórico de frequência</h2>
                            </div>

                            {frequenciasOrdenadas.length === 0 ? (
                                <p className="responsavel-feedback">
                                    Nenhum registro de frequência encontrado para o aluno em foco.
                                </p>
                            ) : (
                                <div className="responsavel-table-wrapper">
                                    <table className="responsavel-table responsavel-frequencia-history-table">
                                        <thead>
                                            <tr>
                                                <th>Data da aula</th>
                                                <th>Disciplina</th>
                                                <th>Presença</th>
                                                <th>Observação</th>
                                                <th>Professor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {frequenciasOrdenadas.map((item) => (
                                                <tr key={item.frequenciaId}>
                                                    <td>{formatarData(item.dataAula)}</td>
                                                    <td>{item.disciplinaNome || "-"}</td>
                                                    <td>
                                                        <span
                                                            className={`responsavel-presenca-badge ${item.presente ? "is-presente" : "is-ausente"
                                                                }`}
                                                        >
                                                            {item.presente ? "Presente" : "Ausente"}
                                                        </span>
                                                    </td>
                                                    <td>{item.observacao || "-"}</td>
                                                    <td>{item.professorNome || "-"}</td>
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