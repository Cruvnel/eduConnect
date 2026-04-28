import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { listarMeusAlunosResponsavel } from "../services/responsavelService";

const ResponsavelAlunoContext = createContext(null);

const STORAGE_KEY = "responsavel_aluno_em_foco";

function obterNomeAluno(aluno) {
    return aluno?.nomeCompleto || `Aluno ${aluno?.alunoId ?? ""}`;
}

export function ResponsavelAlunoProvider({ children }) {
    const [alunos, setAlunos] = useState([]);
    const [alunoSelecionadoId, setAlunoSelecionadoId] = useState("");
    const [carregandoAlunos, setCarregandoAlunos] = useState(true);
    const [erroAlunos, setErroAlunos] = useState("");

    useEffect(() => {
        async function carregarAlunos() {
            try {
                const data = await listarMeusAlunosResponsavel();
                const lista = Array.isArray(data) ? data : [];

                setAlunos(lista);

                const salvo = localStorage.getItem(STORAGE_KEY);

                if (salvo && lista.some((aluno) => String(aluno.alunoId) === String(salvo))) {
                    setAlunoSelecionadoId(String(salvo));
                } else if (lista.length > 0) {
                    setAlunoSelecionadoId(String(lista[0].alunoId));
                    localStorage.setItem(STORAGE_KEY, String(lista[0].alunoId));
                }
            } catch (error) {
                setErroAlunos(error.message || "Erro ao carregar alunos do responsável.");
            } finally {
                setCarregandoAlunos(false);
            }
        }

        carregarAlunos();
    }, []);

    function selecionarAluno(alunoId) {
        const valor = String(alunoId || "");
        setAlunoSelecionadoId(valor);

        if (valor) {
            localStorage.setItem(STORAGE_KEY, valor);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    const alunoSelecionado = useMemo(() => {
        return alunos.find((aluno) => String(aluno.alunoId) === String(alunoSelecionadoId)) || null;
    }, [alunos, alunoSelecionadoId]);

    const value = useMemo(
        () => ({
            alunos,
            alunoSelecionado,
            alunoSelecionadoId,
            selecionarAluno,
            carregandoAlunos,
            erroAlunos,
            obterNomeAluno,
        }),
        [alunos, alunoSelecionado, alunoSelecionadoId, carregandoAlunos, erroAlunos]
    );

    return (
        <ResponsavelAlunoContext.Provider value={value}>
            {children}
        </ResponsavelAlunoContext.Provider>
    );
}

export function useResponsavelAluno() {
    const context = useContext(ResponsavelAlunoContext);

    if (!context) {
        throw new Error("useResponsavelAluno deve ser usado dentro de ResponsavelAlunoProvider.");
    }

    return context;
}