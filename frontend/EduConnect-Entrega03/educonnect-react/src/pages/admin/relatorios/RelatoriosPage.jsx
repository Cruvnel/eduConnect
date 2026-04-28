import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaMoon,
    FaSun,
    FaChartBar,
    FaFilePdf,
    FaChartLine,
} from "react-icons/fa";
import {
    buscarRelatorio,
    baixarRelatorioPdf,
} from "../../../services/relatorioService";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "../../../styles/global.css";
import "../../../styles/header.css";
import "../../../styles/profilemenu.css";
import "../../../styles/button.css";
import "../../../styles/select.css";
import "../../../styles/admin.css";

import logoSplash from "../../../assets/images/logo_splash.png";

import AppHeader from "../../../components/header/AppHeader";
import ProfileMenu from "../../../components/perfil/ProfileMenu";
import Button from "../../../components/ui/Button";
import Select from "../../../components/ui/Select";
import Breadcrumb from "../../../components/breadcrumb/Breadcrumb";

const OPCOES_RELATORIO = [
    { chave: "situacaoAlunos", titulo: "Situação dos Alunos" },
    { chave: "aprovacoesPorTurma", titulo: "Aprovação por Turma" },
    { chave: "mediaPorDisciplina", titulo: "Média por Disciplina" },
    { chave: "frequenciaMedia", titulo: "Frequência Média" },
];

const breadcrumbItems = [
    { label: "Home", path: "/admin" },
    { label: "Relatórios" },
];

function formatarValor(valor) {
    if (valor === null || valor === undefined) return "-";
    if (typeof valor === "boolean") return valor ? "Sim" : "Não";
    if (typeof valor === "number") {
        return Number.isInteger(valor) ? String(valor) : valor.toFixed(2);
    }
    return String(valor);
}

function formatarTituloCampo(chave) {
    return chave
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letra) => letra.toUpperCase())
        .trim();
}

function obterClasseValorRelatorio(coluna, valor) {
    const colunaNormalizada = String(coluna || "").toLowerCase();

    if (!colunaNormalizada.includes("media")) return "";

    const numero = Number(valor);

    if (Number.isNaN(numero)) return "";

    if (numero < 6) return "is-media-baixa";
    if (numero === 6) return "is-media-limite";
    return "is-media-boa";
}

function normalizarParaArray(data) {
    if (Array.isArray(data)) return { dados: data, resumo: false };
    if (data && Array.isArray(data.dados)) return { dados: data.dados, resumo: false };
    if (data && typeof data === "object") return { dados: [data], resumo: true };
    return { dados: [], resumo: false };
}

function descobrirChaveCategoria(item, preferidas) {
    if (!item) return null;

    for (const chave of preferidas) {
        if (Object.prototype.hasOwnProperty.call(item, chave)) {
            return chave;
        }
    }

    return Object.keys(item)[0] || null;
}

function descobrirChaveValor(item, ignorar = []) {
    if (!item) return null;

    const chaves = Object.keys(item).filter((chave) => !ignorar.includes(chave));
    const chaveNumerica = chaves.find((chave) => typeof item[chave] === "number");

    return chaveNumerica || null;
}

function montarGraficoSituacaoAlunos(item) {
    if (!item) return [];

    return [
        { nome: "Aprovados", valor: Number(item.aprovados || 0) },
        { nome: "Recuperação", valor: Number(item.recuperacao || 0) },
        { nome: "Reprovados", valor: Number(item.reprovados || 0) },
    ];
}

function montarGraficoFrequenciaMedia(dados, relatorioEhResumo) {
    if (!dados.length) return [];

    if (relatorioEhResumo) {
        const item = dados[0];

        return Object.entries(item).map(([chave, valor]) => ({
            nome: formatarTituloCampo(chave),
            valor: Number(valor || 0),
        }));
    }

    const exemplo = dados[0];
    const chaveCategoria = descobrirChaveCategoria(exemplo, [
        "turmaNome",
        "nivelEnsino",
        "categoria",
        "nome",
    ]);
    const chaveValor = descobrirChaveValor(exemplo, [chaveCategoria]);

    if (!chaveCategoria || !chaveValor) return [];

    return dados.map((item) => ({
        nome: item[chaveCategoria],
        valor: Number(item[chaveValor] || 0),
    }));
}

function montarGraficoAprovacoesPorTurma(dados) {
    if (!dados.length) return [];

    const exemplo = dados[0];
    const chaveCategoria = descobrirChaveCategoria(exemplo, [
        "turmaNome",
        "turma",
        "nomeTurma",
        "nome",
    ]);
    const chaveValor = descobrirChaveValor(exemplo, [chaveCategoria]);

    if (!chaveCategoria || !chaveValor) return [];

    return dados.map((item) => ({
        nome: item[chaveCategoria],
        valor: Number(item[chaveValor] || 0),
    }));
}

