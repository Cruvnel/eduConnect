import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaWallet,
    FaUserGraduate,
    FaFileInvoiceDollar,
    FaCalendarAlt,
} from "react-icons/fa";

import { listarFinanceiroResponsavel } from "../../../services/responsavelService";
import { obterUsuarioAtual } from "../../../services/authService";
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

function formatarMoeda(valor) {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return "R$ 0,00";

    return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function formatarData(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("pt-BR");
}

function obterClasseStatus(status) {
    const valor = String(status || "").toLowerCase();

    if (valor.includes("pago")) return "is-pago";
    if (valor.includes("pendente")) return "is-pendente";
    if (valor.includes("atras")) return "is-atrasado";

    return "is-neutro";
}

export default function ResponsavelFinanceiroPage() {
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

    const [financeiro, setFinanceiro] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const [usuario, setUsuario] = useState({
        nome: "",
        email: "",
        registro: "",
        perfil: "",
    });

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const data = await obterUsuarioAtual();

                setUsuario({
                    nome: data.nome || "",
                    email: data.email || "",
                    registro: data.registro || "",
                    perfil: data.perfil || "",
                });

                localStorage.setItem("nome", data.nome || "");
                localStorage.setItem("email", data.email || "");
                localStorage.setItem("perfil", data.perfil || "");
                localStorage.setItem("registro", data.registro || "");
            } catch {
                setUsuario({
                    nome: localStorage.getItem("nome") || "Responsável",
                    email: localStorage.getItem("email") || "email@educonnect.com",
                    registro: localStorage.getItem("registro") || "",
                    perfil: localStorage.getItem("perfil") || "Responsável",
                });
            }
        }

        carregarUsuario();
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

    useEffect(() => {
        async function carregarFinanceiro() {
            try {
                const data = await listarFinanceiroResponsavel();
                const lista = Array.isArray(data?.itens) ? data.itens : [];
                setFinanceiro(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar financeiro.");
            } finally {
                setCarregando(false);
            }
        }

        carregarFinanceiro();
    }, []);

    const financeiroDoAlunoSelecionado = useMemo(() => {
        if (!alunoSelecionadoId) return [];

        return financeiro.filter(
            (item) => String(item.alunoId) === String(alunoSelecionadoId)
        );
    }, [financeiro, alunoSelecionadoId]);

    const financeiroOrdenado = useMemo(() => {
        return [...financeiroDoAlunoSelecionado].sort((a, b) => {
            const competenciaA = String(a.competencia || "");
            const competenciaB = String(b.competencia || "");
            return competenciaB.localeCompare(competenciaA);
        });
    }, [financeiroDoAlunoSelecionado]);

    const resumo = useMemo(() => {
        const totalMensalidades = financeiroDoAlunoSelecionado.length;

        const valorTotal = financeiroDoAlunoSelecionado.reduce(
            (acc, item) => acc + (Number(item.valor) || 0),
            0
        );

        const pendentes = financeiroDoAlunoSelecionado.filter((item) =>
            String(item.statusPagamento || "").toLowerCase().includes("pendente")
        ).length;

        return {
            totalMensalidades,
            valorTotal,
            pendentes,
        };
    }, [financeiroDoAlunoSelecionado]);

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
        { label: "Financeiro" },
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
                    nome={usuario.nome}
                    email={usuario.email}
                    perfil={usuario.perfil}
                    registro={usuario.registro}
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

            <main className="main-content responsavel-financeiro-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="responsavel-page-header">
                    <h1 className="page-title">Financeiro</h1>
                    <p className="responsavel-page-subtitle">
                        Acompanhe as mensalidades do aluno em foco.
                    </p>
                </div>

                {erroGeral && (
                    <div className="responsavel-form-feedback">
                        <p className="public-feedback-error">{erroGeral}</p>
                    </div>
                )}

                {(carregando || carregandoAlunos) ? (
                    <p className="responsavel-financeiro-feedback">
                        Carregando financeiro...
                    </p>
                ) : !alunoSelecionado ? (
                    <section className="responsavel-financeiro-focus-card">
                        <div className="form-section-title">
                            <FaUserGraduate className="form-section-icon" />
                            <h2>Aluno em foco</h2>
                        </div>

                        <p className="responsavel-financeiro-feedback">
                            Selecione um aluno na página inicial do responsável.
                        </p>
                    </section>
                ) : (
                    <>
                        {deveMostrarAlunoEmFoco && (
                            <section className="responsavel-financeiro-focus-card responsavel-home-focus-card">
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

                        <section className="responsavel-financeiro-summary-grid">
                            <article className="responsavel-financeiro-summary-card">
                                <div className="responsavel-financeiro-summary-icon">
                                    <FaFileInvoiceDollar />
                                </div>
                                <div>
                                    <span>Total de mensalidades</span>
                                    <strong>{resumo.totalMensalidades}</strong>
                                </div>
                            </article>

                            <article className="responsavel-financeiro-summary-card">
                                <div className="responsavel-financeiro-summary-icon">
                                    <FaWallet />
                                </div>
                                <div>
                                    <span>Valor total previsto</span>
                                    <strong>{formatarMoeda(resumo.valorTotal)}</strong>
                                </div>
                            </article>

                            <article className="responsavel-financeiro-summary-card">
                                <div className="responsavel-financeiro-summary-icon">
                                    <FaCalendarAlt />
                                </div>
                                <div>
                                    <span>Mensalidades pendentes</span>
                                    <strong>{resumo.pendentes}</strong>
                                </div>
                            </article>
                        </section>

                        <section className="responsavel-financeiro-table-card">
                            <div className="form-section-title">
                                <FaWallet className="form-section-icon" />
                                <h2>Mensalidades</h2>
                            </div>

                            {financeiroOrdenado.length === 0 ? (
                                <p className="responsavel-financeiro-feedback">
                                    Nenhum registro financeiro encontrado para o aluno em foco.
                                </p>
                            ) : (
                                <div className="responsavel-table-wrapper">
                                    <table className="responsavel-table responsavel-financeiro-table">
                                        <thead>
                                            <tr>
                                                <th>Competência</th>
                                                <th>Valor</th>
                                                <th>Status</th>
                                                <th>Vencimento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {financeiroOrdenado.map((item) => (
                                                <tr key={item.mensalidadeId}>
                                                    <td>{item.competencia || "-"}</td>
                                                    <td>{formatarMoeda(item.valor)}</td>
                                                    <td>
                                                        <span
                                                            className={`responsavel-financeiro-status-badge ${obterClasseStatus(
                                                                item.statusPagamento
                                                            )}`}
                                                        >
                                                            {item.statusPagamento || "-"}
                                                        </span>
                                                    </td>
                                                    <td>{formatarData(item.dataVencimento)}</td>
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