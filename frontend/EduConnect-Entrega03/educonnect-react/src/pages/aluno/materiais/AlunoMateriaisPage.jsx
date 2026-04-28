import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaBookOpen,
    FaDownload,
    FaFilePdf,
} from "react-icons/fa";

import { listarMateriaisAluno } from "../../../services/alunoService";
import { obterUsuarioAtual } from "../../../services/authService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/button.css";
import "../../../styles/select.css";
import "../../../styles/aluno.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";

const API_ORIGIN = "http://localhost:5267";

function montarUrlArquivo(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_ORIGIN}${url}`;
}

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function AlunoMateriaisPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [materiais, setMateriais] = useState([]);
    const [disciplinaFiltro, setDisciplinaFiltro] = useState("");

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
        async function carregarMateriais() {
            try {
                const data = await listarMateriaisAluno();
                const lista = Array.isArray(data) ? data : [];

                lista.sort((a, b) => new Date(b.dataPublicacao) - new Date(a.dataPublicacao));
                setMateriais(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar materiais.");
            } finally {
                setCarregando(false);
            }
        }

        carregarMateriais();
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

    const disciplinas = useMemo(() => {
        const nomes = materiais
            .map((material) => material.disciplinaNome)
            .filter(Boolean);

        return [...new Set(nomes)].sort((a, b) => a.localeCompare(b));
    }, [materiais]);

    const materiaisFiltrados = useMemo(() => {
        if (!disciplinaFiltro) return materiais;

        return materiais.filter(
            (material) =>
                String(material.disciplinaNome).toLowerCase() ===
                String(disciplinaFiltro).toLowerCase()
        );
    }, [materiais, disciplinaFiltro]);

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
        { label: "Materiais" },
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
                <main className="main-content aluno-materiais-page">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="aluno-page-header">
                        <h1 className="page-title aluno-page-title">Materiais</h1>
                        <p className="aluno-page-subtitle">
                            Visualize e baixe os materiais disponibilizados pelos professores.
                        </p>
                    </div>

                    {erro && (
                        <div className="aluno-form-feedback">
                            <p className="public-feedback-error">{erro}</p>
                        </div>
                    )}
                    <div className="aluno-materiais-filter-clean">
                        <Select
                            id="disciplinaFiltro"
                            value={disciplinaFiltro}
                            onChange={(e) => setDisciplinaFiltro(e.target.value)}
                        >
                            <option value="">Todas as disciplinas</option>
                            {disciplinas.map((disciplina) => (
                                <option key={disciplina} value={disciplina}>
                                    {disciplina}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <section className="aluno-materiais-list-card">
                        <div className="form-section-title">
                            <FaBookOpen className="form-section-icon" />
                            <h2>Materiais publicados</h2>
                        </div>

                        {carregando ? (
                            <p className="aluno-materiais-feedback">Carregando materiais...</p>
                        ) : materiaisFiltrados.length === 0 ? (
                            <p className="aluno-materiais-feedback">
                                Nenhum material encontrado.
                            </p>
                        ) : (
                            <div className="aluno-materiais-grid">
                                {materiaisFiltrados.map((material) => {
                                    const materialId = material.materialApoioId || material.materialId;
                                    const arquivoUrl = montarUrlArquivo(material.arquivoUrl);

                                    return (
                                        <article key={materialId} className="aluno-material-card">
                                            <div className="aluno-material-card-top">
                                                <div className="aluno-material-icon">
                                                    <FaFilePdf />
                                                </div>

                                                <div className="aluno-material-header-text">
                                                    <h3>{material.titulo || "Sem título"}</h3>
                                                    <span className="aluno-material-disciplina">
                                                        {material.disciplinaNome || "-"}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="aluno-material-descricao">
                                                {material.descricao || "Sem descrição."}
                                            </p>

                                            <div className="aluno-material-footer">
                                                <span className="aluno-material-data">
                                                    {formatarDataHora(material.dataPublicacao)}
                                                </span>

                                                {material.arquivoUrl ? (
                                                    <a
                                                        href={arquivoUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        download
                                                        className="aluno-material-download-link"
                                                    >
                                                        <Button type="button" variant="primary">
                                                            <FaDownload />
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    <span className="aluno-material-sem-arquivo">
                                                        Arquivo indisponível
                                                    </span>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}