function montarGraficoMediaPorDisciplina(dados) {
    if (!dados.length) return [];

    const exemplo = dados[0];
    const chaveCategoria = descobrirChaveCategoria(exemplo, [
        "disciplinaNome",
        "disciplina",
        "nomeDisciplina",
        "nome",
    ]);
    const chaveValor = descobrirChaveValor(exemplo, [chaveCategoria]);

    if (!chaveCategoria || !chaveValor) return [];

    return dados.map((item) => ({
        nome: item[chaveCategoria],
        valor: Number(item[chaveValor] || 0),
    }));
}

function obterCoresGrafico() {
    const styles = getComputedStyle(document.body);

    const corTexto = styles.getPropertyValue("--cor-texto-principal").trim() || "#333333";
    const corTextoSecundario =
        styles.getPropertyValue("--cor-texto-secundario").trim() || "#666666";
    const corBorda = styles.getPropertyValue("--cor-borda").trim() || "#e1e5e9";
    const corNavbar = styles.getPropertyValue("--cor-navbar-fundo").trim() || "#2c5aa0";
    const corDestaque = styles.getPropertyValue("--cor-destaque").trim() || "#4db8e8";
    const corFundoSecundario =
        styles.getPropertyValue("--cor-fundo-secundario").trim() || "#ffffff";

    const darkModeAtivo = document.body.classList.contains("dark-mode");

    return {
        texto: corTexto,
        textoSecundario: corTextoSecundario,
        borda: corBorda,
        barraPrincipal: corNavbar,
        barraSecundaria: corDestaque,
        fundoTooltip: corFundoSecundario,
        pizza: [
            corNavbar,
            corDestaque,
            darkModeAtivo ? "#ff7b7b" : "#e74c3c",
        ],
    };
}

