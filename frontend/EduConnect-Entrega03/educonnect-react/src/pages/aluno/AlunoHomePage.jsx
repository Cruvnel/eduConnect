import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    CalendarDays,
    FileText,
    BarChart3,
    BadgeCheck,
    Monitor,
    TriangleAlert,
} from "lucide-react";
import { FaUser, FaMoon, FaSun, FaTimes } from "react-icons/fa";

import { listarPublicacoesAluno } from "../../services/alunoService";
import { obterUsuarioAtual } from "../../services/authService";

import "../../styles/global.css";
import "../../styles/header.css";
import "../../styles/profilemenu.css";
import "../../styles/dashboardcard.css";
import "../../styles/aluno.css";

import logoSplash from "../../assets/images/logo_splash.png";
import AppHeader from "../../components/header/AppHeader";
import ProfileMenu from "../../components/perfil/ProfileMenu";
import DashboardCard from "../../components/ui/DashboardCard";

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function AlunoHomePage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [publicacoes, setPublicacoes] = useState([]);
    const [publicacaoSelecionada, setPublicacaoSelecionada] = useState(null);

    const [carregandoPublicacoes, setCarregandoPublicacoes] = useState(true);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Aluno";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Aluno";

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

                // salva no localStorage (fallback)
                localStorage.setItem("nome", data.nome || "");
                localStorage.setItem("email", data.email || "");
                localStorage.setItem("perfil", data.perfil || "");
                localStorage.setItem("registro", data.registro || "");
            } catch (error) {
                console.error("Erro ao carregar usuário:", error.message);

                // fallback localStorage
                setUsuario({
                    nome: localStorage.getItem("nome") || "Aluno",
                    email: localStorage.getItem("email") || "email@educonnect.com",
                    registro: localStorage.getItem("registro") || "",
                    perfil: localStorage.getItem("perfil") || "Aluno",
                });
            }
        }

        carregarUsuario();
    }, []);

    useEffect(() => {
        async function carregarPublicacoes() {
            try {
                const data = await listarPublicacoesAluno();
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
                rota: "/aluno/agenda",
                iconClass: "calendar-icon",
                icon: <CalendarDays size={40} strokeWidth={2} />,
            },
            {
                titulo: "Materiais",
                rota: "/aluno/materiais",
                iconClass: "evaluations-icon",
                icon: <FileText size={40} strokeWidth={2} />,
            },
            {
                titulo: "Desempenho",
                rota: "/aluno/desempenho",
                iconClass: "performance-icon",
                icon: <BarChart3 size={40} strokeWidth={2} />,
            },
            {
                titulo: "Frequência",
                rota: "/aluno/frequencia",
                iconClass: "frequency-icon",
                icon: <BadgeCheck size={40} strokeWidth={2} />,
            },
            {
                titulo: "Boletim",
                rota: "/aluno/boletim",
                iconClass: "bulletin-icon",
                icon: <Monitor size={40} strokeWidth={2} />,
            },
            {
                titulo: "Ocorrências",
                rota: "/aluno/ocorrencias",
                iconClass: "occurrences-icon",
                icon: <TriangleAlert size={40} strokeWidth={2} />,
            },
        ],
        []
    );

    function fecharModal() {
        setPublicacaoSelecionada(null);
    }

    function handleLogout() {
        localStorage.clear();
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

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/aluno"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container aluno-home-container">
                <aside className="aluno-home-sidebar">
                    <div className="aluno-home-sidebar-header">
                        <h2>Comunicados</h2>
                    </div>

                    {erro && <p className="public-feedback-error">{erro}</p>}

                    {carregandoPublicacoes ? (
                        <p className="aluno-home-feedback">Carregando comunicados...</p>
                    ) : publicacoes.length === 0 ? (
                        <p className="aluno-home-feedback">Nenhum comunicado disponível.</p>
                    ) : (
                        <div className="aluno-home-publicacoes-list">
                            {publicacoes.map((publicacao, index) => (
                                <button
                                    key={publicacao.publicacaoId}
                                    type="button"
                                    className={`aluno-home-publicacao-item ${index === 0 ? "active" : ""}`}
                                    onClick={() => setPublicacaoSelecionada(publicacao)}
                                >
                                    <div className="aluno-home-publicacao-top">
                                        <h3>{publicacao.titulo || "Sem título"}</h3>
                                    </div>

                                    <p className="aluno-home-publicacao-date">
                                        {formatarDataHora(publicacao.dataPublicacao)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </aside>

                <main className="main-content aluno-home-main-content">
                    <div className="aluno-home-page-header">
                        <h1 className="page-title aluno-home-page-title">Dashboard</h1>
                    </div>

                    <div className="dashboard-grid aluno-home-dashboard-grid">
                        {cards.map((card) => (
                            <DashboardCard
                                key={card.rota}
                                to={card.rota}
                                title={card.titulo}
                                iconClass={card.iconClass}
                                icon={card.icon}
                            />
                        ))}
                    </div>
                </main>
            </div>

            {publicacaoSelecionada && (
                <div className="aluno-home-modal-overlay" onClick={fecharModal}>
                    <div
                        className="aluno-home-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="aluno-home-modal-header">
                            <div>
                                <h2>{publicacaoSelecionada.titulo || "Comunicado"}</h2>
                                <p>{formatarDataHora(publicacaoSelecionada.dataPublicacao)}</p>
                            </div>

                            <button
                                type="button"
                                className="aluno-home-modal-close"
                                onClick={fecharModal}
                                aria-label="Fechar"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="aluno-home-modal-body">
                            <p>{publicacaoSelecionada.mensagem || "-"}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}