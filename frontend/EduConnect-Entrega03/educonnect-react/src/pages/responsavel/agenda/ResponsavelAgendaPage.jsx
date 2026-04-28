import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaCalendarAlt,
} from "react-icons/fa";

import { listarAgendaResponsavel } from "../../../services/responsavelService";
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
import AgendaCalendario from "../../../components/agenda/AgendaCalendario";

export default function ResponsavelAgendaPage() {
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

    const [eventos, setEventos] = useState([]);
    const [carregandoAgenda, setCarregandoAgenda] = useState(false);
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
        async function carregarAgenda() {
            if (!alunoSelecionadoId) {
                setEventos([]);
                return;
            }

            setErro("");
            setCarregandoAgenda(true);

            try {
                const data = await listarAgendaResponsavel(alunoSelecionadoId);
                const lista = Array.isArray(data) ? data : [];

                lista.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento));
                setEventos(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar agenda.");
                setEventos([]);
            } finally {
                setCarregandoAgenda(false);
            }
        }

        carregarAgenda();
    }, [alunoSelecionadoId]);

    const erroGeral = useMemo(() => erro || erroAlunos, [erro, erroAlunos]);

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

    const alunoEmFoco = alunoSelecionado;

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/responsavel"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-content responsavel-agenda-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="responsavel-page-header">
                    <h1 className="page-title">Agenda</h1>
                    <p className="responsavel-page-subtitle">
                        Visualize os eventos publicados para o aluno em foco.
                    </p>
                </div>

                {erroGeral && (
                    <div className="responsavel-form-feedback">
                        <p className="public-feedback-error">{erroGeral}</p>
                    </div>
                )}

                {(carregandoAlunos || carregandoAgenda) ? (
                    <p className="responsavel-agenda-feedback">Carregando agenda...</p>
                ) : !alunoSelecionado ? (
                    <section className="responsavel-agenda-focus-card">
                        <p className="responsavel-agenda-feedback">
                            Selecione um aluno na página inicial do responsável.
                        </p>
                    </section>
                ) : (
                    <>
                        {alunos.length > 1 && alunoEmFoco && (
                            <section className="responsavel-agenda-focus-card responsavel-home-focus-card">
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

                        <section className="responsavel-agenda-calendar-card">
                            <div className="form-section-title">
                                <FaCalendarAlt className="form-section-icon" />
                                <h2>Calendário de eventos</h2>
                            </div>

                            {eventos.length === 0 ? (
                                <p className="responsavel-agenda-feedback">
                                    Nenhum evento encontrado para o aluno em foco.
                                </p>
                            ) : (
                                <div className="responsavel-calendar-shell">
                                    <AgendaCalendario eventos={eventos} />
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </>
    );
}