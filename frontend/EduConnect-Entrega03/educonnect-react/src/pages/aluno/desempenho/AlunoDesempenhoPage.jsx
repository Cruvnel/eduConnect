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
    Cell,
} from "recharts";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaChartBar,
    FaTable,
    FaBookOpen,
    FaCheckCircle,
    FaCalculator,
} from "react-icons/fa";

import { obterBoletimAluno } from "../../../services/alunoService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/aluno.css";

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

function obterCorBarra(media) {
    if (media === null || media === undefined) return "#9fbfe8";
    if (media >= 8) return "#2c5aa0";
    if (media >= 6) return "#4f86d9";
    return "#8db8f2";
}

export default function AlunoDesempenhoPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [boletim, setBoletim] = useState([]);
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
        async function carregarDesempenho() {
            try {
                const data = await obterBoletimAluno();

                const lista = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.disciplinas)
                        ? data.disciplinas
                        : [];

                setBoletim(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar desempenho.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDesempenho();
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
                homePath="/aluno"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-content aluno-desempenho-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="aluno-page-header">
                    <h1 className="page-title aluno-page-title">Desempenho</h1>
                    <p className="aluno-page-subtitle">
                        Acompanhe sua evolução por disciplina e consulte sua média geral.
                    </p>
                </div>

                {erro && <p className="public-feedback-error">{erro}</p>}

                {carregando ? (
                    <p className="aluno-feedback">Carregando desempenho...</p>
                ) : (
                    <>
                        <section className="aluno-desempenho-summary-grid">
                            <div className="aluno-desempenho-summary-card">
                                <div className="aluno-desempenho-summary-icon">
                                    <FaBookOpen />
                                </div>
                                <div>
                                    <span>Disciplinas</span>
                                    <strong>{resumoGeral.quantidadeDisciplinas}</strong>
                                </div>
                            </div>

                            <div className="aluno-desempenho-summary-card">
                                <div className="aluno-desempenho-summary-icon">
                                    <FaCheckCircle />
                                </div>
                                <div>
                                    <span>Aprovadas</span>
                                    <strong>{resumoGeral.aprovadas}</strong>
                                </div>
                            </div>

                            <div className="aluno-desempenho-summary-card">
                                <div className="aluno-desempenho-summary-icon">
                                    <FaCalculator />
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

                        <section className="aluno-desempenho-card">
                            <div className="form-section-title">
                                <FaChartBar className="form-section-icon" />
                                <h2>Média por disciplina</h2>
                            </div>

                            {desempenhoPorDisciplina.length === 0 ? (
                                <p className="aluno-feedback">
                                    Nenhum dado de desempenho encontrado.
                                </p>
                            ) : (
                                <div className="aluno-desempenho-chart-box">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={desempenhoPorDisciplina}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="disciplina"
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={12}
                                            />
                                            <YAxis
                                                domain={[0, 10]}
                                                tickLine={false}
                                                axisLine={false}
                                                fontSize={12}
                                            />
                                            <Tooltip
                                                formatter={(value) =>
                                                    value === null || value === undefined
                                                        ? "-"
                                                        : Number(value).toFixed(1)
                                                }
                                            />
                                            <Bar
                                                dataKey="media"
                                                radius={[8, 8, 0, 0]}
                                                name="Média"
                                            >
                                                {desempenhoPorDisciplina.map((item) => (
                                                    <Cell
                                                        key={item.id}
                                                        fill={obterCorBarra(item.media)}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>

                        <section className="aluno-desempenho-card">
                            <div className="form-section-title">
                                <FaTable className="form-section-icon" />
                                <h2>Resumo por disciplina</h2>
                            </div>

                            {desempenhoPorDisciplina.length === 0 ? (
                                <p className="aluno-feedback">
                                    Nenhum dado de desempenho encontrado.
                                </p>
                            ) : (
                                <div className="aluno-table-wrapper">
                                    <table className="aluno-table aluno-desempenho-table">
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
                                                        <span className="aluno-grade-badge">
                                                            {formatarNota(item.media)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`aluno-status-badge ${obterClasseSituacao(item.situacao)}`}
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