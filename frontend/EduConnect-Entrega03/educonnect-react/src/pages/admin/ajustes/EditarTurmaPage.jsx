import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaChalkboard,
    FaUsers,
    FaUserTie,
    FaBookOpen,
    FaSave,
    FaTrash,
    FaExchangeAlt,
    FaTimes,
    FaEdit,
} from "react-icons/fa";

import {
    listarTurmas,
    obterTurmaPorId,
    atualizarTurma,
    excluirTurma,
} from "../../../services/turmaService";
import { listarNiveisEnsino } from "../../../services/nivelEnsinoService";
import { listarProfessores } from "../../../services/professorService";
import {
    listarProfessoresDaTurma,
    atribuirProfessorNaTurma,
    removerProfessorDaTurma,
} from "../../../services/turmaProfessorDisciplinaService";
import { listarDisciplinasProfessor } from "../../../services/professorDisciplinaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
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

export default function EditarTurmaPage() {
    const navigate = useNavigate();

    const [turmas, setTurmas] = useState([]);
    const [niveis, setNiveis] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [turmaSelecionadaId, setTurmaSelecionadaId] = useState("");

    const [nome, setNome] = useState("");
    const [nivelEnsinoId, setNivelEnsinoId] = useState("");
    const [anoLetivo, setAnoLetivo] = useState("");
    const [sala, setSala] = useState("");
    const [professorTutorNome, setProfessorTutorNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [ativa, setAtiva] = useState(true);

    const [vinculosProfessor, setVinculosProfessor] = useState([]);
    const [professorVinculoId, setProfessorVinculoId] = useState("");
    const [disciplinaVinculoId, setDisciplinaVinculoId] = useState("");
    const [disciplinasHabilitadasProfessor, setDisciplinasHabilitadasProfessor] = useState([]);

    const [modoSubstituicao, setModoSubstituicao] = useState(false);
    const [vinculoOriginal, setVinculoOriginal] = useState(null);

    const [carregandoLista, setCarregandoLista] = useState(true);
    const [carregandoTurma, setCarregandoTurma] = useState(false);
    const [carregandoVinculos, setCarregandoVinculos] = useState(false);
    const [carregandoDisciplinasProfessor, setCarregandoDisciplinasProfessor] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [salvandoVinculo, setSalvandoVinculo] = useState(false);
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
        { label: "Ajustes de Turma" },
    ];

    useEffect(() => {
        async function carregarDadosIniciais() {
            try {
                const [turmasData, niveisData, professoresData] = await Promise.all([
                    listarTurmas(),
                    listarNiveisEnsino(),
                    listarProfessores(),
                ]);

                setTurmas(Array.isArray(turmasData) ? turmasData : []);
                setNiveis(Array.isArray(niveisData) ? niveisData : []);
                setProfessores(
                    Array.isArray(professoresData)
                        ? professoresData.filter((p) => p.ativo)
                        : []
                );
            } catch (error) {
                setErro(error.message || "Erro ao carregar dados.");
            } finally {
                setCarregandoLista(false);
            }
        }

        carregarDadosIniciais();
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
        setNome("");
        setNivelEnsinoId("");
        setAnoLetivo("");
        setSala("");
        setProfessorTutorNome("");
        setDescricao("");
        setAtiva(true);
    }

    function limparFormularioVinculo() {
        setProfessorVinculoId("");
        setDisciplinaVinculoId("");
        setDisciplinasHabilitadasProfessor([]);
        setModoSubstituicao(false);
        setVinculoOriginal(null);
    }

    async function carregarVinculosTurma(turmaId) {
        if (!turmaId) {
            setVinculosProfessor([]);
            return;
        }

        setCarregandoVinculos(true);

        try {
            const data = await listarProfessoresDaTurma(turmaId);
            setVinculosProfessor(Array.isArray(data) ? data : []);
        } catch (error) {
            setErro(error.message || "Erro ao carregar vínculos.");
            setVinculosProfessor([]);
        } finally {
            setCarregandoVinculos(false);
        }
    }

    async function carregarDisciplinasDoProfessor(professorId) {
        if (!professorId) {
            setDisciplinasHabilitadasProfessor([]);
            return;
        }

        setCarregandoDisciplinasProfessor(true);

        try {
            const data = await listarDisciplinasProfessor(professorId);
            setDisciplinasHabilitadasProfessor(Array.isArray(data) ? data : []);
        } catch (error) {
            setErro(error.message || "Erro ao carregar disciplinas.");
            setDisciplinasHabilitadasProfessor([]);
        } finally {
            setCarregandoDisciplinasProfessor(false);
        }
    }

    async function handleSelecionarTurma(turmaId) {
        setTurmaSelecionadaId(turmaId);
        setErro("");
        setSucesso("");
        limparFormularioVinculo();

        if (!turmaId) {
            limparFormulario();
            setVinculosProfessor([]);
            return;
        }

        setCarregandoTurma(true);

        try {
            const turma = await obterTurmaPorId(turmaId);

            setNome(turma.nome || "");
            setNivelEnsinoId(String(turma.nivelEnsinoId || ""));
            setAnoLetivo(String(turma.anoLetivo || ""));
            setSala(turma.sala || "");
            setProfessorTutorNome(turma.professorTutorNome || "");
            setDescricao(turma.descricao || "");
            setAtiva(turma.ativa ?? true);

            await carregarVinculosTurma(turmaId);
        } catch (error) {
            setErro(error.message || "Erro ao carregar turma.");
        } finally {
            setCarregandoTurma(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            await atualizarTurma(turmaSelecionadaId, {
                nome,
                nivelEnsinoId: Number(nivelEnsinoId),
                anoLetivo: Number(anoLetivo),
                sala,
                professorTutorNome,
                descricao,
                ativa,
            });

            setSucesso("Turma atualizada com sucesso.");
        } catch (error) {
            setErro(error.message || "Erro ao atualizar turma.");
        } finally {
            setSalvando(false);
        }
    }

    async function handleExcluir() {
        if (!turmaSelecionadaId) return;

        setErro("");
        setSucesso("");
        setExcluindo(true);

        try {
            await excluirTurma(turmaSelecionadaId);
            setSucesso("Turma excluída com sucesso.");

            const turmasAtualizadas = turmas.filter(
                (t) => Number(t.turmaId) !== Number(turmaSelecionadaId)
            );

            setTurmas(turmasAtualizadas);
            setTurmaSelecionadaId("");
            setVinculosProfessor([]);
            limparFormulario();
            limparFormularioVinculo();
        } catch (error) {
            setErro(error.message || "Erro ao excluir turma.");
        } finally {
            setExcluindo(false);
        }
    }

    async function handleSelecionarProfessorVinculo(professorId) {
        setProfessorVinculoId(professorId);
        setDisciplinaVinculoId("");
        setErro("");
        setSucesso("");

        await carregarDisciplinasDoProfessor(professorId);
    }

    async function handleSalvarVinculo(event) {
        event.preventDefault();

        if (!turmaSelecionadaId) {
            setErro("Selecione uma turma.");
            return;
        }

        if (!professorVinculoId) {
            setErro("Selecione um professor.");
            return;
        }

        if (!disciplinaVinculoId) {
            setErro("Selecione uma disciplina.");
            return;
        }

        setErro("");
        setSucesso("");
        setSalvandoVinculo(true);

        try {
            if (modoSubstituicao && vinculoOriginal) {
                await removerProfessorDaTurma(
                    turmaSelecionadaId,
                    vinculoOriginal.professorId
                );
            }

            await atribuirProfessorNaTurma(turmaSelecionadaId, {
                professorId: Number(professorVinculoId),
                disciplinaId: Number(disciplinaVinculoId),
            });

            setSucesso(
                modoSubstituicao
                    ? "Vínculo professor/disciplina substituído com sucesso."
                    : "Professor e disciplina atribuídos com sucesso."
            );

            limparFormularioVinculo();
            await carregarVinculosTurma(turmaSelecionadaId);
        } catch (error) {
            setErro(error.message || "Erro ao salvar vínculo.");
        } finally {
            setSalvandoVinculo(false);
        }
    }

    async function handleRemoverVinculo(vinculo) {
        setErro("");
        setSucesso("");

        try {
            await removerProfessorDaTurma(turmaSelecionadaId, vinculo.professorId);
            setSucesso("Vínculo removido com sucesso.");

            if (
                vinculoOriginal &&
                Number(vinculoOriginal.professorId) === Number(vinculo.professorId)
            ) {
                limparFormularioVinculo();
            }

            await carregarVinculosTurma(turmaSelecionadaId);
        } catch (error) {
            setErro(error.message || "Erro ao remover vínculo.");
        }
    }

    async function handleSubstituirVinculo(vinculo) {
        setProfessorVinculoId(String(vinculo.professorId));
        setDisciplinaVinculoId(String(vinculo.disciplinaId));
        setModoSubstituicao(true);
        setVinculoOriginal(vinculo);
        setErro("");
        setSucesso("");

        await carregarDisciplinasDoProfessor(vinculo.professorId);
    }

    function handleCancelarSubstituicao() {
        limparFormularioVinculo();
        setErro("");
        setSucesso("");
    }

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    const disciplinasDisponiveis = useMemo(() => {
        if (!professorVinculoId || !nivelEnsinoId) return [];

        const filtradas = disciplinasHabilitadasProfessor.filter(
            (item) => Number(item.nivelEnsinoId) === Number(nivelEnsinoId)
        );

        const unicas = filtradas.filter(
            (item, index, array) =>
                index === array.findIndex(
                    (d) => Number(d.disciplinaId) === Number(item.disciplinaId)
                )
        );

        return unicas.sort((a, b) =>
            String(a.disciplinaNome || "").localeCompare(String(b.disciplinaNome || ""))
        );
    }, [disciplinasHabilitadasProfessor, professorVinculoId, nivelEnsinoId]);

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
                <div className="admin-form-wrapper admin-ajuste-turma-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title">Ajustes de Turma</h1>
                        <p className="admin-form-page-subtitle">
                            Selecione uma turma para visualizar, editar e gerenciar vínculos pedagógicos.
                        </p>
                    </div>

                    {(erro || sucesso) && (
                        <div className="admin-form-feedback">
                            {erro && <p className="public-feedback-error">{erro}</p>}
                            {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                        </div>
                    )}

                    <section className="admin-ajuste-turma-card">
                        <div className="form-section-title">
                            <FaChalkboard className="form-section-icon" />
                            <h2>Selecionar Turma</h2>
                        </div>

                        {carregandoLista ? (
                            <p className="admin-ajuste-turma-feedback">Carregando turmas...</p>
                        ) : (
                            <div className="admin-ajuste-turma-select-row">
                                <Select
                                    id="turmaSelecionadaId"
                                    label="Turma"
                                    value={turmaSelecionadaId}
                                    onChange={(e) => handleSelecionarTurma(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {turmas.map((turma) => (
                                        <option key={turma.turmaId} value={turma.turmaId}>
                                            {turma.nome} ({turma.anoLetivo})
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </section>

                    {turmaSelecionadaId && (
                        <>
                            <section className="admin-ajuste-turma-card">
                                {carregandoTurma ? (
                                    <p className="admin-ajuste-turma-feedback">
                                        Carregando dados da turma...
                                    </p>
                                ) : (
                                    <form onSubmit={handleSubmit} className="form-base">
                                        <div className="form-section-title">
                                            <FaChalkboard className="form-section-icon" />
                                            <h2>Dados da Turma</h2>
                                        </div>

                                        <div className="form-row">
                                            <Input
                                                id="nome"
                                                label="Nome"
                                                type="text"
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                            />

                                            <Select
                                                id="nivelEnsinoId"
                                                label="Nível de Ensino"
                                                value={nivelEnsinoId}
                                                onChange={(e) => setNivelEnsinoId(e.target.value)}
                                            >
                                                <option value="">Selecione</option>
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
                                                id="anoLetivo"
                                                label="Ano Letivo"
                                                type="number"
                                                value={anoLetivo}
                                                onChange={(e) => setAnoLetivo(e.target.value)}
                                            />

                                            <Input
                                                id="sala"
                                                label="Sala"
                                                type="text"
                                                value={sala}
                                                onChange={(e) => setSala(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-row">
                                            <Select
                                                id="professorTutorNome"
                                                label="Professor Tutor"
                                                value={professorTutorNome}
                                                onChange={(e) => setProfessorTutorNome(e.target.value)}
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
                                            rows={4}
                                        />

                                        <div className="admin-checkbox-group">
                                            <label className="admin-checkbox-field">
                                                <input
                                                    type="checkbox"
                                                    checked={ativa}
                                                    onChange={(e) => setAtiva(e.target.checked)}
                                                />
                                                <span>Turma ativa</span>
                                            </label>
                                        </div>

                                        <div className="form-actions">
                                            <Button
                                                type="button"
                                                variant="danger"
                                                onClick={handleExcluir}
                                                disabled={excluindo}
                                            >
                                                <FaTrash />
                                                {excluindo ? "Excluindo..." : "Excluir turma"}
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

                            <section className="admin-ajuste-turma-card">
                                <div className="form-section-title">
                                    <FaUsers className="form-section-icon" />
                                    <h2>
                                        {modoSubstituicao
                                            ? "Substituir vínculo professor/disciplina"
                                            : "Atribuir professor e disciplina"}
                                    </h2>
                                </div>

                                {modoSubstituicao && vinculoOriginal && (
                                    <div className="admin-ajuste-turma-alerta-box">
                                        <div className="admin-ajuste-turma-alerta-header">
                                            <FaExchangeAlt className="admin-ajuste-turma-alerta-icon" />
                                            <span>Vínculo em substituição</span>
                                        </div>
                                        <p className="admin-ajuste-turma-alerta-texto">
                                            <strong>Substituindo:</strong> {vinculoOriginal.professorNome} —{" "}
                                            {vinculoOriginal.disciplinaNome}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSalvarVinculo} className="form-base">
                                    <div className="form-row">
                                        <Select
                                            id="professorVinculoId"
                                            label="Professor"
                                            value={professorVinculoId}
                                            onChange={(e) =>
                                                handleSelecionarProfessorVinculo(e.target.value)
                                            }
                                        >
                                            <option value="">Selecione</option>
                                            {professores.map((professor) => (
                                                <option
                                                    key={professor.professorId}
                                                    value={professor.professorId}
                                                >
                                                    {professor.nomeCompleto}
                                                </option>
                                            ))}
                                        </Select>

                                        <Select
                                            id="disciplinaVinculoId"
                                            label="Disciplina"
                                            value={disciplinaVinculoId}
                                            onChange={(e) => setDisciplinaVinculoId(e.target.value)}
                                            disabled={
                                                !professorVinculoId || carregandoDisciplinasProfessor
                                            }
                                        >
                                            <option value="">
                                                {!professorVinculoId
                                                    ? "Selecione primeiro um professor"
                                                    : carregandoDisciplinasProfessor
                                                        ? "Carregando disciplinas..."
                                                        : "Selecione"}
                                            </option>
                                            {disciplinasDisponiveis.map((disciplina) => (
                                                <option
                                                    key={disciplina.disciplinaId}
                                                    value={disciplina.disciplinaId}
                                                >
                                                    {disciplina.disciplinaNome}
                                                </option>
                                            ))}
                                        </Select>
                                    </div>

                                    {professorVinculoId &&
                                        !carregandoDisciplinasProfessor &&
                                        disciplinasDisponiveis.length === 0 && (
                                            <p className="admin-ajuste-turma-feedback">
                                                Esse professor não possui disciplinas habilitadas para o
                                                nível de ensino desta turma.
                                            </p>
                                        )}

                                    <div className="form-actions">
                                        {modoSubstituicao && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={handleCancelarSubstituicao}
                                            >
                                                <FaTimes />
                                                Cancelar
                                            </Button>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="primary"
                                            loading={salvandoVinculo}
                                            disabled={salvandoVinculo}
                                        >
                                            <FaExchangeAlt />
                                            {modoSubstituicao
                                                ? "Salvar substituição"
                                                : "  Atribuir"}
                                        </Button>
                                    </div>
                                </form>
                            </section>

                            <section className="admin-ajuste-turma-card">
                                <div className="form-section-title">
                                    <FaBookOpen className="form-section-icon" />
                                    <h2>Professores e disciplinas atribuídos</h2>
                                </div>

                                {carregandoVinculos ? (
                                    <p className="admin-ajuste-turma-feedback">
                                        Carregando vínculos...
                                    </p>
                                ) : vinculosProfessor.length === 0 ? (
                                    <p className="admin-ajuste-turma-feedback">
                                        Nenhum professor/disciplina vinculado a esta turma.
                                    </p>
                                ) : (
                                    <div className="admin-grade-table-wrapper">
                                        <table className="admin-grade-table admin-ajuste-turma-table">
                                            <thead>
                                                <tr>
                                                    <th>Professor</th>
                                                    <th>Disciplina</th>
                                                    <th>Data do vínculo</th>
                                                    <th>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vinculosProfessor.map((vinculo) => (
                                                    <tr key={vinculo.turmaProfessorDisciplinaId}>
                                                        <td>{vinculo.professorNome}</td>
                                                        <td>{vinculo.disciplinaNome}</td>
                                                        <td>
                                                            {vinculo.dataVinculo
                                                                ? new Date(
                                                                    vinculo.dataVinculo
                                                                ).toLocaleString("pt-BR")
                                                                : "-"}
                                                        </td>
                                                        <td>
                                                            <div className="admin-ajuste-turma-table-actions">
                                                                <Button
                                                                    type="button"
                                                                    variant="secondary"
                                                                    onClick={() =>
                                                                        handleSubstituirVinculo(vinculo)
                                                                    }
                                                                >
                                                                    <FaEdit />

                                                                </Button>

                                                                <Button
                                                                    type="button"
                                                                    variant="danger"
                                                                    onClick={() =>
                                                                        handleRemoverVinculo(vinculo)
                                                                    }
                                                                >
                                                                    <FaTrash />

                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}