function GraficoPizza({ dados, cores }) {
    return (
        <div className="admin-relatorios-chart-box">
            <ResponsiveContainer>
                <PieChart margin={{ top: 10, right: 20, bottom: 35, left: 20 }}>
                    <Pie
                        data={dados}
                        dataKey="valor"
                        nameKey="nome"
                        outerRadius={75}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {dados.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={cores.pizza[index % cores.pizza.length]}
                                stroke={cores.fundoTooltip}
                            />
                        ))}
                    </Pie>

                    <Tooltip
                        contentStyle={{
                            backgroundColor: cores.fundoTooltip,
                            border: `1px solid ${cores.borda}`,
                            borderRadius: "8px",
                            color: cores.texto,
                        }}
                        labelStyle={{ color: cores.texto }}
                    />

                    <Legend
                        verticalAlign="bottom"
                        align="center"
                        height={28}
                        wrapperStyle={{
                            color: cores.textoSecundario,
                            fontSize: 13,
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

function GraficoBarras({ dados, nomeBarra = "Valor", cores }) {
    return (
        <div className="admin-relatorios-chart-box">
            <ResponsiveContainer>
                <BarChart data={dados}>
                    <CartesianGrid
                        stroke={cores.borda}
                        strokeDasharray="3 3"
                        opacity={0.5}
                    />

                    <XAxis
                        dataKey="nome"
                        tick={{ fill: cores.textoSecundario, fontSize: 12 }}
                        axisLine={{ stroke: cores.borda }}
                        tickLine={{ stroke: cores.borda }}
                    />

                    <YAxis
                        tick={{ fill: cores.textoSecundario, fontSize: 12 }}
                        axisLine={{ stroke: cores.borda }}
                        tickLine={{ stroke: cores.borda }}
                    />

                    <Tooltip
                        contentStyle={{
                            backgroundColor: cores.fundoTooltip,
                            border: `1px solid ${cores.borda}`,
                            borderRadius: "8px",
                            color: cores.texto,
                        }}
                        labelStyle={{ color: cores.texto }}
                    />

                    <Legend
                        wrapperStyle={{
                            color: cores.textoSecundario,
                            fontSize: 13,
                        }}
                    />

                    <Bar
                        dataKey="valor"
                        name={nomeBarra}
                        fill={cores.barraPrincipal}
                        radius={[6, 6, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function CardGrafico({ titulo, carregando, erro, children }) {
    return (
        <section className="admin-relatorios-chart-card">
            <h3 className="admin-relatorios-chart-title">{titulo}</h3>

            {carregando ? (
                <p className="admin-relatorios-feedback">Carregando...</p>
            ) : erro ? (
                <p className="public-feedback-error">{erro}</p>
            ) : (
                children
            )}
        </section>
    );
}

export default function RelatoriosPage() {
    const navigate = useNavigate();

    const [dashboardCarregando, setDashboardCarregando] = useState(true);
    const [dashboardErro, setDashboardErro] = useState("");

    const [situacaoAlunos, setSituacaoAlunos] = useState([]);
    const [situacaoAlunosResumo, setSituacaoAlunosResumo] = useState(false);

    const [frequenciaMedia, setFrequenciaMedia] = useState([]);
    const [frequenciaMediaResumo, setFrequenciaMediaResumo] = useState(false);

    const [aprovacoesPorTurma, setAprovacoesPorTurma] = useState([]);
    const [mediaPorDisciplina, setMediaPorDisciplina] = useState([]);

    const [tipoSelecionado, setTipoSelecionado] = useState("");
    const [dadosRelatorio, setDadosRelatorio] = useState([]);
    const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);
    const [baixando, setBaixando] = useState(false);
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

    useEffect(() => {
        async function carregarDashboard() {
            setDashboardCarregando(true);
            setDashboardErro("");

            try {
                const [
                    situacaoData,
                    frequenciaData,
                    aprovacoesData,
                    mediaData,
                ] = await Promise.all([
                    buscarRelatorio("situacaoAlunos"),
                    buscarRelatorio("frequenciaMedia"),
                    buscarRelatorio("aprovacoesPorTurma"),
                    buscarRelatorio("mediaPorDisciplina"),
                ]);

                const situacaoNormalizada = normalizarParaArray(situacaoData);
                const frequenciaNormalizada = normalizarParaArray(frequenciaData);
                const aprovacoesNormalizada = normalizarParaArray(aprovacoesData);
                const mediaNormalizada = normalizarParaArray(mediaData);

                setSituacaoAlunos(situacaoNormalizada.dados);
                setSituacaoAlunosResumo(situacaoNormalizada.resumo);

                setFrequenciaMedia(frequenciaNormalizada.dados);
                setFrequenciaMediaResumo(frequenciaNormalizada.resumo);

                setAprovacoesPorTurma(aprovacoesNormalizada.dados);
                setMediaPorDisciplina(mediaNormalizada.dados);
            } catch (error) {
                setDashboardErro(error.message || "Erro ao carregar dashboard.");
            } finally {
                setDashboardCarregando(false);
            }
        }

        carregarDashboard();
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

    useEffect(() => {
        if (erro) {
            const timer = setTimeout(() => setErro(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [erro]);

    useEffect(() => {
        if (sucesso) {
            const timer = setTimeout(() => setSucesso(""), 1000);
            return () => clearTimeout(timer);
        }
    }, [sucesso]);

    const dadosGraficoSituacao = useMemo(() => {
        return montarGraficoSituacaoAlunos(situacaoAlunos[0]);
    }, [situacaoAlunos]);

    const dadosGraficoFrequencia = useMemo(() => {
        return montarGraficoFrequenciaMedia(frequenciaMedia, frequenciaMediaResumo);
    }, [frequenciaMedia, frequenciaMediaResumo]);

    const dadosGraficoAprovacoes = useMemo(() => {
        return montarGraficoAprovacoesPorTurma(aprovacoesPorTurma);
    }, [aprovacoesPorTurma]);

    const dadosGraficoMedia = useMemo(() => {
        return montarGraficoMediaPorDisciplina(mediaPorDisciplina);
    }, [mediaPorDisciplina]);

    const colunas = useMemo(() => {
        if (!Array.isArray(dadosRelatorio) || dadosRelatorio.length === 0) return [];
        return Object.keys(dadosRelatorio[0]);
    }, [dadosRelatorio]);

    const coresGrafico = useMemo(() => {
        return obterCoresGrafico();
    }, [darkMode]);

    function handleLogout() {
        localStorage.clear();
        navigate("/");
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        setDarkMode(document.body.classList.contains("dark-mode"));
    }

    async function handleGerarRelatorio() {
        if (!tipoSelecionado) {
            setErro("Selecione um relatório.");
            return;
        }

        setErro("");
        setSucesso("");
        setCarregandoRelatorio(true);

        try {
            const data = await buscarRelatorio(tipoSelecionado);
            const resultado = normalizarParaArray(data);

            setDadosRelatorio(resultado.dados);
            setSucesso("Relatório carregado com sucesso.");
        } catch (error) {
            setErro(error.message || "Erro ao carregar relatório.");
            setDadosRelatorio([]);
        } finally {
            setCarregandoRelatorio(false);
        }
    }

    async function handleBaixarPdf() {
        if (!tipoSelecionado) {
            setErro("Selecione um relatório.");
            return;
        }

        setErro("");
        setSucesso("");
        setBaixando(true);

        try {
            await baixarRelatorioPdf(tipoSelecionado);
            setSucesso("PDF gerado com sucesso.");
        } catch (error) {
            setErro(error.message || "Erro ao gerar PDF.");
        } finally {
            setBaixando(false);
        }
    }

    const tituloSelecionado =
        OPCOES_RELATORIO.find((opcao) => opcao.chave === tipoSelecionado)?.titulo || "Resultado";

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
                <div className="admin-relatorios-wrapper">
                    <Breadcrumb items={breadcrumbItems} />
                    <div className="admin-form-page-header">
                        <h1 className="page-title admin-relatorios-page-title">
                            Relatórios Acadêmicos
                        </h1>
                    </div>

                    {dashboardErro && (
                        <div className="admin-form-feedback">
                            <p className="public-feedback-error">{dashboardErro}</p>
                        </div>
                    )}

                    <section className="charts-section">
                        <div className="metrics-divider"></div>

                        <div className="charts-grid admin-relatorios-charts-grid">
                            <CardGrafico
                                titulo="Aprovação por Turma"
                                carregando={dashboardCarregando}
                                erro={!dashboardCarregando && !dadosGraficoAprovacoes.length ? "Sem dados." : ""}
                            >
                                <GraficoBarras
                                    dados={dadosGraficoAprovacoes}
                                    nomeBarra="Aprovação"
                                    cores={coresGrafico}
                                />
                            </CardGrafico>

                            <CardGrafico
                                titulo="Média por Disciplina"
                                carregando={dashboardCarregando}
                                erro={!dashboardCarregando && !dadosGraficoMedia.length ? "Sem dados." : ""}
                            >
                                <GraficoBarras
                                    dados={dadosGraficoMedia}
                                    nomeBarra="Média"
                                    cores={coresGrafico}
                                />
                            </CardGrafico>

                            <CardGrafico
                                titulo="Frequência Média"
                                carregando={dashboardCarregando}
                                erro={!dashboardCarregando && !dadosGraficoFrequencia.length ? "Sem dados." : ""}
                            >
                                <GraficoBarras
                                    dados={dadosGraficoFrequencia}
                                    nomeBarra="Frequência"
                                    cores={coresGrafico}
                                />
                            </CardGrafico>

                            <CardGrafico
                                titulo="Situação dos Alunos"
                                carregando={dashboardCarregando}
                                erro={!dashboardCarregando && !dadosGraficoSituacao.length ? "Sem dados." : ""}
                            >
                                <GraficoPizza
                                    dados={dadosGraficoSituacao}
                                    cores={coresGrafico}
                                />
                            </CardGrafico>
                        </div>
                    </section>

                    <div className="metrics-divider"></div>

                    <section className="form-card-container admin-relatorios-form-card">
                        <div className="form-section-title">
                            <FaChartBar className="form-section-icon" />
                            <h2>Gerar Relatório</h2>
                        </div>

                        <div className="form-base">
                            <div className="form-grid admin-relatorios-form-grid-inline">
                                <Select
                                    id="tipoSelecionado"
                                    label="Tipo de Relatório"
                                    value={tipoSelecionado}
                                    onChange={(e) => setTipoSelecionado(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {OPCOES_RELATORIO.map((opcao) => (
                                        <option key={opcao.chave} value={opcao.chave}>
                                            {opcao.titulo}
                                        </option>
                                    ))}
                                </Select>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleGerarRelatorio}
                                    disabled={carregandoRelatorio}
                                >
                                    <FaChartLine />
                                    {carregandoRelatorio ? "Carregando..." : "Visualizar dados"}
                                </Button>

                                <Button
                                    type="button"
                                    variant="primary"
                                    onClick={handleBaixarPdf}
                                    disabled={baixando}
                                >
                                    <FaFilePdf />
                                    {baixando ? "Gerando PDF..." : "Baixar PDF"}
                                </Button>
                            </div>

                            {(erro || sucesso) && (
                                <div className="admin-relatorios-inline-feedback">
                                    {erro && <p className="public-feedback-error">{erro}</p>}
                                    {sucesso && <p className="public-feedback-success">{sucesso}</p>}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="admin-relatorios-resultado-card">
                        <h2 className="admin-relatorios-resultado-title">{tituloSelecionado}</h2>

                        {carregandoRelatorio ? (
                            <p className="admin-relatorios-feedback">Carregando relatório...</p>
                        ) : dadosRelatorio.length === 0 ? (
                            <p className="admin-relatorios-feedback">Nenhum dado carregado.</p>
                        ) : (
                            <div className="admin-relatorios-table-wrapper">
                                <table className="admin-relatorios-table">
                                    <thead>
                                        <tr>
                                            {colunas.map((coluna) => (
                                                <th key={coluna}>{formatarTituloCampo(coluna)}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dadosRelatorio.map((linha, index) => (
                                            <tr key={index}>
                                                {colunas.map((coluna) => (
                                                    <td
                                                        key={coluna}
                                                        className={obterClasseValorRelatorio(coluna, linha[coluna])}
                                                    >
                                                        {formatarValor(linha[coluna])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}