import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaMoon, FaSun, FaPlusCircle } from "react-icons/fa";
import {
    Backpack,
    BriefcaseBusiness,
    School,
    Notebook,
} from "lucide-react";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function CadastroHomePage() {
    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const profileRef = useRef(null);

    const nome = localStorage.getItem("nome") || "Usuário";
    const email = localStorage.getItem("email") || "email@educonnect.com";
    const registro = localStorage.getItem("registro") || "";
    const perfil = localStorage.getItem("perfil") || "Administrador";

    const breadcrumbItems = [
        { label: "Home", path: "/admin" },
        { label: "Cadastro" },
    ];

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
                    registro={registro}
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

    const opcoesCadastro = [
        {
            titulo: "Alunos",
            descricao: "Cadastre novos alunos e registre suas informações acadêmicas e cadastrais.",
            rota: "/admin/cadastro/aluno",
            icone: <Backpack size={22} strokeWidth={2} />,
        },
        {
            titulo: "Professores",
            descricao: "Cadastre professores e defina suas informações profissionais iniciais.",
            rota: "/admin/cadastro/professor",
            icone: <BriefcaseBusiness size={22} strokeWidth={2} />,
        },
        {
            titulo: "Turmas",
            descricao: "Crie turmas, organize a grade principal e vincule professores responsáveis.",
            rota: "/admin/cadastro/turma",
            icone: <School size={22} strokeWidth={2} />,
        },
        {
            titulo: "Disciplinas",
            descricao: "Cadastre disciplinas e associe seus dados básicos ao nível de ensino.",
            rota: "/admin/cadastro/disciplina",
            icone: <Notebook size={22} strokeWidth={2} />,
        },
    ];

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
                <div className="admin-cadastro-home-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title admin-cadastro-home-title">
                            Opções de Cadastro
                        </h1>
                        <p className="admin-form-page-subtitle">
                            Escolha o tipo de cadastro que deseja realizar.
                        </p>
                    </div>

                    <section className="admin-cadastro-home-card">
                        <div className="form-section-title">
                            <FaPlusCircle className="form-section-icon" />
                            <h2>Tipos de Cadastro</h2>
                        </div>

                        <div className="admin-cadastro-home-grid">
                            {opcoesCadastro.map((opcao) => (
                                <Link
                                    key={opcao.titulo}
                                    to={opcao.rota}
                                    className="admin-cadastro-home-item"
                                >
                                    <div className="admin-cadastro-home-item-icon">
                                        {opcao.icone}
                                    </div>

                                    <div className="admin-cadastro-home-item-content">
                                        <h3>{opcao.titulo}</h3>
                                        <p>{opcao.descricao}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}