import { useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import "../../styles/agenda.css";

function formatarChaveData(data) {
    const date = new Date(data);
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function formatarMesAno(dataBase) {
    return dataBase.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
}

function gerarDiasDoCalendario(dataBase) {
    const ano = dataBase.getFullYear();
    const mes = dataBase.getMonth();

    const primeiroDiaMes = new Date(ano, mes, 1);
    const ultimoDiaMes = new Date(ano, mes + 1, 0);

    const primeiroDiaSemana = primeiroDiaMes.getDay();
    const diasNoMes = ultimoDiaMes.getDate();

    const dias = [];

    for (let i = 0; i < primeiroDiaSemana; i++) {
        dias.push(null);
    }

    for (let dia = 1; dia <= diasNoMes; dia++) {
        dias.push(new Date(ano, mes, dia));
    }

    while (dias.length % 7 !== 0) {
        dias.push(null);
    }

    return dias;
}

function formatarDataHoraExibicao(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function AgendaCalendario({ eventos = [] }) {
    const [dataBase, setDataBase] = useState(new Date());
    const [dataSelecionada, setDataSelecionada] = useState(null);

    const diasCalendario = useMemo(() => gerarDiasDoCalendario(dataBase), [dataBase]);

    const eventosPorDia = useMemo(() => {
        const mapa = {};

        for (const evento of eventos) {
            const chave = formatarChaveData(evento.dataEvento);
            if (!mapa[chave]) mapa[chave] = [];
            mapa[chave].push(evento);
        }

        return mapa;
    }, [eventos]);

    const eventosDiaSelecionado = useMemo(() => {
        if (!dataSelecionada) return [];
        const chave = formatarChaveData(dataSelecionada);
        return eventosPorDia[chave] || [];
    }, [dataSelecionada, eventosPorDia]);

    function mesAnterior() {
        setDataBase((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }

    function proximoMes() {
        setDataBase((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }

    return (
        <>
            <section className="agenda-calendario">
                <div className="agenda-calendario-header">
                    <button
                        type="button"
                        className="agenda-calendario-nav-btn"
                        onClick={mesAnterior}
                        aria-label="Mês anterior"
                    >
                        <FaChevronLeft />
                    </button>

                    <h2 className="agenda-calendario-title">
                        {formatarMesAno(dataBase)}
                    </h2>

                    <button
                        type="button"
                        className="agenda-calendario-nav-btn"
                        onClick={proximoMes}
                        aria-label="Próximo mês"
                    >
                        <FaChevronRight />
                    </button>
                </div>

                <div className="agenda-calendario-weekdays">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
                        <div key={dia} className="agenda-calendario-weekday">
                            {dia}
                        </div>
                    ))}
                </div>

                <div className="agenda-calendario-grid">
                    {diasCalendario.map((dia, index) => {
                        if (!dia) {
                            return (
                                <div
                                    key={`vazio-${index}`}
                                    className="agenda-calendario-day agenda-calendario-day-empty"
                                />
                            );
                        }

                        const chave = formatarChaveData(dia);
                        const eventosDia = eventosPorDia[chave] || [];
                        const hoje = formatarChaveData(new Date()) === chave;

                        return (
                            <button
                                key={chave}
                                type="button"
                                className={`agenda-calendario-day ${hoje ? "is-today" : ""}`}
                                onClick={() => setDataSelecionada(dia)}
                            >
                                <div className="agenda-calendario-day-number">
                                    {dia.getDate()}
                                </div>

                                <div className="agenda-calendario-day-events">
                                    {eventosDia.slice(0, 2).map((evento) => (
                                        <div
                                            key={evento.agendaEventoId || evento.id}
                                            className="agenda-calendario-event-indicator"
                                            title={evento.titulo}
                                        >
                                            {evento.titulo}
                                        </div>
                                    ))}

                                    {eventosDia.length > 2 && (
                                        <div className="agenda-calendario-more-events">
                                            +{eventosDia.length - 2} mais
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {dataSelecionada && (
                <div
                    className="agenda-calendario-modal-overlay"
                    onClick={() => setDataSelecionada(null)}
                >
                    <div
                        className="agenda-calendario-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="agenda-calendario-modal-header">
                            <h3>
                                Eventos de {dataSelecionada.toLocaleDateString("pt-BR")}
                            </h3>

                            <button
                                type="button"
                                className="agenda-calendario-modal-close"
                                onClick={() => setDataSelecionada(null)}
                                aria-label="Fechar"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {eventosDiaSelecionado.length === 0 ? (
                            <p className="agenda-calendario-empty-text">
                                Nenhum evento neste dia.
                            </p>
                        ) : (
                            <div className="agenda-calendario-modal-list">
                                {eventosDiaSelecionado.map((evento) => (
                                    <div
                                        key={evento.agendaEventoId || evento.id}
                                        className="agenda-calendario-modal-item"
                                    >
                                        <p>
                                            <strong>Título:</strong> {evento.titulo || "-"}
                                        </p>
                                        <p>
                                            <strong>Descrição:</strong> {evento.descricao || "-"}
                                        </p>
                                        <p>
                                            <strong>Data:</strong>{" "}
                                            {formatarDataHoraExibicao(evento.dataEvento)}
                                        </p>
                                        <p>
                                            <strong>Turma:</strong> {evento.turmaNome || "-"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}