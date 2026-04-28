import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaMoon, FaSun, FaSchool, FaUserShield } from "react-icons/fa";

import { criarAluno } from "../../../services/alunoService";
import { uploadFoto } from "../../../services/uploadService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/modal.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/fileinput.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import FileInput from "../../../components/ui/FileInput";
import Modal from "../../../components/ui/Modal";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

export default function CadastroAlunoPage() {
    const navigate = useNavigate();

    const [registroAluno, setRegistroAluno] = useState("");
    const [nomeCompletoAluno, setNomeCompletoAluno] = useState("");
    const [dataNascimentoAluno, setDataNascimentoAluno] = useState("");
    const [valorMensalPadrao, setValorMensalPadrao] = useState("");
    const [fotoFile, setFotoFile] = useState(null);

    const [nomeCompletoResponsavel, setNomeCompletoResponsavel] = useState("");
    const [telefoneResponsavel, setTelefoneResponsavel] = useState("");
    const [emailContatoResponsavel, setEmailContatoResponsavel] = useState("");
    const [tipoResponsabilidade, setTipoResponsabilidade] = useState("");
    const [responsavelPrincipal, setResponsavelPrincipal] = useState(true);

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
    const registro = localStorage.getItem("registro") || "";
    const perfil = localStorage.getItem("perfil") || "Administrador";

    const breadcrumbItems = [
        { label: "Home", path: "/admin" },
        { label: "Cadastro", path: "/admin/cadastro" },
        { label: "Cadastro de Aluno" },
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

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            let fotoUrl = null;

            if (fotoFile) {
                const uploadResponse = await uploadFoto(fotoFile);
                fotoUrl = uploadResponse.url;
            }

            await criarAluno({
                registroAluno,
                nomeCompletoAluno,
                dataNascimentoAluno,
                fotoUrl,
                valorMensalPadrao: Number(valorMensalPadrao),

                nomeCompletoResponsavel,
                telefoneResponsavel,
                emailContatoResponsavel,

                tipoResponsabilidade,
                responsavelPrincipal,
            });

            setSucesso("Aluno e responsável cadastrados com sucesso.");
            setModalSucessoAberto(true);

            setRegistroAluno("");
            setNomeCompletoAluno("");
            setDataNascimentoAluno("");
            setValorMensalPadrao("");
            setFotoFile(null);

            setNomeCompletoResponsavel("");
            setTelefoneResponsavel("");
            setEmailContatoResponsavel("");
            setTipoResponsabilidade("");
            setResponsavelPrincipal(true);
        } catch (error) {
            setErro(error.message || "Erro ao cadastrar aluno.");
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
                        <h1 className="page-title">Cadastro de Aluno</h1>
                        <p className="admin-form-page-subtitle">
                            Preencha os dados do aluno e do responsável legal.
                        </p>
                    </div>
                    <div className="form-card-container">
                        <form onSubmit={handleSubmit} className="form-base aluno-form">
                            <div className="form-section-title">
                                <FaUser className="form-section-icon" />
                                <h2>Dados do Aluno</h2>
                            </div>

                            <Input
                                id="nomeCompletoAluno"
                                label="Nome Completo"
                                type="text"
                                value={nomeCompletoAluno}
                                onChange={(e) => setNomeCompletoAluno(e.target.value)}
                                placeholder="Digite o nome completo do aluno"
                                required
                            />

                            <div className="form-row">
                                <Input
                                    id="dataNascimentoAluno"
                                    label="Data de Nascimento"
                                    type="date"
                                    value={dataNascimentoAluno}
                                    onChange={(e) => setDataNascimentoAluno(e.target.value)}
                                    required
                                />

                                <Input
                                    id="registroAluno"
                                    label="Registro do Aluno"
                                    type="text"
                                    value={registroAluno}
                                    onChange={(e) => setRegistroAluno(e.target.value)}
                                    placeholder="Ex. 1234567"
                                    required
                                />
                            </div>

                            <FileInput
                                id="fotoAluno"
                                label="Foto de Perfil do Aluno"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={setFotoFile}
                            />

                            <Input
                                id="valorMensalPadrao"
                                label="Valor Mensal Padrão"
                                type="number"
                                step="0.01"
                                value={valorMensalPadrao}
                                onChange={(e) => setValorMensalPadrao(e.target.value)}
                                placeholder="Ex. 850.00"
                                required
                            />

                            <div className="form-section-title">
                                <FaUserShield className="form-section-icon shield" />
                                <h2>Responsável Legal</h2>
                            </div>

                            <Input
                                id="nomeCompletoResponsavel"
                                label="Nome do Responsável"
                                type="text"
                                value={nomeCompletoResponsavel}
                                onChange={(e) => setNomeCompletoResponsavel(e.target.value)}
                                placeholder="Nome completo do pai, mãe ou responsável"
                                required
                            />

                            <div className="form-row">
                                <Input
                                    id="telefoneResponsavel"
                                    label="Telefone de Contato"
                                    type="text"
                                    value={telefoneResponsavel}
                                    onChange={(e) => setTelefoneResponsavel(e.target.value)}
                                    placeholder="(99) 99999-9999"
                                    required
                                />

                                <Input
                                    id="emailContatoResponsavel"
                                    label="Email de Contato"
                                    type="email"
                                    value={emailContatoResponsavel}
                                    onChange={(e) => setEmailContatoResponsavel(e.target.value)}
                                    placeholder="email_responsavel@exemplo.com"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <Input
                                    id="tipoResponsabilidade"
                                    label="Tipo de Responsabilidade"
                                    type="text"
                                    value={tipoResponsabilidade}
                                    onChange={(e) => setTipoResponsabilidade(e.target.value)}
                                    placeholder="Ex: Mãe, Pai, Avó"
                                    required
                                />

                                <div className="admin-checkbox-group">
                                    <label className="admin-checkbox-label" htmlFor="responsavelPrincipal">
                                        Responsável principal
                                    </label>

                                    <div className="admin-checkbox-field">
                                        <input
                                            id="responsavelPrincipal"
                                            type="checkbox"
                                            checked={responsavelPrincipal}
                                            onChange={(e) => setResponsavelPrincipal(e.target.checked)}
                                        />
                                        <span>Definir como responsável principal</span>
                                    </div>
                                </div>
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
                                    Cadastrar Aluno
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
                {erro && <p className="public-feedback-error admin-form-feedback">{erro}</p>}
                {sucesso && <p className="public-feedback-success admin-form-feedback">{sucesso}</p>}
            </main>

            {modalSucessoAberto && (
                <Modal
                    title="Aluno cadastrado"
                    description="O aluno foi cadastrado com sucesso. As credenciais de acesso foram enviadas para o e-mail do responsável."
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