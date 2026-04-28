import { useEffect, useMemo, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import {
    listarMinhasNotificacoes,
    marcarNotificacaoComoLida,
    limparMinhasNotificacoes,
} from "../../services/notificacaoService";

import "../../styles/notification.css";

function formatarDataHora(data) {
    if (!data) return "-";

    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

export default function NotificationMenu() {
    const [open, setOpen] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const notificationRef = useRef(null);

    const naoLidas = useMemo(() => {
        return notificacoes.filter((n) => !n.lida).length;
    }, [notificacoes]);

    useEffect(() => {
        async function carregarNotificacoes() {
            setCarregando(true);
            setErro("");

            try {
                const data = await listarMinhasNotificacoes();
                setNotificacoes(Array.isArray(data) ? data : []);
            } catch (error) {
                setErro(error.message || "Erro ao carregar notificações.");
            } finally {
                setCarregando(false);
            }
        }

        carregarNotificacoes();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    async function handleMarcarComoLida(notificacao) {
        if (notificacao.lida) return;

        try {
            await marcarNotificacaoComoLida(notificacao.notificacaoId);

            setNotificacoes((prev) =>
                prev.map((item) =>
                    item.notificacaoId === notificacao.notificacaoId
                        ? {
                            ...item,
                            lida: true,
                            dataLeitura: new Date().toISOString(),
                        }
                        : item
                )
            );
        } catch (error) {
            setErro(error.message || "Erro ao atualizar notificação.");
        }
    }

    async function handleLimparNotificacoes() {
        try {
            await limparMinhasNotificacoes();
            setNotificacoes([]);
        } catch (error) {
            setErro(error.message || "Erro ao limpar notificações.");
        }
    }

    return (
        <div className="notification-anchor" ref={notificationRef}>
            <button
                type="button"
                className="icon-btn notification-menu-button"
                title="Notificações"
                onClick={() => setOpen((prev) => !prev)}
            >
                <FaBell />

                {naoLidas > 0 && (
                    <span className="notification-badge">{naoLidas}</span>
                )}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-header">
                        <strong>Notificações</strong>
                        <span>{naoLidas} não lida(s)</span>
                    </div>

                    {erro && (
                        <p className="notification-feedback-error">{erro}</p>
                    )}

                    {carregando ? (
                        <p className="notification-feedback">
                            Carregando notificações...
                        </p>
                    ) : notificacoes.length === 0 ? (
                        <p className="notification-feedback">
                            Nenhuma notificação encontrada.
                        </p>
                    ) : (
                        <>
                            {/* LISTA COM SCROLL */}
                            <div className="notification-list">
                                {notificacoes.map((notificacao) => (
                                    <button
                                        key={notificacao.notificacaoId}
                                        type="button"
                                        className={`notification-item ${notificacao.lida ? "is-read" : "is-unread"
                                            }`}
                                        onClick={() =>
                                            handleMarcarComoLida(notificacao)
                                        }
                                    >
                                        <div className="notification-item-header">
                                            <h4>
                                                {notificacao.titulo || "Notificação"}
                                            </h4>

                                            {!notificacao.lida && (
                                                <span className="notification-dot" />
                                            )}
                                        </div>

                                        <p>{notificacao.mensagem}</p>

                                        <div className="notification-item-meta">
                                            <span>{notificacao.tipo}</span>
                                            <span>
                                                {formatarDataHora(
                                                    notificacao.dataEnvio
                                                )}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* FOOTER FIXO */}
                            <div className="notification-footer">
                                <div className="notification-divider" />

                                <button
                                    type="button"
                                    className="notification-menu-clear"
                                    onClick={handleLimparNotificacoes}
                                >
                                    Limpar notificações
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}