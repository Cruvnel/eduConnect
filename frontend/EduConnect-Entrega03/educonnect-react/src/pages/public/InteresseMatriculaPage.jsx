import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadDocumento } from "../../services/uploadService";
import { criarInteresseMatricula } from "../../services/interesseMatriculaService";

import "../../styles/global.css";
import "../../styles/public.css";
import "../../styles/matricula.css";

// imagens
import logoSplash from "../../assets/images/logo_splash.png";

// components
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import AppHeader from "../../components/header/AppHeader";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import FileInput from "../../components/ui/FileInput";

export default function InteresseMatriculaPage() {
    const navigate = useNavigate();

    const [nomeResponsavel, setNomeResponsavel] = useState("");
    const [dataNascimentoResponsavel, setDataNascimentoResponsavel] = useState("");
    const [emailContato, setEmailContato] = useState("");
    const [telefone, setTelefone] = useState("");

    const [nomeAluno, setNomeAluno] = useState("");
    const [dataNascimentoAluno, setDataNascimentoAluno] = useState("");
    const [anoEscolarAtual, setAnoEscolarAtual] = useState("");
    const [observacoes, setObservacoes] = useState("");

    const [documentoResponsavelFile, setDocumentoResponsavelFile] = useState(null);
    const [documentoAlunoFile, setDocumentoAlunoFile] = useState(null);

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setErro("");
        setSucesso(false);

        if (!documentoResponsavelFile) {
            setErro("Selecione o documento do responsável.");
            return;
        }

        if (!documentoAlunoFile) {
            setErro("Selecione o documento do aluno.");
            return;
        }

        setCarregando(true);

        try {
            const uploadResponsavel = await uploadDocumento(documentoResponsavelFile);
            const uploadAluno = await uploadDocumento(documentoAlunoFile);

            const documentoResponsavelUrl = uploadResponsavel.url;
            const documentoAlunoUrl = uploadAluno.url;

            if (!documentoResponsavelUrl) {
                throw new Error("Não foi possível obter a URL do documento do responsável.");
            }

            if (!documentoAlunoUrl) {
                throw new Error("Não foi possível obter a URL do documento do aluno.");
            }

            await criarInteresseMatricula({
                nomeResponsavel,
                dataNascimentoResponsavel,
                emailContato,
                telefone,
                documentoResponsavelUrl,
                nomeAluno,
                dataNascimentoAluno,
                anoEscolarAtual,
                documentoAlunoUrl,
                observacoes,
            });

            setNomeResponsavel("");
            setDataNascimentoResponsavel("");
            setEmailContato("");
            setTelefone("");
            setNomeAluno("");
            setDataNascimentoAluno("");
            setAnoEscolarAtual("");
            setObservacoes("");
            setDocumentoResponsavelFile(null);
            setDocumentoAlunoFile(null);

            setSucesso(true);
        } catch (error) {
            setErro(error.message || "Erro ao enviar interesse de matrícula.");
        } finally {
            setCarregando(false);
        }
    }

    function fecharModal() {
        setSucesso(false);
        navigate("/");
    }

    return (
        <>
            <AppHeader
                logo={logoSplash}
                homePath="/"
                showBackButton
                onBack={() => navigate("/")}
            />

            <main className="matricula-main">
                <div className="matricula-card">
                    <h2 className="matricula-title">Interesse de Matrícula</h2>
                    <p className="matricula-description">
                        Preencha os dados abaixo e entraremos em contato.
                    </p>

                    <form className="matricula-form" onSubmit={handleSubmit}>
                        <fieldset className="matricula-section">
                            <legend className="matricula-section-title">
                                Dados do Responsável
                            </legend>

                            <Input
                                id="responsavelNome"
                                label="Nome do responsável"
                                type="text"
                                value={nomeResponsavel}
                                onChange={(e) => setNomeResponsavel(e.target.value)}
                                required
                            />

                            <Input
                                id="responsavelNascimento"
                                label="Data de nascimento"
                                type="date"
                                value={dataNascimentoResponsavel}
                                onChange={(e) => setDataNascimentoResponsavel(e.target.value)}
                                required
                            />

                            <Input
                                id="responsavelEmail"
                                label="E-mail de contato"
                                type="email"
                                value={emailContato}
                                onChange={(e) => setEmailContato(e.target.value)}
                                required
                            />

                            <Input
                                id="responsavelTelefone"
                                label="Telefone"
                                type="tel"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                required
                            />

                            <FileInput
                                id="rgResponsavel"
                                label="RG do responsável (upload)"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={setDocumentoResponsavelFile}
                            />
                        </fieldset>

                        <fieldset className="matricula-section">
                            <legend className="matricula-section-title">
                                Dados do Aluno
                            </legend>

                            <Input
                                id="alunoNome"
                                label="Nome do aluno"
                                type="text"
                                value={nomeAluno}
                                onChange={(e) => setNomeAluno(e.target.value)}
                                required
                            />

                            <Input
                                id="alunoNascimento"
                                label="Data de nascimento"
                                type="date"
                                value={dataNascimentoAluno}
                                onChange={(e) => setDataNascimentoAluno(e.target.value)}
                                required
                            />

                            <div className="form-group">
                                <Select
                                    id="anoEscolar"
                                    label="Período escolar atual"
                                    value={anoEscolarAtual}
                                    onChange={(e) => setAnoEscolarAtual(e.target.value)}
                                    required
                                >
                                    <option value="">Selecione</option>
                                    <option value="Educação Infantil">Educação Infantil</option>
                                    <option value="Ensino Fundamental">Ensino Fundamental</option>
                                    <option value="Ensino Médio">Ensino Médio</option>
                                </Select>
                            </div>

                            <FileInput
                                id="rgAluno"
                                label="RG do aluno (upload)"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={setDocumentoAlunoFile}
                            />
                        </fieldset>

                        <fieldset className="matricula-section">
                            <legend className="matricula-section-title">
                                Observações
                            </legend>

                            <div className="matricula-textarea-group">
                                <Textarea
                                    id="observacoes"
                                    rows={4}
                                    placeholder="Ex: necessidade especial, turno desejado, etc."
                                    value={observacoes}
                                    onChange={(e) => setObservacoes(e.target.value)}
                                />
                            </div>
                        </fieldset>

                        {erro && <p className="public-feedback-error">{erro}</p>}

                        <div className="matricula-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={carregando}
                            >
                                Enviar interesse
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            {sucesso && (
                <Modal
                    title="Interesse enviado"
                    description="Obrigada pelo interesse em fazer parte da nossa instituição. Entraremos em contato!"
                    onClose={fecharModal}
                >
                    <Button
                        type="button"
                        variant="primary"
                        fullWidth
                        onClick={fecharModal}
                    >
                        OK
                    </Button>
                </Modal>
            )}
        </>
    );
}