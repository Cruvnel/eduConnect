import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CheckCheck,
    FileText,
    CalendarDays,
    CalendarClock,
    ChartNoAxesColumn,
    TriangleAlert,
} from "lucide-react";
import { FaUser, FaMoon, FaSun } from "react-icons/fa";

import "../../styles/global.css";
import "../../styles/header.css";
import "../../styles/dashboardcard.css";
import "../../styles/profilemenu.css";
import "../../styles/professor.css";
import "../../styles/notification.css";

import logoSplash from "../../assets/images/logo_splash.png";

import AppHeader from "../../components/header/AppHeader";
import DashboardCard from "../../components/ui/DashboardCard";
import ProfileMenu from "../../components/perfil/ProfileMenu";
import AssistenteVirtual from "../../components/assistente/AssistenteVirtual";
import { obterUsuarioAtual } from "../../services/authService";
import NotificationMenu from "../../components/notificacoes/NotificationMenu";

export default function ProfessorHomePage() {
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

    const profileRef = useRef(null);

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
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
                    nome: localStorage.getItem("nome") || "Professor",
                    email: localStorage.getItem("email") || "email@educonnect.com",
                    registro: localStorage.getItem("registro") || "",
                    perfil: localStorage.getItem("perfil") || "Professor",
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
                homePath="/professor"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container">
                <main className="main-content">
                    <h1 className="page-title">Dashboard</h1>

                    <div className="dashboard-grid">
                        <DashboardCard
                            to="/professor/turmas"
                            title="Turmas"
                            iconClass="frequency-icon"
                            icon={<CheckCheck size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/professor/materiais"
                            title="Materiais"
                            iconClass="evaluations-icon"
                            icon={<FileText size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/professor/agenda"
                            title="Agenda"
                            iconClass="calendar-icon"
                            icon={<CalendarDays size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/professor/frequencia"
                            title="Chamada"
                            iconClass="performance-icon"
                            icon={<CalendarClock size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/professor/notas"
                            title="Notas"
                            iconClass="bulletin-icon"
                            icon={<ChartNoAxesColumn size={40} strokeWidth={2} />}
                        />

                        <DashboardCard
                            to="/professor/ocorrencias"
                            title="Ocorrências"
                            iconClass="occurrences-icon"
                            icon={<TriangleAlert size={40} strokeWidth={2} />}
                        />
                    </div>
                </main>
            </div>

            <AssistenteVirtual />
        </>
    );
}