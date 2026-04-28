import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaChalkboardTeacher,
    FaUserGraduate,
    FaUsers,
    FaSchool,
    FaCog,
} from "react-icons/fa";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function AjustesHomePage() {
    const navigate = useNavigate();

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

    const opcoesAjuste = [
        {
            titulo: "Professores",
            descricao: "Editar dados cadastrais e informações profissionais dos professores.",
            rota: "/admin/ajustes/professores",
            icone: <FaChalkboardTeacher />,
        },
        {
            titulo: "Alunos",
            descricao: "Atualizar informações acadêmicas e cadastrais dos alunos.",
            rota: "/admin/ajustes/alunos",
            icone: <FaUserGraduate />,
        },
        {
            titulo: "Responsáveis",
            descricao: "Gerenciar dados de contato e vínculo dos responsáveis.",
            rota: "/admin/ajustes/responsaveis",
            icone: <FaUsers />,
        },
        {
            titulo: "Turmas",
            descricao: "Ajustar dados das turmas e revisar vinculações principais.",
            rota: "/admin/ajustes/turmas",
            icone: <FaSchool />,
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
                <div className="admin-ajustes-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title admin-ajustes-page-title">Ajustes</h1>
                        <p className="admin-form-page-subtitle">
                            Escolha o tipo de ajuste que deseja realizar.
                        </p>
                    </div>

                    <section className="admin-ajustes-card">
                        <div className="form-section-title">
                            <FaCog className="form-section-icon" />
                            <h2>Tipos de Ajuste</h2>
                        </div>

                        <div className="admin-ajustes-grid">
                            {opcoesAjuste.map((opcao) => (
                                <Link
                                    key={opcao.titulo}
                                    to={opcao.rota}
                                    className="admin-ajuste-item"
                                >
                                    <div className="admin-ajuste-item-icon">
                                        {opcao.icone}
                                    </div>

                                    <div className="admin-ajuste-item-content">
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