import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaTable,
    FaDownload,
    FaBookOpen,
} from "react-icons/fa";

import {
    obterBoletimResponsavel,
    baixarBoletimResponsavelPdf,
} from "../../../services/responsavelService";
import { useResponsavelAluno } from "../../../contexts/ResponsavelAlunoContext";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/button.css";
import "../../../styles/responsavel.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";
import Button from "../../../components/ui/Button";

function formatarNota(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";

    const numero = Number(valor);
    return Number.isNaN(numero) ? "-" : numero.toFixed(1);
}

function obterClasseSituacao(situacao) {
    const texto = String(situacao || "").toLowerCase();

    if (texto.includes("reprovado")) return "is-reprovado";
    if (texto.includes("aprovado")) return "is-aprovado";
    if (texto.includes("recuperação")) return "is-recuperacao";
    if (texto.includes("análise") || texto.includes("analise")) return "is-analise";

    return "is-analise";
}

function formatarPercentual(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";

    const numero = Number(valor);
    return Number.isNaN(numero) ? "-" : `${numero.toFixed(1)}%`;
}

export default function ResponsavelBoletimPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const {
        alunos,
        alunoSelecionado,
        alunoSelecionadoId,
        carregandoAlunos,
        erroAlunos,
        obterNomeAluno,
    } = useResponsavelAluno();

    const alunoEmFoco = alunoSelecionado;
    const deveMostrarAlunoEmFoco = alunos.length > 1 && alunoEmFoco;

    const [boletim, setBoletim] = useState(null);
    const [disciplinas, setDisciplinas] = useState([]);
    const [carregandoBoletim, setCarregandoBoletim] = useState(false);
    const [baixandoPdf, setBaixandoPdf] = useState(false);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const nomeUsuario = localStorage.getItem("nome") || "Responsável";
    const emailUsuario = localStorage.getItem("email") || "email@educonnect.com";
    const registroUsuario = localStorage.getItem("registro") || "";
    const perfilUsuario = localStorage.getItem("perfil") || "Responsável";

    useEffect(() => {
        async function carregarBoletim() {
            if (!alunoSelecionadoId) {
                setBoletim(null);
                setDisciplinas([]);
                return;
            }

            setErro("");
            setCarregandoBoletim(true);

            try {
                const data = await obterBoletimResponsavel(alunoSelecionadoId);

                setBoletim(data || null);
                setDisciplinas(Array.isArray(data?.disciplinas) ? data.disciplinas : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar boletim.");
                setBoletim(null);
                setDisciplinas([]);
            } finally {
                setCarregandoBoletim(false);
            }
        }

        carregarBoletim();
    }, [alunoSelecionadoId]);

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

    const disciplinasOrdenadas = useMemo(() => {
        return [...disciplinas].sort((a, b) =>
            String(a.disciplinaNome || "").localeCompare(String(b.disciplinaNome || ""))
        );
    }, [disciplinas]);

    async function handleBaixarPdf() {
        if (!alunoSelecionadoId) return;

        setErro("");
        setBaixandoPdf(true);

        try {
            await baixarBoletimResponsavelPdf(alunoSelecionadoId);
        } catch (error) {
            setErro(error.message || "Erro ao gerar PDF.");
        } finally {
            setBaixandoPdf(false);
        }
    }

    function handleLogout() {
        localStorage.clear();
        localStorage.removeItem("responsavel_aluno_em_foco");
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    const erroGeral = erro || erroAlunos;

    const breadcrumbItems = [
        { label: "Home", path: "/responsavel" },
        { label: "Boletim" },
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
                homePath="/responsavel"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-content responsavel-boletim-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="responsavel-page-header">
                    <h1 className="page-title responsavel-page-title">Boletim</h1>
                    <p className="responsavel-page-subtitle">
                        Visualize as notas do aluno em foco e gere o boletim em PDF.
                    </p>
                </div>

                {erroGeral && (
                    <div className="responsavel-form-feedback">
                        <p className="public-feedback-error">{erroGeral}</p>
                    </div>
                )}

                {(carregandoAlunos || carregandoBoletim) ? (
                    <p className="responsavel-feedback">Carregando boletim...</p>
                ) : !alunoSelecionado ? (
                    <p className="responsavel-feedback">
                        Selecione um aluno na página inicial do responsável.
                    </p>
                ) : (
                    <>
                        {deveMostrarAlunoEmFoco && (
                            <section className="responsavel-boletim-focus-card responsavel-home-focus-card">
                                <div className="responsavel-home-focus-compact">
                                    <div className="responsavel-home-focus-compact-header">
                                        <span className="responsavel-home-focus-label">Aluno em foco</span>
                                    </div>

                                    <div className="responsavel-home-focus-inline-info">
                                        <span>{obterNomeAluno(alunoEmFoco)}</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="responsavel-boletim-card">
                            <div className="responsavel-boletim-header-row">
                                <div className="responsavel-boletim-title-row">
                                    <FaTable className="form-section-icon" />
                                    <h2>Boletim</h2>
                                </div>

                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleBaixarPdf}
                                    disabled={!alunoSelecionadoId || baixandoPdf}
                                >
                                    <FaDownload />
                                    {baixandoPdf ? "Gerando PDF..." : "Emitir boletim PDF"}
                                </Button>
                            </div>

                            {disciplinasOrdenadas.length === 0 ? (
                                <p className="responsavel-feedback">
                                    Nenhum dado de boletim encontrado para o aluno em foco.
                                </p>
                            ) : (
                                <div className="responsavel-table-wrapper">
                                    <table className="responsavel-table responsavel-boletim-table">
                                        <thead>
                                            <tr>
                                                <th>Disciplina</th>
                                                <th>P1</th>
                                                <th>P2</th>
                                                <th>T1</th>
                                                <th>T2</th>
                                                <th>REC</th>
                                                <th>Média</th>
                                                <th>Frequência</th>
                                                <th>Situação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {disciplinasOrdenadas.map((item) => (
                                                <tr key={item.disciplinaId}>
                                                    <td>{item.disciplinaNome || "-"}</td>
                                                    <td>{formatarNota(item.p1 ?? item.P1)}</td>
                                                    <td>{formatarNota(item.p2 ?? item.P2)}</td>
                                                    <td>{formatarNota(item.t1 ?? item.T1)}</td>
                                                    <td>{formatarNota(item.t2 ?? item.T2)}</td>
                                                    <td>{formatarNota(item.rec ?? item.REC)}</td>
                                                    <td>
                                                        <span className="responsavel-grade-badge">
                                                            {formatarNota(item.mediaFinal ?? item.media)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="responsavel-percentual-badge">
                                                            {formatarPercentual(item.frequenciaMedia)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`responsavel-status-badge ${obterClasseSituacao(
                                                                item.situacao ?? item.Situacao
                                                            )}`}
                                                        >
                                                            {item.situacao ?? item.Situacao ?? "-"}
                                                        </span>
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
            </main>
        </>
    );
}