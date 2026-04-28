import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FolderClosed,
    UserPlus,
    GraduationCap,
    Upload,
    ChartLine,
    UserCog,
} from "lucide-react";
import { FaUser, FaMoon, FaSun } from "react-icons/fa";

import "../../styles/global.css";
import "../../styles/admin.css";
import "../../styles/header.css";
import "../../styles/dashboardcard.css";
import "../../styles/metriccard.css";
import "../../styles/profilemenu.css";

import logoSplash from "../../assets/images/logo_splash.png";

import AppHeader from "../../components/header/AppHeader";
import DashboardCard from "../../components/ui/DashboardCard";
import MetricCard from "../../components/ui/MetricCard";
import ProfileMenu from "../../components/perfil/ProfileMenu";
import { obterUsuarioAtual } from "../../services/authService";
import { obterDashboardAdmin } from "../../services/dashboardService";

export default function AdminHomePage() {
    const navigate = useNavigate();

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

    const [dashboard, setDashboard] = useState(null);
    const [carregandoDashboard, setCarregandoDashboard] = useState(true);
    const [erroDashboard, setErroDashboard] = useState("");

    const profileRef = useRef(null);

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    function formatarDecimal(valor) {
        const numero = Number(valor);
        if (Number.isNaN(numero)) return "-";
        return numero.toFixed(1);
    }

    function formatarPercentual(valor) {
        const numero = Number(valor);
        if (Number.isNaN(numero)) return "-";
        return `${numero.toFixed(1)}%`;
    }

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
            } catch (error) {
                console.error("Erro ao carregar usuário atual:", error.message);

                setUsuario({
                    nome: localStorage.getItem("nome") || "Usuário",
                    email: localStorage.getItem("email") || "email@educonnect.com",
                    registro: localStorage.getItem("registro") || "",
                    perfil: localStorage.getItem("perfil") || "Administrador",
                });
            }
        }

        carregarUsuario();
    }, []);

    useEffect(() => {
        async function carregarDashboard() {
            try {
                setErroDashboard("");
                const data = await obterDashboardAdmin();
                setDashboard(data);
            } catch (error) {
                setErroDashboard(error.message || "Erro ao carregar dashboard.");
            } finally {
                setCarregandoDashboard(false);
            }
        }

        carregarDashboard();
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

    const headerActions = useMemo(() => {
        return (
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
    }, [darkMode, profileOpen, usuario]);

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/admin"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container">
                <main className="main-content">
                    <h1 className="page-title">Dashboard</h1>

                    {erroDashboard && (
                        <p className="public-feedback-error">{erroDashboard}</p>
                    )}

                    <div className="metrics-grid">
                        <MetricCard
                            title="Turmas Ativas"
                            bigValue={
                                carregandoDashboard
                                    ? "..."
                                    : String(dashboard?.turmasAtivas ?? 0)
                            }
                            centered
                        />

                        <MetricCard
                            title="Média Geral"
                            lines={[
                                {
                                    label: "Fundamental:",
                                    value: carregandoDashboard
                                        ? "..."
                                        : formatarDecimal(dashboard?.mediaGeralFundamental),
                                },
                                {
                                    label: "Médio:",
                                    value: carregandoDashboard
                                        ? "..."
                                        : formatarDecimal(dashboard?.mediaGeralMedio),
                                },
                            ]}
                        />

                        <MetricCard
                            title="Taxa de Frequência"
                            lines={[
                                {
                                    label: "Fundamental:",
                                    value: carregandoDashboard
                                        ? "..."
                                        : formatarPercentual(
                                            dashboard?.frequenciaMediaFundamental
                                        ),
                                },
                                {
                                    label: "Médio:",
                                    value: carregandoDashboard
                                        ? "..."
                                        : formatarPercentual(
                                            dashboard?.frequenciaMediaMedio
                                        ),
                                },
                            ]}
                        />

                        <MetricCard
                            title="Taxa de Aprovação"
                            lines={[
                                {
                                    label: "Fundamental:",
                                    value: carregandoDashboard
                                        ? "..."
                                        : formatarPercentual(
                                            dashboard?.taxaAprovacaoFundamental
                                        ),
                                },
                                {
                                    label: "Médio:",
                                    value: carregandoDashboard
                                        ? "..."
                                        : formatarPercentual(
                                            dashboard?.taxaAprovacaoMedio
                                        ),
                                },
                            ]}
                        />
                    </div>

                    <div className="metrics-divider" />

                    <div className="dashboard-grid">
                        <DashboardCard
                            to="/admin/matricula"
                            title="Matrícula"
                            iconClass="closed-folder"
                            icon={<FolderClosed size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/admin/cadastro"
                            title="Cadastro"
                            iconClass="user-plus"
                            icon={<UserPlus size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/admin/turmas"
                            title="Turmas"
                            iconClass="graduation-cap"
                            icon={<GraduationCap size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/admin/publicacoes"
                            title="Publicações"
                            iconClass="upload"
                            icon={<Upload size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/admin/relatorios"
                            title="Relatórios"
                            iconClass="chart-line"
                            icon={<ChartLine size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/admin/ajustes"
                            title="Ajustes"
                            iconClass="user-config"
                            icon={<UserCog size={40} strokeWidth={2} />}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}