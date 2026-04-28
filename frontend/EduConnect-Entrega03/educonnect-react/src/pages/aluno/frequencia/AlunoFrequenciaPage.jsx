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
} from "react-icons/fa";

import { listarFrequenciaAluno } from "../../../services/alunoService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/aluno.css";

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

function formatarPercentual(valor) {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return "-";
    return `${numero.toFixed(1)}%`;
}

function obterClassePercentual(percentual) {
    if (percentual >= 85) return "is-alta";
    if (percentual >= 75) return "is-media";
    return "is-baixa";
}

export default function AlunoFrequenciaPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [frequencias, setFrequencias] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Aluno";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Aluno";

    useEffect(() => {
        async function carregarFrequencia() {
            try {
                const data = await listarFrequenciaAluno();
                const lista = Array.isArray(data) ? data : [];
                setFrequencias(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar frequência.");
            } finally {
                setCarregando(false);
            }
        }

        carregarFrequencia();
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

    const resumoPorDisciplina = useMemo(() => {
        const resumo = calcularResumoPorDisciplina(frequencias);

        return resumo.sort((a, b) =>
            String(a.disciplinaNome).localeCompare(String(b.disciplinaNome))
        );
    }, [frequencias]);

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

    const frequenciasOrdenadas = useMemo(() => {
        return [...frequencias].sort(
            (a, b) => new Date(b.dataAula) - new Date(a.dataAula)
        );
    }, [frequencias]);

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
                homePath="/aluno"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-content aluno-frequencia-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="aluno-page-header">
                    <h1 className="page-title aluno-page-title">Frequência</h1>
                    <p className="aluno-page-subtitle">
                        Acompanhe sua presença geral, seu rendimento por disciplina e o histórico de aulas.
                    </p>
                </div>

                {erro && <p className="public-feedback-error">{erro}</p>}

                {carregando ? (
                    <p className="aluno-feedback">Carregando frequência...</p>
                ) : (
                    <>
                        <section className="aluno-frequencia-summary-grid">
                            <div className="aluno-frequencia-summary-card">
                                <div className="aluno-frequencia-summary-icon">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <span>Total de aulas</span>
                                    <strong>{resumoGeral.totalAulas}</strong>
                                </div>
                            </div>

                            <div className="aluno-frequencia-summary-card">
                                <div className="aluno-frequencia-summary-icon">
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <span>Presenças</span>
                                    <strong>{resumoGeral.presencas}</strong>
                                </div>
                            </div>

                            <div className="aluno-frequencia-summary-card">
                                <div className="aluno-frequencia-summary-icon">
                                    <FaTimesCircle />
                                </div>
                                <div>
                                    <span>Ausências</span>
                                    <strong>{resumoGeral.ausencias}</strong>
                                </div>
                            </div>

                            <div className="aluno-frequencia-summary-card">
                                <div className="aluno-frequencia-summary-icon">
                                    <FaPercent />
                                </div>
                                <div>
                                    <span>Frequência geral</span>
                                    <strong>{formatarPercentual(resumoGeral.percentualFrequencia)}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="aluno-frequencia-card">
                            <div className="form-section-title">
                                <FaClipboardCheck className="form-section-icon" />
                                <h2>Frequência por disciplina</h2>
                            </div>

                            {resumoPorDisciplina.length === 0 ? (
                                <p className="aluno-feedback">
                                    Nenhum registro de frequência encontrado.
                                </p>
                            ) : (
                                <div className="aluno-table-wrapper">
                                    <table className="aluno-table aluno-frequencia-table">
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
                                                            className={`aluno-percentual-badge ${obterClassePercentual(
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

                        <section className="aluno-frequencia-card">
                            <div className="form-section-title">
                                <FaHistory className="form-section-icon" />
                                <h2>Histórico de frequência</h2>
                            </div>

                            {frequenciasOrdenadas.length === 0 ? (
                                <p className="aluno-feedback">
                                    Nenhum registro de frequência encontrado.
                                </p>
                            ) : (
                                <div className="aluno-table-wrapper">
                                    <table className="aluno-table aluno-frequencia-history-table">
                                        <thead>
                                            <tr>
                                                <th>Data da aula</th>
                                                <th>Disciplina</th>
                                                <th>Presença</th>
                                                <th>Observação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {frequenciasOrdenadas.map((item) => (
                                                <tr key={item.frequenciaId}>
                                                    <td>{formatarData(item.dataAula)}</td>
                                                    <td>{item.disciplinaNome || "-"}</td>
                                                    <td>
                                                        <span
                                                            className={`aluno-presenca-badge ${item.presente ? "is-presente" : "is-ausente"
                                                                }`}
                                                        >
                                                            {item.presente ? "Presente" : "Ausente"}
                                                        </span>
                                                    </td>
                                                    <td>{item.observacao || "-"}</td>
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