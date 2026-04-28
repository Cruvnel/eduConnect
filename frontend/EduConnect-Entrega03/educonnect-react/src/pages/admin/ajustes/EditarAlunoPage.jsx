import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaUserGraduate,
    FaUserFriends,
    FaImage,
    FaSave,
} from "react-icons/fa";

import {
    listarAlunos,
    obterAlunoPorId,
    atualizarAluno,
} from "../../../services/alunoService";
import { uploadFoto } from "../../../services/uploadService";

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

const API_ORIGIN = "http://localhost:5267";

function getFileUrl(relativePath) {
    if (!relativePath) return "";
    if (relativePath.startsWith("http")) return relativePath;
    return `${API_ORIGIN}${relativePath}`;
}

export default function EditarAlunoPage() {
    const navigate = useNavigate();

    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionadoId, setAlunoSelecionadoId] = useState("");

    const [registroAluno, setRegistroAluno] = useState("");
    const [nomeCompletoAluno, setNomeCompletoAluno] = useState("");
    const [dataNascimentoAluno, setDataNascimentoAluno] = useState("");
    const [fotoUrl, setFotoUrl] = useState("");
    const [fotoFile, setFotoFile] = useState(null);
    const [valorMensalPadrao, setValorMensalPadrao] = useState("");
    const [ativo, setAtivo] = useState(true);

    const [nomeCompletoResponsavel, setNomeCompletoResponsavel] = useState("");
    const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
    const [emailContatoResponsavel, setEmailContatoResponsavel] = useState("");
    const [tipoResponsabilidade, setTipoResponsabilidade] = useState("");
    const [responsavelPrincipal, setResponsavelPrincipal] = useState(true);

    const [carregandoLista, setCarregandoLista] = useState(true);
    const [carregandoAluno, setCarregandoAluno] = useState(false);
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
        { label: "Ajustes de Aluno" },
    ];

    useEffect(() => {
        async function carregarAlunos() {
            try {
                const data = await listarAlunos();
                setAlunos(Array.isArray(data) ? data : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar alunos.");
            } finally {
                setCarregandoLista(false);
            }
        }

        carregarAlunos();
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
        setRegistroAluno("");
        setNomeCompletoAluno("");
        setDataNascimentoAluno("");
        setFotoUrl("");
        setFotoFile(null);
        setValorMensalPadrao("");
        setAtivo(true);
        setNomeCompletoResponsavel("");
        setTelefoneResponsavel("");
        setEmailContatoResponsavel("");
        setTipoResponsabilidade("");
        setResponsavelPrincipal(true);
    }

    async function handleSelecionarAluno(alunoId) {
        setAlunoSelecionadoId(alunoId);
        setErro("");
        setSucesso("");

        if (!alunoId) {
            limparFormulario();
            return;
        }

        setCarregandoAluno(true);

        try {
            const aluno = await obterAlunoPorId(alunoId);
            setRegistroAluno(aluno.registroAluno || "");
            setNomeCompletoAluno(aluno.nomeCompletoAluno || "");
            setDataNascimentoAluno(
                aluno.dataNascimentoAluno
                    ? aluno.dataNascimentoAluno.slice(0, 10)
                    : ""
            );
            setFotoUrl(aluno.fotoUrl || "");
            setFotoFile(null);
            setValorMensalPadrao(
                aluno.valorMensalPadrao !== undefined && aluno.valorMensalPadrao !== null
                    ? String(aluno.valorMensalPadrao)
                    : ""
            );
            setAtivo(aluno.ativo ?? true);

            setNomeCompletoResponsavel(aluno.nomeCompletoResponsavel || "");
            setTelefoneResponsavel(aluno.telefoneResponsavel || "");
            setEmailContatoResponsavel(aluno.emailContatoResponsavel || "");
            setTipoResponsabilidade(aluno.tipoResponsabilidade || "");
            setResponsavelPrincipal(aluno.responsavelPrincipal ?? true);
        } catch (error) {
            setErro(error.message || "Erro ao carregar aluno.");
        } finally {
            setCarregandoAluno(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            let fotoUrlFinal = fotoUrl;

            if (fotoFile) {
                const uploadResponse = await uploadFoto(fotoFile);
                fotoUrlFinal = uploadResponse.url;
            }

            await atualizarAluno(alunoSelecionadoId, {
                nomeCompletoAluno,
                dataNascimentoAluno: dataNascimentoAluno
                    ? new Date(dataNascimentoAluno).toISOString()
                    : null,
                fotoUrl: fotoUrlFinal,
                valorMensalPadrao: Number(valorMensalPadrao),
                ativo,
                responsavelPrincipal,
            });

            setSucesso("Aluno atualizado com sucesso.");
            setFotoUrl(fotoUrlFinal);
            setFotoFile(null);
        } catch (error) {
            setErro(error.message || "Erro ao atualizar aluno.");
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
                <div className="admin-form-wrapper admin-ajuste-aluno-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Ajustes de Aluno</h1>
                        <p className="admin-form-page-subtitle">
                            Selecione um aluno para visualizar e editar seus dados e os dados do responsável vinculado.
                        </p>
                    </div>

                    {(erro || sucesso) && (
                        <div className="admin-form-feedback">
                            {erro && <p className="public-feedback-error">{erro}</p>}
                            {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                        </div>
                    )}

                    <section className="admin-ajuste-aluno-card">
                        <div className="form-section-title">
                            <FaUserGraduate className="form-section-icon" />
                            <h2>Selecionar Aluno</h2>
                        </div>

                        {carregandoLista ? (
                            <p className="admin-ajuste-aluno-feedback">Carregando alunos...</p>
                        ) : (
                            <div className="admin-ajuste-aluno-select-row">
                                <Select
                                    id="alunoSelecionadoId"
                                    label="Aluno"
                                    value={alunoSelecionadoId}
                                    onChange={(e) => handleSelecionarAluno(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {alunos.map((aluno) => (
                                        <option key={aluno.alunoId} value={aluno.alunoId}>
                                            {aluno.nomeCompletoAluno} ({aluno.registroAluno})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </section>

                    {alunoSelecionadoId && (
                        <section className="admin-ajuste-aluno-card">

                            {carregandoAluno ? (
                                <p className="admin-ajuste-aluno-feedback">Carregando dados do aluno...</p>
                            ) : (
                                <form onSubmit={handleSubmit} className="form-base">
                                    <div className="form-section-title">
                                        <FaUserGraduate className="form-section-icon" />
                                        <h2>Aluno</h2>
                                    </div>

                                    {(fotoUrl || fotoFile) && (
                                        <div className="admin-ajuste-aluno-foto-box">
                                            <div className="admin-ajuste-aluno-foto-header">
                                                <FaImage className="admin-ajuste-aluno-foto-icon" />
                                                <span>
                                                    {fotoFile ? "Nova foto selecionada" : "Foto atual"}
                                                </span>
                                            </div>

                                            {fotoFile ? (
                                                <p className="admin-ajuste-aluno-feedback">
                                                    {fotoFile.name}
                                                </p>
                                            ) : (
                                                <>
                                                    <img
                                                        src={getFileUrl(fotoUrl)}
                                                        alt="Foto do aluno"
                                                        className="admin-ajuste-aluno-foto-preview"
                                                    />
                                                    <a
                                                        href={getFileUrl(fotoUrl)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="admin-doc-link"
                                                    >
                                                        Abrir foto
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    <div className="form-row">
                                        <Input
                                            id="registroAluno"
                                            label="Registro"
                                            type="text"
                                            value={registroAluno}
                                            disabled
                                        />

                                        <Input
                                            id="nomeCompletoAluno"
                                            label="Nome Completo"
                                            type="text"
                                            value={nomeCompletoAluno}
                                            onChange={(e) => setNomeCompletoAluno(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            id="dataNascimentoAluno"
                                            label="Data de Nascimento"
                                            type="date"
                                            value={dataNascimentoAluno}
                                            onChange={(e) => setDataNascimentoAluno(e.target.value)}
                                        />

                                        <Input
                                            id="valorMensalPadrao"
                                            label="Valor Mensal Padrão"
                                            type="number"
                                            step="0.01"
                                            value={valorMensalPadrao}
                                            onChange={(e) => setValorMensalPadrao(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="fotoAluno">Foto</label>
                                            <input
                                                id="fotoAluno"
                                                type="file"
                                                accept="image/*"
                                                className="admin-ajuste-aluno-file-input"
                                                onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                                            />
                                        </div>
                                    </div>

                                    <div className="admin-checkbox-group">
                                        <label className="admin-checkbox-field">
                                            <input
                                                type="checkbox"
                                                checked={ativo}
                                                onChange={(e) => setAtivo(e.target.checked)}
                                            />
                                            <span>Aluno ativo no sistema</span>
                                        </label>
                                    </div>

                                    <div className="form-section-title">
                                        <FaUserFriends className="form-section-icon" />
                                        <h2>Responsável vinculado</h2>
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            id="nomeCompletoResponsavel"
                                            label="Nome Completo"
                                            type="text"
                                            value={nomeCompletoResponsavel}
                                            disabled
                                        />

                                        <Input
                                            id="telefoneResponsavel"
                                            label="Telefone"
                                            type="text"
                                            value={telefoneResponsavel}
                                            disabled
                                        />
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            id="emailContatoResponsavel"
                                            label="Email de Contato"
                                            type="email"
                                            value={emailContatoResponsavel}
                                            disabled
                                        />

                                        <Input
                                            id="tipoResponsabilidade"
                                            label="Tipo de Responsabilidade"
                                            type="text"
                                            value={tipoResponsabilidade}
                                            disabled
                                        />
                                    </div>

                                    <div className="admin-checkbox-group">
                                        <label className="admin-checkbox-field">
                                            <input
                                                type="checkbox"
                                                checked={responsavelPrincipal}
                                                onChange={(e) => setResponsavelPrincipal(e.target.checked)}
                                            />
                                            <span>Responsável principal</span>
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