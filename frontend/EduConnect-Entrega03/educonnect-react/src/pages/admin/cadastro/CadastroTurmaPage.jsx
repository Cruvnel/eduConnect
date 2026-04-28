import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaSchool,
    FaBookOpen,
    FaStar,
} from "react-icons/fa";

import { listarNiveisEnsino } from "../../../services/nivelEnsinoService";
import { listarProfessores } from "../../../services/professorService";
import { listarDisciplinas } from "../../../services/disciplinaService";
import { listarDisciplinasProfessor } from "../../../services/professorDisciplinaService";
import { criarTurma } from "../../../services/turmaService";
import { atribuirProfessorNaTurma } from "../../../services/turmaProfessorDisciplinaService";

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
import Modal from "../../../components/ui/Modal";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

const DISCIPLINAS_FIXAS = [
    "Português",
    "Matemática",
    "Física",
    "Química",
    "História",
    "Geografia",
    "Biologia",
    "Inglês",
];

function normalizarTexto(texto) {
    return (texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

export default function CadastroTurmaPage() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [nivelEnsinoId, setNivelEnsinoId] = useState("");
    const [anoLetivo, setAnoLetivo] = useState(
        new Date().getFullYear().toString()
    );
    const [sala, setSala] = useState("");
    const [professorTutorNome, setProfessorTutorNome] = useState("");
    const [descricao, setDescricao] = useState("");

    const [niveis, setNiveis] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);

    const [habilitacoesPorProfessor, setHabilitacoesPorProfessor] = useState({});
    const [gradePrincipal, setGradePrincipal] = useState([]);

    const [extracurricularAtiva, setExtracurricularAtiva] = useState(false);
    const [extracurricularDisciplinaId, setExtracurricularDisciplinaId] = useState("");
    const [extracurricularProfessorId, setExtracurricularProfessorId] = useState("");

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

    const nomeUsuario = localStorage.getItem("nome") || "Usuário";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Administrador";

    const breadcrumbItems = [
        { label: "Home", path: "/admin" },
        { label: "Cadastro", path: "/admin/cadastro" },
        { label: "Cadastro de Turma" },
    ];

    useEffect(() => {
        async function carregarDadosFormulario() {
            try {
                const [niveisData, professoresData, disciplinasData] = await Promise.all([
                    listarNiveisEnsino(),
                    listarProfessores(),
                    listarDisciplinas(),
                ]);

                const professoresAtivos = professoresData.filter((p) => p.ativo);

                setNiveis(niveisData);
                setProfessores(professoresAtivos);
                setDisciplinas(disciplinasData);

                const gradeMontada = DISCIPLINAS_FIXAS.map((nomeDisciplina) => {
                    const disciplinaEncontrada = disciplinasData.find(
                        (d) => normalizarTexto(d.nome) === normalizarTexto(nomeDisciplina)
                    );

                    return {
                        disciplinaId: disciplinaEncontrada?.disciplinaId ?? null,
                        disciplinaNome: nomeDisciplina,
                        professorId: "",
                    };
                });

                setGradePrincipal(gradeMontada);

                const habilitacoesResultados = await Promise.all(
                    professoresAtivos.map(async (professor) => {
                        const habilitacoes = await listarDisciplinasProfessor(professor.professorId);
                        return {
                            professorId: professor.professorId,
                            habilitacoes,
                        };
                    })
                );

                const mapa = {};
                habilitacoesResultados.forEach((item) => {
                    mapa[item.professorId] = item.habilitacoes;
                });

                setHabilitacoesPorProfessor(mapa);
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

    const disciplinasFixasAusentes = useMemo(() => {
        return gradePrincipal.filter((item) => !item.disciplinaId);
    }, [gradePrincipal]);

    const disciplinasExtracurriculares = useMemo(() => {
        const nomesFixosNormalizados = DISCIPLINAS_FIXAS.map(normalizarTexto);

        return disciplinas.filter(
            (d) => !nomesFixosNormalizados.includes(normalizarTexto(d.nome))
        );
    }, [disciplinas]);

    function obterProfessoresCompativeis(disciplinaId) {
        if (!disciplinaId || !nivelEnsinoId) return [];

        return professores.filter((professor) => {
            const habilitacoes = habilitacoesPorProfessor[professor.professorId] || [];

            return habilitacoes.some(
                (h) =>
                    Number(h.disciplinaId) === Number(disciplinaId) &&
                    Number(h.nivelEnsinoId) === Number(nivelEnsinoId)
            );
        });
    }

    function handleProfessorGradeChange(index, professorId) {
        setGradePrincipal((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        professorId,
                    }
                    : item
            )
        );
    }

    const extracurricularProfessoresCompativeis = useMemo(() => {
        if (!extracurricularDisciplinaId || !nivelEnsinoId) return [];

        return professores.filter((professor) => {
            const habilitacoes = habilitacoesPorProfessor[professor.professorId] || [];

            return habilitacoes.some(
                (h) =>
                    Number(h.disciplinaId) === Number(extracurricularDisciplinaId) &&
                    Number(h.nivelEnsinoId) === Number(nivelEnsinoId)
            );
        });
    }, [extracurricularDisciplinaId, nivelEnsinoId, professores, habilitacoesPorProfessor]);

    const formValido =
        nome &&
        nivelEnsinoId &&
        anoLetivo &&
        sala &&
        professorTutorNome &&
        disciplinasFixasAusentes.length === 0 &&
        gradePrincipal.every((item) => item.professorId) &&
        (!extracurricularAtiva ||
            (extracurricularDisciplinaId && extracurricularProfessorId));

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");
        setSalvando(true);

        let turmaCriada = null;

        try {
            if (disciplinasFixasAusentes.length > 0) {
                throw new Error(
                    `As seguintes disciplinas fixas não estão cadastradas: ${disciplinasFixasAusentes
                        .map((d) => d.disciplinaNome)
                        .join(", ")}.`
                );
            }

            turmaCriada = await criarTurma({
                nome,
                nivelEnsinoId: Number(nivelEnsinoId),
                anoLetivo: Number(anoLetivo),
                sala,
                professorTutorNome,
                descricao,
            });

            for (const item of gradePrincipal) {
                await atribuirProfessorNaTurma(turmaCriada.turmaId, {
                    professorId: Number(item.professorId),
                    disciplinaId: Number(item.disciplinaId),
                });
            }

            if (extracurricularAtiva && extracurricularDisciplinaId && extracurricularProfessorId) {
                await atribuirProfessorNaTurma(turmaCriada.turmaId, {
                    professorId: Number(extracurricularProfessorId),
                    disciplinaId: Number(extracurricularDisciplinaId),
                });
            }

            setSucesso("Turma cadastrada e professores atribuídos com sucesso.");
            setModalSucessoAberto(true);

            setNome("");
            setNivelEnsinoId("");
            setAnoLetivo("");
            setSala("");
            setProfessorTutorNome("");
            setDescricao("");
            setExtracurricularAtiva(false);
            setExtracurricularDisciplinaId("");
            setExtracurricularProfessorId("");

            setGradePrincipal((prev) =>
                prev.map((item) => ({
                    ...item,
                    professorId: "",
                }))
            );
        } catch (error) {
            if (turmaCriada) {
                setErro(`Turma cadastrada, mas houve erro ao atribuir a grade: ${error.message}`);
            } else {
                setErro(error.message || "Erro ao cadastrar turma.");
            }
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
                <div className="admin-form-wrapper admin-form-wrapper-lg">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Cadastro de Turma</h1>
                        <p className="admin-form-page-subtitle">
                            Preencha os dados da turma e atribua os professores da grade principal.
                        </p>
                    </div>

                    <div className="form-card-container">
                        <form onSubmit={handleSubmit} className="form-base turma-form">
                            <div className="admin-form-grid-duplo">
                                <div className="admin-form-coluna-esquerda">
                                    <div className="form-section-title">
                                        <FaSchool className="form-section-icon" />
                                        <h2>Dados da Turma</h2>
                                    </div>

                                    <div className="form-row">
                                        <Input
                                            id="nome"
                                            label="Nome"
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            placeholder="Ex: 7º Ano A"
                                            required
                                        />

                                        <Select
                                            id="nivelEnsinoId"
                                            label="Nível de Ensino"
                                            value={nivelEnsinoId}
                                            onChange={(e) => {
                                                setNivelEnsinoId(e.target.value);
                                                setExtracurricularProfessorId("");
                                                setGradePrincipal((prev) =>
                                                    prev.map((item) => ({
                                                        ...item,
                                                        professorId: "",
                                                    }))
                                                );
                                            }}
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

                                    <div className="form-row">
                                        <Input
                                            id="anoLetivo"
                                            label="Ano Letivo"
                                            type="text"
                                            value={anoLetivo}
                                            onChange={(e) => setAnoLetivo(e.target.value)}
                                            placeholder="2026"
                                            required
                                        />

                                        <Input
                                            id="sala"
                                            label="Sala"
                                            type="text"
                                            value={sala}
                                            onChange={(e) => setSala(e.target.value)}
                                            placeholder="Ex: Sala 3"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <Select
                                            id="professorTutorNome"
                                            label="Professor Tutor"
                                            value={professorTutorNome}
                                            onChange={(e) => setProfessorTutorNome(e.target.value)}
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            {professores.map((professor) => (
                                                <option
                                                    key={professor.professorId}
                                                    value={professor.nomeCompleto}
                                                >
                                                    {professor.nomeCompleto}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    <Textarea
                                        id="descricao"
                                        label="Descrição"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        placeholder="Descrição da turma"
                                        rows={6}
                                    />
                                </div>

                                <div className="admin-form-coluna-direita">
                                    <div className="form-section-title">
                                        <FaBookOpen className="form-section-icon" />
                                        <h2>Grade Principal</h2>
                                    </div>

                                    {disciplinasFixasAusentes.length > 0 && (
                                        <p className="public-feedback-error admin-form-feedback-inline">
                                            Disciplinas fixas ausentes:{" "}
                                            {disciplinasFixasAusentes.map((d) => d.disciplinaNome).join(", ")}
                                        </p>
                                    )}

                                    <div className="admin-grade-table-wrapper">
                                        <table className="admin-grade-table">
                                            <thead>
                                                <tr>
                                                    <th>Disciplina</th>
                                                    <th>Professor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gradePrincipal.map((item, index) => {
                                                    const professoresCompativeis = obterProfessoresCompativeis(item.disciplinaId);

                                                    return (
                                                        <tr key={item.disciplinaNome}>
                                                            <td>{item.disciplinaNome}</td>
                                                            <td>
                                                                <select
                                                                    className="form-control admin-grade-select"
                                                                    value={item.professorId}
                                                                    onChange={(e) =>
                                                                        handleProfessorGradeChange(index, e.target.value)
                                                                    }
                                                                    disabled={!item.disciplinaId || !nivelEnsinoId}
                                                                >
                                                                    <option value="">
                                                                        {!nivelEnsinoId
                                                                            ? "Selecione"
                                                                            : "Selecione"}
                                                                    </option>
                                                                    {professoresCompativeis.map((professor) => (
                                                                        <option
                                                                            key={professor.professorId}
                                                                            value={professor.professorId}
                                                                        >
                                                                            {professor.nomeCompleto}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-extracurricular-section">
                                <div className="form-section-title">
                                    <FaStar className="form-section-icon star" />
                                    <h2>Disciplina Extracurricular</h2>
                                </div>

                                <div className="admin-checkbox-group admin-checkbox-group-spaced">
                                    <label className="admin-checkbox-field">
                                        <input
                                            type="checkbox"
                                            checked={extracurricularAtiva}
                                            onChange={(e) => {
                                                setExtracurricularAtiva(e.target.checked);
                                                if (!e.target.checked) {
                                                    setExtracurricularDisciplinaId("");
                                                    setExtracurricularProfessorId("");
                                                }
                                            }}
                                        />
                                        <span>Adicionar disciplina extracurricular</span>
                                    </label>
                                </div>

                                {extracurricularAtiva && (
                                    <div className="form-row">
                                        <Select
                                            id="extracurricularDisciplinaId"
                                            label="Disciplina"
                                            value={extracurricularDisciplinaId}
                                            onChange={(e) => {
                                                setExtracurricularDisciplinaId(e.target.value);
                                                setExtracurricularProfessorId("");
                                            }}
                                            disabled={!nivelEnsinoId}
                                            required={extracurricularAtiva}
                                        >
                                            <option value="">
                                                {!nivelEnsinoId ? "Selecione o nível primeiro" : "Selecione"}
                                            </option>
                                            {disciplinasExtracurriculares.map((disciplina) => (
                                                <option
                                                    key={disciplina.disciplinaId}
                                                    value={disciplina.disciplinaId}
                                                >
                                                    {disciplina.nome}
                                                </option>
                                            ))}
                                        </Select>

                                        <Select
                                            id="extracurricularProfessorId"
                                            label="Professor"
                                            value={extracurricularProfessorId}
                                            onChange={(e) => setExtracurricularProfessorId(e.target.value)}
                                            disabled={!extracurricularDisciplinaId || !nivelEnsinoId}
                                            required={extracurricularAtiva}
                                        >
                                            <option value="">Selecione</option>
                                            {extracurricularProfessoresCompativeis.map((professor) => (
                                                <option
                                                    key={professor.professorId}
                                                    value={professor.professorId}
                                                >
                                                    {professor.nomeCompleto}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                )}
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
                                    disabled={salvando || !formValido}
                                >
                                    Cadastrar Turma
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
                    title="Turma cadastrada"
                    description="A turma foi cadastrada com sucesso e a grade principal foi atribuída."
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