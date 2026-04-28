import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaUserTie,
    FaEnvelope,
    FaGraduationCap,
} from "react-icons/fa";

import { criarProfessor } from "../../../services/professorService";
import { listarDisciplinas } from "../../../services/disciplinaService";
import { listarNiveisEnsino } from "../../../services/nivelEnsinoService";
import { criarDisciplinaProfessor } from "../../../services/professorDisciplinaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/modal.css";
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
import Modal from "../../../components/ui/Modal";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function CadastroProfessorPage() {
    const navigate = useNavigate();

    const [registro, setRegistro] = useState("");
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [emailInstitucional, setEmailInstitucional] = useState("");
    const [status, setStatus] = useState("Ativo");

    const [disciplinaId, setDisciplinaId] = useState("");
    const [nivelEnsinoId, setNivelEnsinoId] = useState("");
    const [cargaHorariaSemanal, setCargaHorariaSemanal] = useState("");

    const [disciplinas, setDisciplinas] = useState([]);
    const [niveis, setNiveis] = useState([]);

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [modalSucessoAberto, setModalSucessoAberto] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const profileRef = useRef(null);

    const nome = localStorage.getItem("nome") || "Usuário";
    const email = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfil = localStorage.getItem("perfil") || "Administrador";

    const breadcrumbItems = [
        { label: "Home", path: "/admin" },
        { label: "Cadastro", path: "/admin/cadastro" },
        { label: "Cadastro de Professor" },
    ];

    useEffect(() => {
        async function carregarDadosFormulario() {
            try {
                const [disciplinasData, niveisData] = await Promise.all([
                    listarDisciplinas(),
                    listarNiveisEnsino(),
                ]);

                setDisciplinas(Array.isArray(disciplinasData) ? disciplinasData : []);
                setNiveis(Array.isArray(niveisData) ? niveisData : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar formulário.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDadosFormulario();
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

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            const professorCriado = await criarProfessor({
                registro,
                nomeCompleto,
                dataNascimento,
                emailInstitucional,
                status,
            });

            await criarDisciplinaProfessor(professorCriado.professorId, {
                disciplinaId: Number(disciplinaId),
                nivelEnsinoId: Number(nivelEnsinoId),
                cargaHorariaSemanal: Number(cargaHorariaSemanal),
            });

            setSucesso("Professor cadastrado e disciplina atribuída com sucesso.");
            setModalSucessoAberto(true);

            setRegistro("");
            setNomeCompleto("");
            setDataNascimento("");
            setEmailInstitucional("");
            setStatus("Ativo");
            setDisciplinaId("");
            setNivelEnsinoId("");
            setCargaHorariaSemanal("");
        } catch (error) {
            setErro(error.message || "Erro ao cadastrar professor.");
        } finally {
            setSalvando(false);
        }
    }

    function fecharModalSucesso() {
        setModalSucessoAberto(false);
        navigate("/admin/cadastro");
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
                    nome={nome}
                    email={email}
                    perfil={perfil}
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

    if (carregando) {
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
                    <div className="admin-form-wrapper">
                        <p className="admin-form-feedback">Carregando formulário...</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <AppHeader
                logo={logoSplash}
                title="EduConnect"
                homePath="/admin"
                rightContent={headerActions}
            />

            <main className="main-form">
                <div className="admin-form-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Cadastro de Professor</h1>
                        <p className="admin-form-page-subtitle">
                            Preencha os dados cadastrais e a atribuição inicial da disciplina.
                        </p>
                    </div>

                    <div className="admin-form-wrapper">
                        <div className="form-card-container">
                            <form onSubmit={handleSubmit} className="form-base professor-form">
                                <div className="form-section-title">
                                    <FaUserTie className="form-section-icon" />
                                    <h2>Dados Pessoais</h2>
                                </div>

                                <Input
                                    id="nomeCompleto"
                                    label="Nome Completo"
                                    type="text"
                                    value={nomeCompleto}
                                    onChange={(e) => setNomeCompleto(e.target.value)}
                                    placeholder="Digite o nome completo"
                                    required
                                />

                                <div className="form-row">
                                    <Input
                                        id="dataNascimento"
                                        label="Data de Nascimento"
                                        type="date"
                                        value={dataNascimento}
                                        onChange={(e) => setDataNascimento(e.target.value)}
                                        required
                                    />

                                    <Input
                                        id="registro"
                                        label="Registro do Professor"
                                        type="text"
                                        value={registro}
                                        onChange={(e) => setRegistro(e.target.value)}
                                        placeholder="Ex: PROF0002"
                                        required
                                    />
                                </div>

                                <div className="form-section-title">
                                    <FaEnvelope className="form-section-icon" />
                                    <h2>Contato</h2>
                                </div>

                                <Input
                                    id="emailInstitucional"
                                    label="E-mail Institucional"
                                    type="email"
                                    value={emailInstitucional}
                                    onChange={(e) => setEmailInstitucional(e.target.value)}
                                    placeholder="email@exemplo.com"
                                    required
                                />

                                <div className="form-section-title">
                                    <FaGraduationCap className="form-section-icon cap" />
                                    <h2>Informações Profissionais</h2>
                                </div>

                                <div className="form-row">
                                    <Select
                                        id="disciplina"
                                        label="Disciplina"
                                        value={disciplinaId}
                                        onChange={(e) => setDisciplinaId(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione a disciplina</option>
                                        {disciplinas.map((disciplina) => (
                                            <option
                                                key={disciplina.disciplinaId}
                                                value={disciplina.disciplinaId}
                                            >
                                                {disciplina.nome}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        id="nivelEnsino"
                                        label="Nível de Ensino"
                                        value={nivelEnsinoId}
                                        onChange={(e) => setNivelEnsinoId(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione o nível</option>
                                        {niveis.map((nivel) => (
                                            <option
                                                key={nivel.nivelEnsinoId}
                                                value={nivel.nivelEnsinoId}
                                            >
                                                {nivel.nome}
                                            </option>
                                        ))}
                                    </Select>
                                </div>

                                <div className="form-row">
                                    <Input
                                        id="cargaHorariaSemanal"
                                        label="Carga Horária Semanal"
                                        type="number"
                                        value={cargaHorariaSemanal}
                                        onChange={(e) => setCargaHorariaSemanal(e.target.value)}
                                        placeholder="Ex: 4"
                                        required
                                    />

                                    <Select
                                        id="status"
                                        label="Status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        required
                                    >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Licença">Licença</option>
                                        <option value="Inativo">Inativo</option>
                                    </Select>
                                </div>

                                <div className="form-actions">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => navigate("/admin/cadastro")}
                                    >
                                        Cancelar
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        loading={salvando}
                                    >
                                        Cadastrar Professor
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {erro && <p className="public-feedback-error admin-form-feedback">{erro}</p>}
                {sucesso && <p className="public-feedback-success admin-form-feedback">{sucesso}</p>}
            </main>

            {modalSucessoAberto && (
                <Modal
                    title="Professor cadastrado"
                    description="O professor foi cadastrado com sucesso e sua disciplina inicial foi atribuída."
                    onClose={fecharModalSucesso}
                    size="sm"
                >
                    <Button
                        type="button"
                        variant="primary"
                        fullWidth
                        onClick={fecharModalSucesso}
                    >
                        OK
                    </Button>
                </Modal>
            )}
        </>
    );
}