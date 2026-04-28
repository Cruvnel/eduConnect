import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMoon, FaSun, FaFilePdf } from "react-icons/fa";

import {
    listarMinhasTurmasProfessor,
    baixarRelatorioNotasMinhasTurmasPdf,
} from "../../../services/professorTurmaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/professor.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function ProfessorTurmasListPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [resposta, setResposta] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [baixandoPdf, setBaixandoPdf] = useState(false);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Professor";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Professor";

    const breadcrumbItems = [
        { label: "Home", path: "/professor" },
        { label: "Turmas" },
    ];

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const data = await listarMinhasTurmasProfessor();
                setResposta(data);
            } catch (error) {
                setErro(error.message || "Erro ao carregar turmas.");
            } finally {
                setCarregando(false);
            }
        }

        carregarTurmas();
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

    const turmas = useMemo(() => {
        if (!resposta) return [];
        if (Array.isArray(resposta)) return resposta;
        if (Array.isArray(resposta.turmas)) return resposta.turmas;
        return [];
    }, [resposta]);

    async function handleBaixarPdf() {
        setErro("");
        setBaixandoPdf(true);

        try {
            await baixarRelatorioNotasMinhasTurmasPdf();
        } catch (error) {
            setErro(error.message || "Erro ao gerar relatório.");
        } finally {
            setBaixandoPdf(false);
        }
    }

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    function formatarTituloTurma(turma) {
        const partes = [turma.turmaNome || turma.nome];

        if (turma.anoLetivo) {
            partes.push(String(turma.anoLetivo));
        }

        return partes.filter(Boolean).join(" | ");
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
                homePath="/professor"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container">
                <main className="main-content professor-turmas-main-content">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="professor-turmas-page-header">
                        <div>
                            <h1 className="page-title professor-turmas-page-title">
                                Minhas Turmas
                            </h1>
                            <p className="professor-turmas-page-subtitle">
                                Visualize as turmas vinculadas e acesse rapidamente seus detalhes.
                            </p>
                        </div>

                        <div className="professor-turmas-page-actions">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleBaixarPdf}
                                disabled={baixandoPdf}
                            >
                                <FaFilePdf />
                                {baixandoPdf ? "Gerando PDF..." : "  Emitir relatório em PDF"}
                            </Button>
                        </div>
                    </div>

                    {carregando && (
                        <p className="professor-turmas-feedback">Carregando turmas...</p>
                    )}

                    {!carregando && erro && (
                        <p className="public-feedback-error">{erro}</p>
                    )}

                    {!carregando && !erro && turmas.length === 0 && (
                        <p className="professor-turmas-feedback">
                            Nenhuma turma vinculada ao professor.
                        </p>
                    )}

                    {!carregando && !erro && turmas.length > 0 && (
                        <section className="professor-turmas-section">
                            <h2 className="professor-turmas-section-title">Turmas Vinculadas</h2>

                            <div className="professor-turmas-list">
                                {turmas.map((turma, index) => (
                                    <div
                                        key={turma.turmaId || index}
                                        className="professor-turma-card"
                                    >
                                        <h3>{formatarTituloTurma(turma)}</h3>

                                        <div className="professor-turma-card-meta">
                                            <span>
                                                <strong>Disciplina:</strong>{" "}
                                                {turma.disciplinaNome || "-"}
                                            </span>

                                            <span>
                                                <strong>Sala:</strong>{" "}
                                                {turma.sala || "-"}
                                            </span>
                                        </div>

                                        <div className="professor-turma-card-actions">
                                            <Button
                                                type="button"
                                                variant="primary"
                                                onClick={() =>
                                                    navigate(`/professor/turmas/${turma.turmaId}`, {
                                                        state: { turma },
                                                    })
                                                }
                                            >
                                                Abrir Turma
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </>
    );
}