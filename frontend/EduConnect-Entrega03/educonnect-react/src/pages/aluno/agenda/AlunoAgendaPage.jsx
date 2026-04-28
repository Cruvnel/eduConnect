import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMoon, FaSun, FaCalendarAlt } from "react-icons/fa";

import { listarAgendaAluno } from "../../../services/alunoService";
import { obterUsuarioAtual } from "../../../services/authService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/aluno.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import AgendaCalendario from "../../../components/agenda/AgendaCalendario";

export default function AlunoAgendaPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [eventos, setEventos] = useState([]);
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
            } catch (error) {
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
        async function carregarAgenda() {
            try {
                const data = await listarAgendaAluno();
                const lista = Array.isArray(data) ? data : [];

                lista.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento));
                setEventos(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar agenda.");
            } finally {
                setCarregando(false);
            }
        }

        carregarAgenda();
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
        { label: "Agenda" },
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
                homePath="/aluno"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container">
                <main className="main-content aluno-agenda-page">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="aluno-page-header">
                        <h1 className="page-title">Agenda</h1>
                    </div>

                    {erro && (
                        <div className="aluno-form-feedback">
                            <p className="public-feedback-error">{erro}</p>
                        </div>
                    )}

                    <section className="aluno-agenda-card">
                        <div className="form-section-title">
                            <FaCalendarAlt className="form-section-icon" />
                            <h2>Calendário de eventos</h2>
                        </div>

                        {carregando ? (
                            <p className="aluno-agenda-feedback">Carregando agenda...</p>
                        ) : eventos.length === 0 ? (
                            <p className="aluno-agenda-feedback">
                                Nenhum evento encontrado para sua turma.
                            </p>
                        ) : (
                            <div className="aluno-calendar-shell">
                                <AgendaCalendario eventos={eventos} />
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}