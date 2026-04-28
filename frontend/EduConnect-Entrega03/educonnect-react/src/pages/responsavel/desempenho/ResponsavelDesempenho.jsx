import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaChartBar,
    FaClipboardList,
    FaBookOpen,
    FaCheckCircle,
} from "react-icons/fa";

import { obterBoletimResponsavel } from "../../../services/responsavelService";
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

function normalizarNumero(valor) {
    if (valor === null || valor === undefined || valor === "") return null;
    const numero = Number(valor);
    return Number.isNaN(numero) ? null : numero;
}

function formatarNota(valor) {
    const numero = normalizarNumero(valor);
    return numero === null ? "-" : numero.toFixed(1);
}

function obterClasseSituacao(situacao) {
    const texto = String(situacao || "").toLowerCase();

    if (texto.includes("reprovado")) return "is-reprovado";
    if (texto.includes("aprovado")) return "is-aprovado";
    if (texto.includes("recuperação")) return "is-recuperacao";
    if (texto.includes("análise") || texto.includes("analise")) return "is-analise";

    return "is-analise";
}

export default function ResponsavelDesempenhoPage() {
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

    const [boletim, setBoletim] = useState([]);
    const [carregando, setCarregando] = useState(true);
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
        async function carregarDesempenho() {
            if (!alunoSelecionadoId) {
                setBoletim([]);
                setCarregando(false);
                return;
            }

            setErro("");
            setCarregando(true);

            try {
                const data = await obterBoletimResponsavel(alunoSelecionadoId);

                const lista = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.disciplinas)
                        ? data.disciplinas
                        : [];

                setBoletim(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar desempenho.");
                setBoletim([]);
            } finally {
                setCarregando(false);
            }
        }

        carregarDesempenho();
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

    const desempenhoPorDisciplina = useMemo(() => {
        return [...boletim]
            .map((item, index) => ({
                id: item.disciplinaId || index,
                disciplina: item.disciplinaNome || item.disciplina || "Disciplina",
                media: normalizarNumero(item.mediaFinal ?? item.media),
                situacao: item.situacao || item.Situacao || "Em análise",
            }))
            .sort((a, b) => a.disciplina.localeCompare(b.disciplina));
    }, [boletim]);

    const resumoGeral = useMemo(() => {
        const medias = desempenhoPorDisciplina
            .map((item) => item.media)
            .filter((valor) => valor !== null);

        const quantidadeDisciplinas = desempenhoPorDisciplina.length;
        const aprovadas = desempenhoPorDisciplina.filter(
            (item) =>
                item.situacao === "Aprovado"
        ).length;

        const mediaGeral =
            medias.length > 0
                ? medias.reduce((acc, valor) => acc + valor, 0) / medias.length
                : null;

        return {
            quantidadeDisciplinas,
            aprovadas,
            mediaGeral,
        };
    }, [desempenhoPorDisciplina]);

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
        { label: "Desempenho" },
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

            <main className="main-content responsavel-desempenho-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="responsavel-page-header">
                    <h1 className="page-title responsavel-page-title">Desempenho</h1>
                    <p className="responsavel-page-subtitle">
                        Acompanhe o rendimento do aluno em foco por disciplina.
                    </p>
                </div>

                {erroGeral && (
                    <div className="responsavel-form-feedback">
                        <p className="public-feedback-error">{erroGeral}</p>
                    </div>
                )}

                {carregandoAlunos || carregando ? (
                    <p className="responsavel-feedback">Carregando desempenho...</p>
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

                        <section className="responsavel-desempenho-summary-grid">
                            <div className="responsavel-desempenho-summary-card">
                                <div className="responsavel-desempenho-summary-icon">
                                    <FaClipboardList />
                                </div>
                                <div>
                                    <span>Disciplinas</span>
                                    <strong>{resumoGeral.quantidadeDisciplinas}</strong>
                                </div>
                            </div>

                            <div className="responsavel-desempenho-summary-card">
                                <div className="responsavel-desempenho-summary-icon">
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <span>Aprovadas</span>
                                    <strong>{resumoGeral.aprovadas}</strong>
                                </div>
                            </div>

                            <div className="responsavel-desempenho-summary-card">
                                <div className="responsavel-desempenho-summary-icon">
                                    <FaChartBar />
                                </div>
                                <div>
                                    <span>Média geral</span>
                                    <strong>
                                        {resumoGeral.mediaGeral === null
                                            ? "-"
                                            : resumoGeral.mediaGeral.toFixed(1)}
                                    </strong>
                                </div>
                            </div>
                        </section>

                        <section className="responsavel-desempenho-card">
                            <div className="form-section-title">
                                <FaChartBar className="form-section-icon" />
                                <h2>Média por disciplina</h2>
                            </div>

                            {desempenhoPorDisciplina.length === 0 ? (
                                <p className="responsavel-feedback">
                                    Nenhum dado de desempenho encontrado.
                                </p>
                            ) : (
                                <div className="responsavel-desempenho-chart-box">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={desempenhoPorDisciplina}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="disciplina" />
                                            <YAxis domain={[0, 10]} />
                                            <Tooltip
                                                formatter={(value) =>
                                                    value === null || value === undefined
                                                        ? "-"
                                                        : Number(value).toFixed(1)
                                                }
                                            />
                                            <Bar
                                                dataKey="media"
                                                name="Média atual"
                                                fill="#2c5aa0"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>

                        <section className="responsavel-desempenho-card">
                            <div className="form-section-title">
                                <FaClipboardList className="form-section-icon" />
                                <h2>Resumo por disciplina</h2>
                            </div>

                            {desempenhoPorDisciplina.length === 0 ? (
                                <p className="responsavel-feedback">
                                    Nenhum dado de desempenho encontrado.
                                </p>
                            ) : (
                                <div className="responsavel-table-wrapper">
                                    <table className="responsavel-table responsavel-desempenho-table">
                                        <thead>
                                            <tr>
                                                <th>Disciplina</th>
                                                <th>Média atual</th>
                                                <th>Situação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {desempenhoPorDisciplina.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.disciplina}</td>
                                                    <td>
                                                        <span className="responsavel-grade-badge">
                                                            {formatarNota(item.media)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`responsavel-status-badge ${obterClasseSituacao(
                                                                item.situacao
                                                            )}`}
                                                        >
                                                            {item.situacao}
                                                        </span>
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