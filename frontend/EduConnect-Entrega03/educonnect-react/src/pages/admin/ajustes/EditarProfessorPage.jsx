import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaUserEdit,
    FaChalkboardTeacher,
} from "react-icons/fa";

import {
    listarProfessores,
    obterProfessorPorId,
    atualizarProfessor,
} from "../../../services/professorService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/select.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function EditarProfessorPage() {
    const navigate = useNavigate();

    const [professores, setProfessores] = useState([]);
    const [professorSelecionadoId, setProfessorSelecionadoId] = useState("");

    const [registro, setRegistro] = useState("");
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [emailInstitucional, setEmailInstitucional] = useState("");
    const [status, setStatus] = useState("Ativo");
    const [ativo, setAtivo] = useState(true);

    const [carregandoLista, setCarregandoLista] = useState(true);
    const [carregandoProfessor, setCarregandoProfessor] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const profileRef = useRef(null);

    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Administrador";

    const breadcrumbItems = [
        { label: "Home", path: "/admin" },
        { label: "Ajustes", path: "/admin/ajustes" },
        { label: "Ajustes de Professor" },
    ];

    useEffect(() => {
        async function carregarProfessores() {
            try {
                const data = await listarProfessores();
                setProfessores(Array.isArray(data) ? data : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar professores.");
            } finally {
                setCarregandoLista(false);
            }
        }

        carregarProfessores();
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

    function limparFormulario() {
        setRegistro("");
        setNomeCompleto("");
        setDataNascimento("");
        setEmailInstitucional("");
        setStatus("Ativo");
        setAtivo(true);
    }

    async function handleSelecionarProfessor(professorId) {
        setProfessorSelecionadoId(professorId);
        setErro("");
        setSucesso("");

        if (!professorId) {
            limparFormulario();
            return;
        }

        setCarregandoProfessor(true);

        try {
            const professor = await obterProfessorPorId(professorId);

            setRegistro(professor.registro || "");
            setNomeCompleto(professor.nomeCompleto || "");
            setDataNascimento(
                professor.dataNascimento
                    ? professor.dataNascimento.slice(0, 10)
                    : ""
            );
            setEmailInstitucional(professor.emailInstitucional || "");
            setStatus(professor.status || "Ativo");
            setAtivo(professor.ativo ?? true);
        } catch (error) {
            setErro(error.message || "Erro ao carregar dados do professor.");
        } finally {
            setCarregandoProfessor(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            await atualizarProfessor(professorSelecionadoId, {
                nomeCompleto,
                dataNascimento,
                emailInstitucional,
                status,
                ativo,
            });

            setSucesso("Professor atualizado com sucesso.");
        } catch (error) {
            setErro(error.message || "Erro ao atualizar professor.");
        } finally {
            setSalvando(false);
        }
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
                homePath="/admin"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-form">
                <div className="admin-form-wrapper admin-ajuste-professor-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Ajustes de Professor</h1>
                        <p className="admin-form-page-subtitle">
                            Selecione um professor para visualizar e editar seus dados.
                        </p>
                    </div>

                    {erro && <p className="public-feedback-error admin-form-feedback">{erro}</p>}
                    {sucesso && <p className="public-feedback-success admin-form-feedback">{sucesso}</p>}

                    <section className="form-card-container admin-ajuste-professor-card">
                        <div className="form-section-title">
                            <FaChalkboardTeacher className="form-section-icon" />
                            <h2>Selecionar Professor</h2>
                        </div>

                        {carregandoLista ? (
                            <p className="admin-ajuste-professor-feedback">
                                Carregando professores...
                            </p>
                        ) : (
                            <div className="admin-ajuste-professor-select-row">
                                <Select
                                    id="professorSelecionadoId"
                                    label="Professor"
                                    value={professorSelecionadoId}
                                    onChange={(e) => handleSelecionarProfessor(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {professores.map((professor) => (
                                        <option
                                            key={professor.professorId}
                                            value={professor.professorId}
                                        >
                                            {professor.nomeCompleto} ({professor.registro})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </section>

                    {professorSelecionadoId && (
                        <section className="form-card-container admin-ajuste-professor-card">
                            <div className="form-section-title">
                                <FaUserEdit className="form-section-icon" />
                                <h2>Dados do Professor</h2>
                            </div>

                            {carregandoProfessor ? (
                                <p className="admin-ajuste-professor-feedback">
                                    Carregando dados do professor...
                                </p>
                            ) : (
                                <form onSubmit={handleSubmit} className="form-base">
                                    <div className="form-row">
                                        <Input
                                            id="registro"
                                            label="Registro"
                                            type="text"
                                            value={registro}
                                            disabled
                                        />

                                        <Input
                                            id="nomeCompleto"
                                            label="Nome Completo"
                                            type="text"
                                            value={nomeCompleto}
                                            onChange={(e) => setNomeCompleto(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            id="dataNascimento"
                                            label="Data de Nascimento"
                                            type="date"
                                            value={dataNascimento}
                                            onChange={(e) => setDataNascimento(e.target.value)}
                                        />

                                        <Input
                                            id="emailInstitucional"
                                            label="E-mail Institucional"
                                            type="email"
                                            value={emailInstitucional}
                                            onChange={(e) => setEmailInstitucional(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <Select
                                            id="status"
                                            label="Status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="Ativo">Ativo</option>
                                            <option value="Inativo">Inativo</option>
                                            <option value="Licença">Licença</option>
                                        </Select>
                                    </div>

                                    <div className="admin-checkbox-group admin-checkbox-group-spaced">
                                        <label className="admin-checkbox-field">
                                            <input
                                                type="checkbox"
                                                checked={ativo}
                                                onChange={(e) => setAtivo(e.target.checked)}
                                            />
                                            <span>Professor ativo no sistema</span>
                                        </label>
                                    </div>

                                    <div className="form-actions">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => navigate("/admin/ajustes")}
                                        >
                                            Cancelar
                                        </Button>

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={salvando}
                                            disabled={salvando}
                                        >
                                            Salvar alterações
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}