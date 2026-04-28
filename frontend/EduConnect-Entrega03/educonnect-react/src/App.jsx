import { Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

// público
import LoginPage from "./pages/public/LoginPage";
import EsqueciSenhaPage from "./pages/public/EsqueciSenhaPage";
import RedefinirSenhaPage from "./pages/public/RedefinirSenhaPage";
import InteresseMatriculaPage from "./pages/public/InteresseMatriculaPage";

// admin
import AdminHomePage from "./pages/admin/AdminHomePage";
import MatriculaListPage from "./pages/admin/matricula/MatriculaListPage";
import CadastroHomePage from "./pages/admin/cadastro/CadastroHomePage";
import CadastroProfessorPage from "./pages/admin/cadastro/CadastroProfessorPage";
import CadastroAlunoPage from "./pages/admin/cadastro/CadastroAlunoPage";
import CadastroDisciplinaPage from "./pages/admin/cadastro/CadastroDisciplinaPage";
import CadastroTurmaPage from "./pages/admin/cadastro/CadastroTurmaPage";
import TurmasListPage from "./pages/admin/turmas/TurmasListPage";
import TurmaDetalhePage from "./pages/admin/turmas/TurmaDetalhePage";
import PublicacoesPage from "./pages/admin/publicacoes/PublicacoesPage";
import AjustesHomePage from "./pages/admin/ajustes/AjustesHomePage";
import EditarProfessorPage from "./pages/admin/ajustes/EditarProfessorPage";
import EditarAlunoPage from "./pages/admin/ajustes/EditarAlunoPage";
import EditarResponsavelPage from "./pages/admin/ajustes/EditarResponsavelPage";
import EditarTurmaPage from "./pages/admin/ajustes/EditarTurmaPage";
import RelatoriosPage from "./pages/admin/relatorios/RelatoriosPage";

// professor
import ProfessorHomePage from "./pages/professor/ProfessorHomePage";
import ProfessorTurmasListPage from "./pages/professor/turmas/ProfessorTurmasListPage";
import ProfessorTurmaDetalhePage from "./pages/professor/turmas/ProfessorTurmaDetalhePage";
import ProfessorFrequenciaPage from "./pages/professor/frequencia/ProfessorFrequenciaPage";
import ProfessorNotasHomePage from "./pages/professor/notas/ProfessorNotasHomePage";
import ProfessorMateriaisPage from "./pages/professor/materiais/ProfessorMateriaisPage";
import ProfessorAgendaPage from "./pages/professor/agenda/ProfessorAgendaPage";
import ProfessorOcorrenciasPage from "./pages/professor/ocorrencias/ProfessorOcorrenciasPage";

// aluno
import AlunoHomePage from "./pages/aluno/AlunoHomePage";
import AlunoAgendaPage from "./pages/aluno/agenda/AlunoAgendaPage";
import AlunoMateriaisPage from "./pages/aluno/materiais/AlunoMateriaisPage";
import AlunoBoletimPage from "./pages/aluno/boletim/AlunoBoletimPage";
import AlunoFrequenciaPage from "./pages/aluno/frequencia/AlunoFrequenciaPage";
import AlunoOcorrenciasPage from "./pages/aluno/ocorrencias/AlunoOcorrenciasPage";
import AlunoDesempenhoPage from "./pages/aluno/desempenho/AlunoDesempenhoPage";

// responsável
import ResponsavelHomePage from "./pages/responsavel/ResponsavelHomePage";
import ResponsavelFinanceiroPage from "./pages/responsavel/financeiro/ResponsavelFinanceiroPage";
import { ResponsavelAlunoProvider } from "./contexts/ResponsavelAlunoContext";
import ResponsavelAgendaPage from "./pages/responsavel/agenda/ResponsavelAgendaPage";
import ResponsavelBoletimPage from "./pages/responsavel/boletim/ResponsavelBoletimPage";
import ResponsavelFrequenciaPage from "./pages/responsavel/frequencia/ResponsavelFrequenciaPage";
import ResponsavelOcorrenciaPage from "./pages/responsavel/ocorrencia/ResponsavelOcorrenciaPage";
import ResponsavelDesempenhoPage from "./pages/responsavel/desempenho/ResponsavelDesempenho";

export default function App() {
  const location = useLocation();
  const state = location.state;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
        <Route path="/matricula" element={<InteresseMatriculaPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/matricula"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <MatriculaListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cadastro"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <CadastroHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cadastro/professor"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <CadastroProfessorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cadastro/aluno"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <CadastroAlunoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cadastro/disciplina"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <CadastroDisciplinaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cadastro/turma"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <CadastroTurmaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/turmas"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <TurmasListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/turmas/:turmaId"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <TurmaDetalhePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/publicacoes"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <PublicacoesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ajustes"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <AjustesHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ajustes/professores"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <EditarProfessorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ajustes/alunos"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <EditarAlunoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ajustes/responsaveis"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <EditarResponsavelPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ajustes/turmas"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <EditarTurmaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/relatorios"
          element={
            <ProtectedRoute allowedRoles={["Administrador"]}>
              <RelatoriosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/turmas"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorTurmasListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/turmas/:turmaId"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorTurmaDetalhePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/frequencia"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorFrequenciaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/notas"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorNotasHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/materiais"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorMateriaisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/agenda"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorAgendaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/professor/ocorrencias"
          element={
            <ProtectedRoute allowedRoles={["Professor"]}>
              <ProfessorOcorrenciasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aluno"
          element={
            <ProtectedRoute allowedRoles={["Aluno"]}>
              <AlunoHomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aluno/agenda"
          element={
            <ProtectedRoute allowedRoles={["Aluno"]}>
              <AlunoAgendaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aluno/materiais"
          element={
            <ProtectedRoute allowedRoles={["Aluno"]}>
              <AlunoMateriaisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aluno/boletim"
          element={
            <ProtectedRoute allowedRoles={["Aluno"]}>
              <AlunoBoletimPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aluno/frequencia"
          element={
            <ProtectedRoute allowedRoles={["Aluno"]}>
              <AlunoFrequenciaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aluno/ocorrencias"
          element={
            <ProtectedRoute allowedRoles={["Aluno"]}>
              <AlunoOcorrenciasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/aluno/desempenho"
          element={
            <ProtectedRoute allowedRoles={["Aluno"]}>
              <AlunoDesempenhoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/responsavel"
          element={
            <ProtectedRoute allowedRoles={["Responsavel"]}>
              <ResponsavelAlunoProvider>
                <ResponsavelHomePage />
              </ResponsavelAlunoProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/responsavel/financeiro"
          element={
            <ProtectedRoute allowedRoles={["Responsavel"]}>
              <ResponsavelAlunoProvider>
                <ResponsavelFinanceiroPage />
              </ResponsavelAlunoProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/responsavel/agenda"
          element={
            <ProtectedRoute allowedRoles={["Responsavel"]}>
              <ResponsavelAlunoProvider>
                <ResponsavelAgendaPage />
              </ResponsavelAlunoProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/responsavel/desempenho"
          element={
            <ProtectedRoute allowedRoles={["Responsavel"]}>
              <ResponsavelAlunoProvider>
                <ResponsavelDesempenhoPage />
              </ResponsavelAlunoProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/responsavel/frequencia"
          element={
            <ProtectedRoute allowedRoles={["Responsavel"]}>
              <ResponsavelAlunoProvider>
                <ResponsavelFrequenciaPage />
              </ResponsavelAlunoProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/responsavel/boletim"
          element={
            <ProtectedRoute allowedRoles={["Responsavel"]}>
              <ResponsavelAlunoProvider>
                <ResponsavelBoletimPage />
              </ResponsavelAlunoProvider>
            </ProtectedRoute>
          }
        />

        <Route
          path="/responsavel/ocorrencia"
          element={
            <ProtectedRoute allowedRoles={["Responsavel"]}>
              <ResponsavelAlunoProvider>
                <ResponsavelOcorrenciaPage />
              </ResponsavelAlunoProvider>
            </ProtectedRoute>
          }
        />
      </Routes>

      {backgroundLocation && (
        <Routes>
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
        </Routes>
      )}
    </>
  );
}