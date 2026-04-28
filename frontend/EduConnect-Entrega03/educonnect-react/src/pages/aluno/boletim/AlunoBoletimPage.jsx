import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaDownload,
    FaTable,
} from "react-icons/fa";

import {
    obterBoletimAluno,
    baixarBoletimAlunoPdf,
} from "../../../services/alunoService";
import { obterUsuarioAtual } from "../../../services/authService";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/breadcrumb.css";
import "../../../styles/button.css";
import "../../../styles/aluno.css";

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

export default function AlunoBoletimPage() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    const [boletim, setBoletim] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [baixandoPdf, setBaixandoPdf] = useState(false);
    const [erro, setErro] = useState("");

    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(
        document.body.classList.contains("dark-mode")
    );

    const [usuario, setUsuario] = useState({
        nome: "",
        email: "",
        registro: "",
        perfil: "",
    });

    useEffect(() => {
        async function carregarUsuario() {
            try {
                const data = await obterUsuarioAtual();

                setUsuario({
                    nome: data.nome || "",
                    email: data.email || "",
                    registro: data.registro || "",
                    perfil: data.perfil || "",
                });

                localStorage.setItem("nome", data.nome || "");
                localStorage.setItem("email", data.email || "");
                localStorage.setItem("perfil", data.perfil || "");
                localStorage.setItem("registro", data.registro || "");
            } catch {
                setUsuario({
                    nome: localStorage.getItem("nome") || "Aluno",
                    email: localStorage.getItem("email") || "email@educonnect.com",
                    registro: localStorage.getItem("registro") || "",
                    perfil: localStorage.getItem("perfil") || "Aluno",
                });
            }
        }

        carregarUsuario();
    }, []);

    useEffect(() => {
        async function carregarBoletim() {
            try {
                const data = await obterBoletimAluno();

                const lista = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.disciplinas)
                        ? data.disciplinas
                        : [];

                setBoletim(lista);
            } catch (error) {
                setErro(error.message || "Erro ao carregar boletim.");
            } finally {
                setCarregando(false);
            }
        }

        carregarBoletim();
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

    const boletimOrdenado = useMemo(() => {
        return [...boletim].sort((a, b) =>
            String(a.disciplinaNome || a.disciplina || "").localeCompare(
                String(b.disciplinaNome || b.disciplina || "")
            )
        );
    }, [boletim]);

    async function handleBaixarPdf() {
        setErro("");
        setBaixandoPdf(true);

        try {
            await baixarBoletimAlunoPdf();
        } catch (error) {
            setErro(error.message || "Erro ao gerar PDF.");
        } finally {
            setBaixandoPdf(false);
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
        { label: "Home", path: "/aluno" },
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
                    nome={usuario.nome}
                    email={usuario.email}
                    perfil={usuario.perfil}
                    registro={usuario.registro}
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
                homePath="/aluno"
                rightContent={headerActions}
                showNotifications
            />

            <main className="main-content aluno-boletim-page">
                <Breadcrumb items={breadcrumbItems} />

                <div className="aluno-page-header">
                    <h1 className="page-title aluno-page-title">Boletim</h1>
                    <p className="aluno-page-subtitle">
                        Visualize suas notas por disciplina e gere seu boletim em PDF.
                    </p>
                </div>

                {erro && (
                    <div className="aluno-form-feedback">
                        <p className="public-feedback-error">{erro}</p>
                    </div>
                )}

                {carregando ? (
                    <p className="aluno-feedback">Carregando boletim...</p>
                ) : (
                    <section className="aluno-boletim-card">
                        <div className="aluno-boletim-header-row">
                            <div className="form-section-title aluno-boletim-title">
                                <FaTable className="form-section-icon" />
                                <h2>Meu boletim</h2>
                            </div>

                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleBaixarPdf}
                                disabled={baixandoPdf}
                            >
                                <FaDownload />
                                {baixandoPdf ? "Gerando PDF..." : "Emitir boletim em PDF"}
                            </Button>
                        </div>

                        {boletimOrdenado.length === 0 ? (
                            <p className="aluno-feedback">
                                Nenhum dado de boletim encontrado.
                            </p>
                        ) : (
                            <div className="aluno-table-wrapper">
                                <table className="aluno-table aluno-boletim-table">
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
                                        {boletimOrdenado.map((item, index) => {
                                            const situacao = item.situacao || item.Situacao || "-";

                                            return (
                                                <tr key={item.disciplinaId || index}>
                                                    <td>{item.disciplinaNome || item.disciplina || "-"}</td>
                                                    <td>{formatarNota(item.p1 ?? item.P1)}</td>
                                                    <td>{formatarNota(item.p2 ?? item.P2)}</td>
                                                    <td>{formatarNota(item.t1 ?? item.T1)}</td>
                                                    <td>{formatarNota(item.t2 ?? item.T2)}</td>
                                                    <td>{formatarNota(item.rec ?? item.REC)}</td>
                                                    <td>
                                                        <span className="aluno-grade-badge">
                                                            {formatarNota(item.mediaFinal ?? item.media)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="aluno-percentual-badge">
                                                            {item.frequenciaMedia === null || item.frequenciaMedia === undefined
                                                                ? "-"
                                                                : `${Number(item.frequenciaMedia).toFixed(1)}%`}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`aluno-status-badge ${obterClasseSituacao(situacao)}`}
                                                        >
                                                            {situacao}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </>
    );
}