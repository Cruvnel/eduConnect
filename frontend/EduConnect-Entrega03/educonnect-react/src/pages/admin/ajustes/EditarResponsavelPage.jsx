import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaUserFriends,
    FaUsers,
    FaSave,
} from "react-icons/fa";

import {
    listarResponsaveis,
    obterResponsavelPorId,
    atualizarResponsavel,
} from "../../../services/responsavelService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function EditarResponsavelPage() {
    const navigate = useNavigate();

    const [responsaveis, setResponsaveis] = useState([]);
    const [responsavelSelecionadoId, setResponsavelSelecionadoId] = useState("");

    const [registro, setRegistro] = useState("");
    const [nomeCompleto, setNomeCompleto] = useState("");
    const [telefone, setTelefone] = useState("");
    const [emailContato, setEmailContato] = useState("");
    const [ativo, setAtivo] = useState(true);
    const [quantidadeAlunosVinculados, setQuantidadeAlunosVinculados] = useState(0);

    const [carregandoLista, setCarregandoLista] = useState(true);
    const [carregandoResponsavel, setCarregandoResponsavel] = useState(false);
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
        { label: "Ajustes de Responsável" },
    ];

    useEffect(() => {
        async function carregarResponsaveis() {
            try {
                const data = await listarResponsaveis();
                setResponsaveis(Array.isArray(data) ? data : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar responsáveis.");
            } finally {
                setCarregandoLista(false);
            }
        }

        carregarResponsaveis();
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

    function limparFormulario() {
        setRegistro("");
        setNomeCompleto("");
        setTelefone("");
        setEmailContato("");
        setAtivo(true);
        setQuantidadeAlunosVinculados(0);
    }

    async function handleSelecionarResponsavel(responsavelId) {
        setResponsavelSelecionadoId(responsavelId);
        setErro("");
        setSucesso("");

        if (!responsavelId) {
            limparFormulario();
            return;
        }

        setCarregandoResponsavel(true);

        try {
            const responsavel = await obterResponsavelPorId(responsavelId);

            const responsavelDaLista = responsaveis.find(
                (item) => Number(item.responsavelId) === Number(responsavelId)
            );

            setRegistro(responsavel.registro || "");
            setNomeCompleto(responsavel.nomeCompleto || "");
            setTelefone(responsavel.telefone || "");
            setEmailContato(responsavel.emailContato || "");
            setAtivo(responsavel.ativo ?? true);
            setQuantidadeAlunosVinculados(
                responsavelDaLista?.quantidadeAlunosVinculados ?? 0
            );
        } catch (error) {
            setErro(error.message || "Erro ao carregar responsável.");
        } finally {
            setCarregandoResponsavel(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            await atualizarResponsavel(responsavelSelecionadoId, {
                nomeCompleto,
                telefone,
                emailContato,
                ativo,
            });

            setSucesso("Responsável atualizado com sucesso.");
        } catch (error) {
            setErro(error.message || "Erro ao atualizar responsável.");
        } finally {
            setSalvando(false);
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
                <div className="admin-form-wrapper admin-ajuste-responsavel-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Ajustes de Responsável</h1>
                        <p className="admin-form-page-subtitle">
                            Selecione um responsável para visualizar e editar seus dados cadastrais.
                        </p>
                    </div>

                    {(erro || sucesso) && (
                        <div className="admin-form-feedback">
                            {erro && <p className="public-feedback-error">{erro}</p>}
                            {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                        </div>
                    )}

                    <section className="admin-ajuste-responsavel-card">
                        <div className="form-section-title">
                            <FaUserFriends className="form-section-icon" />
                            <h2>Selecionar Responsável</h2>
                        </div>

                        {carregandoLista ? (
                            <p className="admin-ajuste-responsavel-feedback">
                                Carregando responsáveis...
                            </p>
                        ) : (
                            <div className="admin-ajuste-responsavel-select-row">
                                <div className="form-group">
                                    <label htmlFor="responsavelSelecionadoId">Responsável</label>
                                    <select
                                        id="responsavelSelecionadoId"
                                        className="select-field"
                                        value={responsavelSelecionadoId}
                                        onChange={(e) => handleSelecionarResponsavel(e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        {responsaveis.map((responsavel) => (
                                            <option
                                                key={responsavel.responsavelId}
                                                value={responsavel.responsavelId}
                                            >
                                                {responsavel.nomeCompleto} ({responsavel.registro})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </section>

                    {responsavelSelecionadoId && (
                        <section className="admin-ajuste-responsavel-card">
                            <div className="form-section-title">
                                <FaUserFriends className="form-section-icon" />
                                <h2>Dados do Responsável</h2>
                            </div>

                            {carregandoResponsavel ? (
                                <p className="admin-ajuste-responsavel-feedback">
                                    Carregando dados do responsável...
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
                                            id="quantidadeAlunosVinculados"
                                            label="Quantidade de alunos vinculados"
                                            type="number"
                                            value={quantidadeAlunosVinculados}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            id="nomeCompleto"
                                            label="Nome Completo"
                                            type="text"
                                            value={nomeCompleto}
                                            onChange={(e) => setNomeCompleto(e.target.value)}
                                            required
                                        />

                                        <Input
                                            id="telefone"
                                            label="Telefone"
                                            type="text"
                                            value={telefone}
                                            onChange={(e) => setTelefone(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            id="emailContato"
                                            label="Email de Contato"
                                            type="email"
                                            value={emailContato}
                                            onChange={(e) => setEmailContato(e.target.value)}
                                        />
                                    </div>

                                    <div className="admin-ajuste-responsavel-info-box">
                                        <div className="admin-ajuste-responsavel-info-header">
                                            <FaUsers className="admin-ajuste-responsavel-info-icon" />
                                            <span>Vínculos do responsável</span>
                                        </div>
                                        <p className="admin-ajuste-responsavel-feedback">
                                            Este responsável possui{" "}
                                            <strong>{quantidadeAlunosVinculados}</strong>{" "}
                                            aluno(s) vinculado(s).
                                        </p>
                                    </div>

                                    <div className="admin-checkbox-group">
                                        <label className="admin-checkbox-field">
                                            <input
                                                type="checkbox"
                                                checked={ativo}
                                                onChange={(e) => setAtivo(e.target.checked)}
                                            />
                                            <span>Responsável ativo no sistema</span>
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
                                            <FaSave />
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