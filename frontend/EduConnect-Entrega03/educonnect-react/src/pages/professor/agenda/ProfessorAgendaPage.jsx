import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaCalendarAlt,
    FaPlus,
    FaTrash,
    FaTimes,
} from "react-icons/fa";

import { listarMinhasTurmasProfessor } from "../../../services/professorTurmaService";
import {
    listarAgendaPorTurma,
    listarAgendaDeMultiplasTurmas,
    criarEventoAgenda,
    excluirEventoAgenda,
} from "../../../services/agendaService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/input.css";
import "../../../styles/select.css";
import "../../../styles/textarea.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/professor.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import Textarea from "../../../components/ui/Textarea";
import AgendaCalendario from "../../../components/agenda/AgendaCalendario";

function formatarDataHoraExibicao(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function ProfessorAgendaPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [respostaTurmas, setRespostaTurmas] = useState(null);
    const [turmaId, setTurmaId] = useState("");

    const [titulo, setTitulo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [dataEvento, setDataEvento] = useState("");
    const [modalTurmaId, setModalTurmaId] = useState("");
    const [modalAberto, setModalAberto] = useState(false);

    const [eventosTurma, setEventosTurma] = useState([]);
    const [todosEventos, setTodosEventos] = useState([]);

    const [carregandoTurmas, setCarregandoTurmas] = useState(true);
    const [carregandoEventos, setCarregandoEventos] = useState(false);
    const [carregandoCalendario, setCarregandoCalendario] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [excluindoId, setExcluindoId] = useState(null);

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Professor";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Professor";

    useEffect(() => {
        async function carregarTurmas() {
            try {
                const data = await listarMinhasTurmasProfessor();
                setRespostaTurmas(data);
            } catch (error) {
                setErro(error.message || "Erro ao carregar turmas.");
            } finally {
                setCarregandoTurmas(false);
            }
        }

        carregarTurmas();
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

    const turmas = useMemo(() => {
        if (!respostaTurmas) return [];
        if (Array.isArray(respostaTurmas)) return respostaTurmas;
        if (Array.isArray(respostaTurmas.turmas)) return respostaTurmas.turmas;
        return [];
    }, [respostaTurmas]);

    const turmaSelecionada = useMemo(() => {
        return turmas.find((turma) => Number(turma.turmaId) === Number(turmaId));
    }, [turmas, turmaId]);

    async function carregarEventosTurma(idTurma) {
        if (!idTurma) {
            setEventosTurma([]);
            return;
        }

        setCarregandoEventos(true);

        try {
            const data = await listarAgendaPorTurma(idTurma);
            const lista = Array.isArray(data) ? data : [];

            lista.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento));
            setEventosTurma(lista);
        } catch (error) {
            setErro(error.message || "Erro ao carregar eventos.");
            setEventosTurma([]);
        } finally {
            setCarregandoEventos(false);
        }
    }

    async function carregarTodosEventosProfessor(listaTurmas) {
        if (!listaTurmas.length) {
            setTodosEventos([]);
            return;
        }

        setCarregandoCalendario(true);

        try {
            const ids = [...new Set(listaTurmas.map((turma) => turma.turmaId))];
            const eventos = await listarAgendaDeMultiplasTurmas(ids);

            const eventosComTurma = eventos.map((evento) => {
                const turma = listaTurmas.find(
                    (item) => Number(item.turmaId) === Number(evento.turmaId)
                );

                return {
                    ...evento,
                    turmaNome: evento.turmaNome || turma?.turmaNome || "-",
                };
            });

            eventosComTurma.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento));
            setTodosEventos(eventosComTurma);
        } catch (error) {
            setErro(error.message || "Erro ao carregar calendário.");
            setTodosEventos([]);
        } finally {
            setCarregandoCalendario(false);
        }
    }

    useEffect(() => {
        if (turmas.length > 0) {
            carregarTodosEventosProfessor(turmas);
        }
    }, [turmas]);

    useEffect(() => {
        carregarEventosTurma(turmaId);
    }, [turmaId]);

    function limparFormulario() {
        setTitulo("");
        setDescricao("");
        setDataEvento("");
        setModalTurmaId(turmaId || "");
    }

    function abrirModalNovoEvento() {
        setErro("");
        setSucesso("");
        setModalTurmaId(turmaId || "");
        setTitulo("");
        setDescricao("");
        setDataEvento("");
        setModalAberto(true);
    }

    function fecharModalNovoEvento() {
        setModalAberto(false);
        limparFormulario();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!modalTurmaId) {
            setErro("Selecione uma turma para o evento.");
            return;
        }

        if (!titulo.trim()) {
            setErro("Informe o título do evento.");
            return;
        }

        if (!dataEvento) {
            setErro("Informe a data do evento.");
            return;
        }

        setErro("");
        setSucesso("");
        setSalvando(true);

        try {
            await criarEventoAgenda({
                turmaId: Number(modalTurmaId),
                titulo: titulo.trim(),
                descricao: descricao.trim(),
                dataEvento: new Date(dataEvento).toISOString(),
            });

            setSucesso("Evento publicado com sucesso.");
            setModalAberto(false);

            if (!turmaId || Number(turmaId) === Number(modalTurmaId)) {
                setTurmaId(String(modalTurmaId));
                await carregarEventosTurma(modalTurmaId);
            }

            await carregarTodosEventosProfessor(turmas);
            limparFormulario();
        } catch (error) {
            setErro(error.message || "Erro ao publicar evento.");
        } finally {
            setSalvando(false);
        }
    }

    async function handleExcluirEvento(id) {
        setErro("");
        setSucesso("");
        setExcluindoId(id);

        try {
            await excluirEventoAgenda(id);
            setSucesso("Evento removido com sucesso.");
            await carregarEventosTurma(turmaId);
            await carregarTodosEventosProfessor(turmas);
        } catch (error) {
            setErro(error.message || "Erro ao remover evento.");
        } finally {
            setExcluindoId(null);
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

    const breadcrumbItems = [
        { label: "Home", path: "/professor" },
        { label: "Agenda" },
    ];

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
                homePath="/professor"
                rightContent={headerActions}
                showNotifications
            />

            <div className="main-container">
                <main className="main-content agenda-page professor-agenda-page">
                    <Breadcrumb items={breadcrumbItems} />

                    <div className="professor-page-header">
                        <h1 className="page-title">Agenda</h1>
                    </div>

                    {(erro || sucesso) && (
                        <div className="professor-form-feedback">
                            {erro && <p className="public-feedback-error">{erro}</p>}
                            {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                        </div>
                    )}

                    <section className="professor-agenda-card professor-agenda-calendar-card">

                        {carregandoCalendario ? (
                            <p className="professor-agenda-feedback">Carregando calendário...</p>
                        ) : (
                            <div className="professor-calendar-shell">
                                <AgendaCalendario eventos={todosEventos} />
                            </div>
                        )}
                    </section>

                    <section className="professor-agenda-card">
                        <div className="form-section-title">
                            <FaCalendarAlt className="form-section-icon" />
                            <h2>Eventos por turma</h2>
                        </div>

                        <div className="professor-agenda-toolbar">
                            {carregandoTurmas ? (
                                <p className="professor-agenda-feedback">Carregando turmas...</p>
                            ) : (
                                <div className="professor-agenda-filter">
                                    <Select
                                        id="turmaId"
                                        label="Turma / Disciplina"
                                        value={turmaId}
                                        onChange={(e) => setTurmaId(e.target.value)}
                                    >
                                        <option value="">Selecione</option>
                                        {turmas.map((turma) => (
                                            <option key={turma.turmaId} value={turma.turmaId}>
                                                {turma.turmaNome} - {turma.disciplinaNome}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}

                            {turmaSelecionada && (
                                <div className="professor-agenda-current-class">
                                    <span>{turmaSelecionada.turmaNome}</span>
                                    <small>{turmaSelecionada.disciplinaNome}</small>
                                </div>
                            )}
                        </div>

                        {!turmaId ? (
                            <p className="professor-agenda-feedback">
                                Selecione uma turma para visualizar os eventos publicados.
                            </p>
                        ) : carregandoEventos ? (
                            <p className="professor-agenda-feedback">Carregando eventos...</p>
                        ) : eventosTurma.length === 0 ? (
                            <p className="professor-agenda-feedback">
                                Nenhum evento publicado para esta turma.
                            </p>
                        ) : (
                            <div className="professor-table-wrapper">
                                <table className="professor-table">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Descrição</th>
                                            <th>Data do evento</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {eventosTurma.map((evento) => {
                                            const eventoId = evento.agendaEventoId || evento.id;

                                            return (
                                                <tr key={eventoId}>
                                                    <td>{evento.titulo || "-"}</td>
                                                    <td>{evento.descricao || "-"}</td>
                                                    <td>{formatarDataHoraExibicao(evento.dataEvento)}</td>
                                                    <td>
                                                        <div className="professor-table-actions">
                                                            <Button
                                                                type="button"
                                                                variant="danger"
                                                                onClick={() => handleExcluirEvento(eventoId)}
                                                                disabled={excluindoId === eventoId}
                                                            >
                                                                <FaTrash />
                                                                {excluindoId === eventoId
                                                                    ? "Removendo..."
                                                                    : "Remover"}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            <button
                type="button"
                className="professor-agenda-add-btn"
                onClick={abrirModalNovoEvento}
                title="Novo evento"
                aria-label="Novo evento"
            >
                <FaPlus />
            </button>

            {modalAberto && (
                <div
                    className="professor-agenda-modal-overlay"
                    onClick={fecharModalNovoEvento}
                >
                    <div
                        className="professor-agenda-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="professor-agenda-modal-header">
                            <h2>Novo Evento</h2>

                            <button
                                type="button"
                                className="professor-agenda-modal-close"
                                onClick={fecharModalNovoEvento}
                                aria-label="Fechar modal"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="form-base">
                            <Select
                                id="modalTurmaId"
                                label="Turma / Disciplina"
                                value={modalTurmaId}
                                onChange={(e) => setModalTurmaId(e.target.value)}
                            >
                                <option value="">Selecione</option>
                                {turmas.map((turma) => (
                                    <option key={turma.turmaId} value={turma.turmaId}>
                                        {turma.turmaNome} - {turma.disciplinaNome}
                                    </option>
                                ))}
                            </Select>

                            <Input
                                id="titulo"
                                label="Título"
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                placeholder="Ex.: Prova bimestral"
                            />

                            <Textarea
                                id="descricao"
                                label="Descrição"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                rows={4}
                                placeholder="Descreva o evento"
                            />

                            <Input
                                id="dataEvento"
                                label="Data e hora"
                                type="datetime-local"
                                value={dataEvento}
                                onChange={(e) => setDataEvento(e.target.value)}
                            />

                            <div className="form-actions professor-agenda-modal-actions">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={fecharModalNovoEvento}
                                >
                                    <FaTimes />
                                    Cancelar
                                </Button>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    loading={salvando}
                                    disabled={salvando}
                                >
                                    <FaPlus />
                                    {salvando ? "Publicando..." : "Salvar evento"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}