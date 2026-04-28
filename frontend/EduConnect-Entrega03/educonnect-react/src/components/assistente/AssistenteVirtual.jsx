import { useMemo, useState } from "react";
import "../../styles/assistente.css";
import roboEdu from "../../assets/images/robo_login - Copia.png";

export default function AssistenteVirtual() {
    const [isOpen, setIsOpen] = useState(false);
    const [etapaAtual, setEtapaAtual] = useState("inicio");

    const fluxo = useMemo(
        () => ({
            inicio: {
                mensagem: "Olá! 👋 Como posso te ajudar hoje?",
                opcoes: [
                    { texto: "Notas", destino: "notas" },
                    { texto: "Relatório", destino: "relatorio" },
                    { texto: "Chamada", destino: "chamada" },
                    { texto: "Falar com suporte", destino: "suporte" },
                ],
            },
            notas: {
                mensagem: "As notas devem ser acessadas pela aba Notas 📊.",
                opcoes: [{ texto: "Voltar ao menu inicial", destino: "inicio" }],
            },
            relatorio: {
                mensagem: "O relatório pode ser consultado na aba Turmas 📄.",
                opcoes: [{ texto: "Voltar ao menu inicial", destino: "inicio" }],
            },
            chamada: {
                mensagem: "A Chamada pode ser acessada na aba Chamada ✔️.",
                opcoes: [{ texto: "Voltar ao menu inicial", destino: "inicio" }],
            },
            suporte: {
                mensagem: `
                    Se você precisa de ajuda com o sistema, entre em contato com nosso suporte técnico <br /><br />
                    📧 <a href="mailto:educonnect.edu2026@gmail.com">suporte@educonnect.com</a>
                `,
                opcoes: [{ texto: "Voltar ao menu inicial", destino: "inicio" }],
            },
        }),
        []
    );

    const etapa = fluxo[etapaAtual];

    function handleOpen() {
        setIsOpen(true);
        setEtapaAtual("inicio");
    }

    function handleClose() {
        setIsOpen(false);
        setEtapaAtual("inicio");
    }

    function handleSelecionarOpcao(destino) {
        setEtapaAtual(destino);
    }

    return (
        <>
            <button
                type="button"
                className="chatbot-button"
                onClick={handleOpen}
                aria-label="Abrir assistente virtual"
                title="Assistente Edu"
            >
                <img src={roboEdu} alt="Assistente Edu" />
            </button>

            {isOpen && (
                <div className="chatbot-popup" role="dialog" aria-label="Assistente Edu">
                    <div className="chatbot-header">
                        <span>Assistente Edu</span>

                        <button
                            type="button"
                            className="chatbot-close"
                            onClick={handleClose}
                            aria-label="Fechar assistente"
                        >
                            &times;
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        <div
                            className="bot-message"
                            dangerouslySetInnerHTML={{ __html: etapa.mensagem }}
                        />

                        <div className="chatbot-options">
                            {etapa.opcoes.map((opcao) => (
                                <button
                                    key={`${etapaAtual}-${opcao.destino}-${opcao.texto}`}
                                    type="button"
                                    onClick={() => handleSelecionarOpcao(opcao.destino)}
                                >
                                    {opcao.texto}
                                </button>
                            ))}
                        </div>
                    </div>
                </div >
            )
            }
        </>
    );
}