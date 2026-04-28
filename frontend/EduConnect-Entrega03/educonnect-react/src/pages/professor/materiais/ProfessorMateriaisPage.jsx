import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaBookOpen,
    FaUpload,
    FaTrash,
    FaFilePdf,
    FaLink,
} from "react-icons/fa";

import { listarMinhasTurmasProfessor } from "../../../services/professorTurmaService";
import {
    listarMateriaisPorTurma,
    criarMaterial,
    excluirMaterial,
} from "../../../services/materiaisService";
import { uploadMaterial } from "../../../services/uploadService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/select.css";
import "../../../styles/textarea.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/professor.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";

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

export default function ProfessorMateriaisPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [respostaTurmas, setRespostaTurmas] = useState(null);
    const [turmaId, setTurmaId] = useState("");

    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [arquivo, setArquivo] = useState(null);

    const [materiais, setMateriais] = useState([]);

    const [carregandoTurmas, setCarregandoTurmas] = useState(true);
    const [carregandoMateriais, setCarregandoMateriais] = useState(false);
    const [enviandoArquivo, setEnviandoArquivo] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [excluindoId, setExcluindoId] = useState(null);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Professor";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Professor";

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const data = await listarMinhasTurmasProfessor();
                setRespostaTurmas(data);
            } catch (error) {
                setErro(error.message || "Erro ao carregar turmas.");
            } finally {
                setCarregandoTurmas(false);
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
        if (!respostaTurmas) return [];
        if (Array.isArray(respostaTurmas)) return respostaTurmas;
        if (Array.isArray(respostaTurmas.turmas)) return respostaTurmas.turmas;
        return [];
    }, [respostaTurmas]);

    const turmaSelecionada = useMemo(() => {
        return turmas.find((turma) => Number(turma.turmaId) === Number(turmaId));
    }, [turmas, turmaId]);

    async function carregarMateriaisTurma(idTurma) {
        if (!idTurma) {
            setMateriais([]);
            return;
        }

        setCarregandoMateriais(true);
        setErro("");
        setSucesso("");

        try {
            const data = await listarMateriaisPorTurma(idTurma);
            setMateriais(Array.isArray(data) ? data : []);
        } catch (error) {
            setErro(error.message || "Erro ao carregar materiais.");
            setMateriais([]);
        } finally {
            setCarregandoMateriais(false);
        }
    }

    useEffect(() => {
        carregarMateriaisTurma(turmaId);
    }, [turmaId]);

    function limparFormulario() {
        setTitulo("");
        setDescricao("");
        setArquivo(null);

        const inputArquivo = document.getElementById("arquivoMaterial");
        if (inputArquivo) {
            inputArquivo.value = "";
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!turmaId) {
            setErro("Selecione uma turma.");
            return;
        }

        if (!titulo.trim()) {
            setErro("Informe o título do material.");
            return;
        }

        if (!arquivo) {
            setErro("Selecione um arquivo para upload.");
            return;
        }

        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            setEnviandoArquivo(true);
            const uploadResponse = await uploadMaterial(arquivo);
            setEnviandoArquivo(false);

            await criarMaterial({
                turmaId: Number(turmaId),
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                arquivoUrl: uploadResponse.url,
            });

            setSucesso("Material publicado com sucesso.");
            limparFormulario();
            await carregarMateriaisTurma(turmaId);
        } catch (error) {
            setErro(error.message || "Erro ao publicar material.");
        } finally {
            setEnviandoArquivo(false);
            setSalvando(false);
        }
    }

    async function handleExcluirMaterial(materialId) {
        setErro("");
        setSucesso("");
        setExcluindoId(materialId);

        try {
            await excluirMaterial(materialId);
            setSucesso("Material removido com sucesso.");
            await carregarMateriaisTurma(turmaId);
        } catch (error) {
            setErro(error.message || "Erro ao remover material.");
        } finally {
            setExcluindoId(null);
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

    const breadcrumbItems = [
        { label: "Home", path: "/professor" },
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
                <main className="main-content professor-materiais-page">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="professor-page-header">
                        <h1 className="page-title">Materiais da Turma</h1>
                        <p className="professor-page-subtitle">
                            Publique materiais em PDF e acompanhe os arquivos já enviados para cada turma.
                        </p>
                    </div>

                    {(erro || sucesso) && (
                        <div className="professor-form-feedback">
                            {erro && <p className="public-feedback-error">{erro}</p>}
                            {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                        </div>
                    )}

                    <section className="professor-materiais-card">
                        <div className="professor-materiais-grid">
                            <div className="professor-materiais-form-column">
                                <div className="form-section-title">
                                    <FaUpload className="form-section-icon" />
                                    <h2>Publicar Material</h2>
                                </div>

                                {carregandoTurmas ? (
                                    <p className="professor-materiais-feedback">Carregando turmas...</p>
                                ) : (
                                    <form onSubmit={handleSubmit} className="form-base">
                                        <Select
                                            id="turmaId"
                                            label="Selecionar turma"
                                            value={turmaId}
                                            onChange={(e) => setTurmaId(e.target.value)}
                                        >
                                            <option value="">Selecione</option>
                                            {turmas.map((turma) => (
                                                <option key={turma.turmaId} value={turma.turmaId}>
                                                    {turma.turmaNome} - {turma.disciplinaNome}
                                                </option>
                                            ))}
                                        </Select>

                                        {turmaSelecionada && (
                                            <div className="professor-materiais-info-box">
                                                <div className="professor-materiais-info-item">
                                                    <span className="professor-materiais-info-label">Turma</span>
                                                    <strong>{turmaSelecionada?.turmaNome || "-"}</strong>
                                                </div>

                                                <div className="professor-materiais-info-item">
                                                    <span className="professor-materiais-info-label">Disciplina</span>
                                                    <strong>{turmaSelecionada?.disciplinaNome || "-"}</strong>
                                                </div>
                                            </div>
                                        )}

                                        <Input
                                            id="titulo"
                                            label="Título do material"
                                            type="text"
                                            value={titulo}
                                            onChange={(e) => setTitulo(e.target.value)}
                                            placeholder="Ex.: Lista de Exercícios - Funções"
                                        />

                                        <Textarea
                                            id="descricao"
                                            label="Descrição"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            rows={4}
                                            placeholder="Descreva o material..."
                                        />

                                        <div className="form-group">
                                            <label htmlFor="arquivoMaterial" className="input-label">
                                                Anexar arquivo
                                            </label>
                                            <input
                                                id="arquivoMaterial"
                                                className="professor-materiais-file-input"
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                                            />
                                            <span className="professor-materiais-file-hint">
                                                Envie preferencialmente arquivos em PDF.
                                            </span>
                                        </div>

                                        <div className="form-actions professor-materiais-form-actions">
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                loading={salvando || enviandoArquivo}
                                                disabled={salvando || enviandoArquivo}
                                            >
                                                <FaUpload />
                                                {enviandoArquivo
                                                    ? "Enviando arquivo..."
                                                    : salvando
                                                        ? "Salvando..."
                                                        : "Publicar material"}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="professor-materiais-list-column">
                                <div className="form-section-title">
                                    <FaBookOpen className="form-section-icon" />
                                    <h2>Materiais Publicados</h2>
                                </div>

                                {!turmaId ? (
                                    <p className="professor-materiais-feedback">
                                        Selecione uma turma para visualizar os materiais publicados.
                                    </p>
                                ) : carregandoMateriais ? (
                                    <p className="professor-materiais-feedback">Carregando materiais...</p>
                                ) : materiais.length === 0 ? (
                                    <p className="professor-materiais-feedback">
                                        Nenhum material publicado para esta turma.
                                    </p>
                                ) : (
                                    <div className="professor-materiais-list">
                                        {materiais.map((material) => {
                                            const materialId =
                                                material.materialApoioId || material.materialId;

                                            return (
                                                <article
                                                    key={materialId}
                                                    className="professor-material-card"
                                                >
                                                    <div className="professor-material-card-header">
                                                        <div className="professor-material-card-title-area">
                                                            <div className="professor-material-card-icon">
                                                                <FaFilePdf />
                                                            </div>

                                                            <div>
                                                                <h3>{material.titulo || "-"}</h3>
                                                                <p className="professor-material-card-description">
                                                                    {material.descricao || "-"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="professor-material-card-actions">
                                                            {material.arquivoUrl && (
                                                                <a
                                                                    className="professor-material-link"
                                                                    href={montarUrlArquivo(material.arquivoUrl)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    <FaLink />
                                                                    Abrir arquivo
                                                                </a>
                                                            )}

                                                            <Button
                                                                type="button"
                                                                variant="danger"
                                                                onClick={() =>
                                                                    handleExcluirMaterial(materialId)
                                                                }
                                                                disabled={excluindoId === materialId}
                                                            >
                                                                <FaTrash />
                                                                {excluindoId === materialId
                                                                    ? "Removendo..."
                                                                    : "Remover"}
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <span className="professor-material-date">
                                                        Publicado em: {formatarDataHora(material.dataPublicacao)}
                                                    </span>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}