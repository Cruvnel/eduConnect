import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    Wallet,
    BarChart3,
    BadgeCheck,
    Monitor,
    TriangleAlert,
} from "lucide-react";
import { FaUser, FaMoon, FaSun, FaTimes } from "react-icons/fa";

import { listarPublicacoesResponsavel } from "../../services/responsavelService";
import { useResponsavelAluno } from "../../contexts/ResponsavelAlunoContext";
import { obterUsuarioAtual } from "../../services/authService";

import "../../styles/global.css";
import "../../styles/header.css";
import "../../styles/profilemenu.css";
import "../../styles/dashboardcard.css";
import "../../styles/select.css";
import "../../styles/responsavel.css";

import logoSplash from "../../assets/images/logo_splash.png";

import AppHeader from "../../components/header/AppHeader";
import ProfileMenu from "../../components/perfil/ProfileMenu";
import DashboardCard from "../../components/ui/DashboardCard";
import Select from "../../components/ui/Select";

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function ResponsavelHomePage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const {
        alunos,
        alunoSelecionado,
        alunoSelecionadoId,
        selecionarAluno,
        carregandoAlunos,
        erroAlunos,
        obterNomeAluno,
    } = useResponsavelAluno();

    const [publicacoes, setPublicacoes] = useState([]);
    const [publicacaoSelecionada, setPublicacaoSelecionada] = useState(null);
    const [carregandoPublicacoes, setCarregandoPublicacoes] = useState(true);
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
        async function carregarPublicacoes() {
            try {
                const data = await listarPublicacoesResponsavel();
                const lista = Array.isArray(data) ? data : [];

                lista.sort((a, b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));
                setPublicacoes(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar comunicados.");
            } finally {
                setCarregandoPublicacoes(false);
            }
        }

        carregarPublicacoes();
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

    const cards = useMemo(
        () => [
            {
                titulo: "Agenda",
                rota: "/responsavel/agenda",
                iconClass: "calendar-icon",
                icon: <CalendarDays size={40} strokeWidth={2} />,
            },
            {
                titulo: "Financeiro",
                rota: "/responsavel/financeiro",
                iconClass: "financial-icon",
                icon: <Wallet size={40} strokeWidth={2} />,
            },
            {
                titulo: "Desempenho",
                rota: "/responsavel/desempenho",
                iconClass: "performance-icon",
                icon: <BarChart3 size={40} strokeWidth={2} />,
            },
            {
                titulo: "Frequência",
                rota: "/responsavel/frequencia",
                iconClass: "frequency-icon",
                icon: <BadgeCheck size={40} strokeWidth={2} />,
            },
            {
                titulo: "Boletim",
                rota: "/responsavel/boletim",
                iconClass: "bulletin-icon",
                icon: <Monitor size={40} strokeWidth={2} />,
            },
            {
                titulo: "Ocorrências",
                rota: "/responsavel/ocorrencia",
                iconClass: "occurrences-icon",
                icon: <TriangleAlert size={40} strokeWidth={2} />,
            },
        ],
        []
    );

    const podeAcessarFuncionalidades = alunoSelecionadoId || alunos.length === 1;
    const erroGeral = erro || erroAlunos;

    function fecharModal() {
        setPublicacaoSelecionada(null);
    }

    function handleLogout() {
        localStorage.clear();
        localStorage.removeItem("responsavel_aluno_em_foco");
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
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

    const alunoEmFoco = alunos.length === 1 ? alunos[0] : alunoSelecionado;

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/responsavel"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container responsavel-home-container">
                <aside className="responsavel-home-sidebar">
                    <div className="responsavel-home-sidebar-header">
                        <h2>Comunicados</h2>
                    </div>

                    {erroGeral && <p className="public-feedback-error">{erroGeral}</p>}

                    {carregandoPublicacoes ? (
                        <p className="responsavel-home-feedback">Carregando comunicados...</p>
                    ) : publicacoes.length === 0 ? (
                        <p className="responsavel-home-feedback">Nenhum comunicado disponível.</p>
                    ) : (
                        <div className="responsavel-home-publicacoes-list">
                            {publicacoes.map((publicacao, index) => (
                                <button
                                    key={publicacao.publicacaoId}
                                    type="button"
                                    className={`responsavel-home-publicacao-item ${index === 0 ? "active" : ""}`}
                                    onClick={() => setPublicacaoSelecionada(publicacao)}
                                >
                                    <div className="responsavel-home-publicacao-top">
                                        <h3>{publicacao.titulo || "Sem título"}</h3>
                                    </div>

                                    <p className="responsavel-home-publicacao-date">
                                        {formatarDataHora(publicacao.dataPublicacao)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                <main className="main-content responsavel-home-main-content">
                    <div className="responsavel-home-page-header">
                        <h1 className="page-title responsavel-home-page-title">
                            Dashboard
                        </h1>
                    </div>

                    <section className="responsavel-home-focus-card">
                        {carregandoAlunos ? (
                            <p className="responsavel-home-feedback">Carregando alunos vinculados...</p>
                        ) : alunos.length === 0 ? (
                            <p className="responsavel-home-feedback">Nenhum aluno vinculado encontrado.</p>
                        ) : (
                            <div className="responsavel-home-focus-compact">
                                <div className="responsavel-home-focus-compact-header">
                                    <span className="responsavel-home-focus-label">Aluno em foco</span>
                                </div>

                                {alunos.length > 1 && (
                                    <div className="responsavel-home-focus-field">
                                        <Select
                                            id="alunoSelecionado"
                                            label={null}
                                            value={alunoSelecionadoId}
                                            onChange={(e) => selecionarAluno(e.target.value)}
                                        >
                                            <option value="">Selecione um aluno</option>
                                            {alunos.map((aluno) => (
                                                <option key={aluno.alunoId} value={aluno.alunoId}>
                                                    {obterNomeAluno(aluno)}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                )}

                                {alunoEmFoco && (
                                    <div className="responsavel-home-focus-inline-info">
                                        <span>{obterNomeAluno(alunoEmFoco)}</span>
                                        <span>Registro: {alunoEmFoco.registro || "-"}</span>
                                        <span>Sala: {alunoEmFoco.sala || alunoEmFoco.turmaNome || "-"}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <div className="dashboard-grid responsavel-home-dashboard-grid">
                        {cards.map((card) => (
                            <div
                                key={card.rota}
                                className={!podeAcessarFuncionalidades ? "responsavel-home-card-disabled" : ""}
                            >
                                <DashboardCard
                                    to={podeAcessarFuncionalidades ? card.rota : "#"}
                                    title={card.titulo}
                                    iconClass={card.iconClass}
                                    icon={card.icon}
                                />
                            </div>
                        ))}
                    </div>

                    {!podeAcessarFuncionalidades && alunos.length > 1 && (
                        <p className="responsavel-home-feedback">
                            Selecione um aluno para habilitar as funcionalidades.
                        </p>
                    )}
                </main>
            </div>

            {publicacaoSelecionada && (
                <div
                    className="responsavel-home-modal-overlay"
                    onClick={fecharModal}
                >
                    <div
                        className="responsavel-home-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="responsavel-home-modal-header">
                            <div>
                                <h2>{publicacaoSelecionada.titulo || "Comunicado"}</h2>
                                <p>{formatarDataHora(publicacaoSelecionada.dataPublicacao)}</p>
                            </div>

                            <button
                                type="button"
                                className="responsavel-home-modal-close"
                                onClick={fecharModal}
                                aria-label="Fechar"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="responsavel-home-modal-body">
                            <p>{publicacaoSelecionada.mensagem || "-"}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}