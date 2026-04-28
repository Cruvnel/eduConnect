import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMoon, FaSun, FaBook, FaCog } from "react-icons/fa";

import { criarDisciplina } from "../../../services/disciplinaService";
import { listarNiveisEnsino } from "../../../services/nivelEnsinoService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/modal.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/select.css";
import "../../../styles/textarea.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function CadastroDisciplinaPage() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [codigo, setCodigo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [nivelEnsinoId, setNivelEnsinoId] = useState("");

    const [niveis, setNiveis] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    // header state
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
        { label: "Cadastro", path: "/admin/cadastro" },
        { label: "Cadastro de Disciplina" },
    ];

    useEffect(() => {
        async function carregarNiveis() {
            try {
                const data = await listarNiveisEnsino();
                setNiveis(data);
            } catch (error) {
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        carregarNiveis();
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
            await criarDisciplina({
                nome,
                codigo,
                descricao,
                nivelEnsinoId: Number(nivelEnsinoId),
            });

            setSucesso("Disciplina cadastrada com sucesso.");

            setNome("");
            setCodigo("");
            setDescricao("");
            setNivelEnsinoId("");

            setTimeout(() => {
                navigate("/admin/cadastro");
            }, 1200);
        } catch (error) {
            setErro(error.message);
        } finally {
            setSalvando(false);
        }
    }

    const headerActions = (
        <div className="internal-header-actions">
            <div className="profile-anchor" ref={profileRef}>
                <button className="icon-btn" onClick={() => setProfileOpen(!profileOpen)}>
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

            <button className="icon-btn" onClick={toggleTheme}>
                {darkMode ? <FaSun /> : <FaMoon />}
            </button>
        </div>
    );

    if (carregando) {
        return <p>Carregando...</p>;
    }

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
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Cadastro de Disciplina</h1>
                        <p className="admin-form-page-subtitle">
                            Preencha os dados para cadastrar uma nova disciplina.
                        </p>
                    </div>

                    <div className="form-card-container">
                        <form onSubmit={handleSubmit} className="form-base">

                            {/* INFORMAÇÕES */}
                            <div className="form-section-title">
                                <FaBook className="form-section-icon" />
                                <h2>Informações da Disciplina</h2>
                            </div>

                            <div className="form-row">
                                <Input
                                    id="nome"
                                    label="Nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Ex: Matemática"
                                    required
                                />

                                <Input
                                    id="codigo"
                                    label="Código"
                                    value={codigo}
                                    onChange={(e) => setCodigo(e.target.value)}
                                    placeholder="Ex: MAT001"
                                    required
                                />
                            </div>

                            <Textarea
                                id="descricao"
                                label="Descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Descrição da disciplina"
                                rows={4}
                            />

                            {/* CONFIGURAÇÕES */}
                            <div className="form-section-title">
                                <FaCog className="form-section-icon" />
                                <h2>Configurações</h2>
                            </div>

                            <div className="form-row">
                                <Select
                                    id="nivelEnsino"
                                    label="Nível de Ensino"
                                    value={nivelEnsinoId}
                                    onChange={(e) => setNivelEnsinoId(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione</option>
                                    {niveis.map((nivel) => (
                                        <option key={nivel.nivelEnsinoId} value={nivel.nivelEnsinoId}>
                                            {nivel.nome}
                                        </option>
                                    ))}
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
                                    Cadastrar Disciplina
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {erro && <p className="public-feedback-error admin-form-feedback">{erro}</p>}
                {sucesso && <p className="public-feedback-success admin-form-feedback">{sucesso}</p>}
            </main>
        </>
    );
}