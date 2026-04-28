# 📚 EduConnect API v1

Base URL:  
http://localhost:5267  

Swagger:  
http://localhost:5267/swagger  

---

# 🧠 Visão Geral

A API do EduConnect é responsável por gerenciar o ciclo completo de uma instituição de ensino, incluindo:

- Gestão acadêmica (turmas, disciplinas, professores)
- Gestão de usuários (alunos, responsáveis, professores)
- Controle pedagógico (notas, frequência, ocorrências)
- Comunicação (agenda, comunicados e materiais)
- Emissão de Relatórios
- Autenticação e segurança

A arquitetura segue princípios RESTful, com separação clara entre:

- Cadastro de entidades
- Relacionamentos acadêmicos
- Operações pedagógicas
- Consumo por perfil (Aluno, Professor, Responsável, Admin)

---

# 👨‍💼 Administradores

Endpoints administrativos e validação de acesso.

### GET /api/Administradores/teste  
Valida autenticação e autorização do administrador.

---

# 📅 Agenda

Gerenciamento de eventos acadêmicos (provas, atividades, comunicados).

### POST /api/Agenda  
Cria um evento para uma turma.

### GET /api/Agenda/turma/{turmaId}  
Lista todos os eventos da turma.

### GET /api/Agenda/{id}  
Retorna detalhes de um evento específico.

### DELETE /api/Agenda/{id}  
Remove um evento da agenda.

---

# 👨‍🎓 Alunos

Gerenciamento e consumo de informações pelo aluno autenticado.

### POST /api/Alunos  
Cadastra aluno e responsável simultaneamente.  
- Cria usuário(s)
- Gera credenciais
- Envia e-mail automático

### GET /api/Alunos/me  
Retorna dados completos do aluno autenticado, incluindo vínculo com turma.

### GET /api/Alunos/me/agenda  
Lista eventos da turma do aluno.

### GET /api/Alunos/me/boletim  
Retorna desempenho acadêmico consolidado por disciplina.

### GET /api/Alunos/me/boletim/pdf  
Gera boletim em PDF.

### GET /api/Alunos/me/frequencia  
Lista presença/ausência por aula.

### GET /api/Alunos/me/materiais  
Lista materiais disponibilizados pelos professores.

### GET /api/Alunos/me/ocorrencias  
Lista registros disciplinares do aluno.

---

# 🔐 Auth

Autenticação e recuperação de senha.

### POST /api/Auth/login  
Autentica usuário e retorna token JWT.

### POST /api/Auth/esqueci-senha  
Inicia fluxo de recuperação de senha.  
- Gera token  
- Envia e-mail  

### POST /api/Auth/redefinir-senha  
Redefine senha com base no token.

---

# 📖 Disciplinas

Gestão de matérias da instituição.

### POST /api/Disciplinas  
Cria nova disciplina.

### GET /api/Disciplinas  
Lista todas as disciplinas.

### GET /api/Disciplinas/{id}  
Retorna detalhes de uma disciplina.

### PUT /api/Disciplinas/{id}  
Atualiza dados da disciplina.

### DELETE /api/Disciplinas/{id}  
Remove disciplina.

---

# 📌 Frequencias

Controle de presença dos alunos.

### POST /api/Frequencias/{turmaId}  
Registra frequência dos alunos da turma em uma aula.

### GET /api/Frequencias/{turmaId}  
Consulta frequência da turma.

---

# 📝 InteressesMatricula

Fluxo inicial de entrada de novos alunos.

### POST /api/InteressesMatricula  
Registra interesse de matrícula (pré-cadastro).

### GET /api/InteressesMatricula  
Lista todos os interesses.

### GET /api/InteressesMatricula/{id}  
Detalha um interesse específico.

### PATCH /api/InteressesMatricula/{id}/marcar-como-feito  
Marca o interesse como concluído.

---

# 📂 Materiais

Gerenciamento de materiais didáticos.

### POST /api/Materiais  
Cadastra material para uma turma.

### GET /api/Materiais/turma/{turmaId}  
Lista materiais da turma.

### GET /api/Materiais/{id}  
Detalha material específico.

### DELETE /api/Materiais/{id}  
Remove material.

---

# 📊 Notas

Gestão de avaliações e desempenho.

### POST /api/Notas  
Lança nota para um aluno.

### GET /api/Notas/minhas-turmas  
Consulta todas as notas das turmas do professor.

### GET /api/Notas/minhas-turmas/pdf  
Gera relatório consolidado em PDF.

### GET /api/Notas/turma/{turmaId}  
Lista notas da turma.

### PUT /api/Notas/{id}  
Atualiza nota existente.

---

# ⚠️ Ocorrencias

Registros disciplinares.

### POST /api/Ocorrencias  
Cria ocorrência para um aluno.

### GET /api/Ocorrencias/aluno/{alunoId}  
Lista ocorrências do aluno.

### GET /api/Ocorrencias/turma/{turmaId}  
Lista ocorrências da turma.

### GET /api/Ocorrencias/{id}  
Detalha ocorrência.

---

# 👨‍🏫 Professores

Gestão de professores e suas turmas.

### POST /api/Professores  
Cadastra professor e envia credenciais por e-mail.

### GET /api/Professores/minhas-turmas  
Lista turmas e disciplinas do professor autenticado.

---

# 📘 ProfessoresDisciplinas

Define a habilitação acadêmica do professor.

> Separa:  
> ✔ “pode lecionar”  
> ✔ de “está lecionando em uma turma”

### POST /api/professores/{professorId}/disciplinas  
Habilita professor para lecionar disciplina em um nível de ensino.

### GET /api/professores/{professorId}/disciplinas  
Lista disciplinas que o professor pode lecionar.

### DELETE /api/professores/{professorId}/disciplinas/{disciplinaId}/niveis/{nivelEnsinoId}  
Remove habilitação do professor.

---

# 📈 Relatorios

Indicadores e métricas acadêmicas.

### GET /api/Relatorios/aprovacoes-por-turma  
Taxa de aprovação por turma.

### GET /api/Relatorios/aprovacoes-por-turma/pdf  
Exporta relatório em PDF.

### GET /api/Relatorios/frequencia-media  
Frequência média geral.

### GET /api/Relatorios/frequencia-media/pdf  
Exporta relatório em PDF.

### GET /api/Relatorios/media-por-disciplina  
Média de desempenho por disciplina.

### GET /api/Relatorios/media-por-disciplina/pdf  
Exporta relatório em PDF.

### GET /api/Relatorios/situacao-alunos  
Situação geral dos alunos.

### GET /api/Relatorios/situacao-alunos/pdf  
Exporta relatório em PDF.

---

# 👨‍👩‍👧 Responsaveis

Acompanhamento acadêmico dos alunos.

### GET /api/Responsaveis/me/alunos  
Lista alunos vinculados ao responsável.

### GET /api/Responsaveis/me/alunos/{alunoId}/agenda  
Consulta agenda do aluno.

### GET /api/Responsaveis/me/alunos/{alunoId}/boletim  
Consulta boletim.

### GET /api/Responsaveis/me/alunos/{alunoId}/boletim/pdf  
Gera boletim em PDF.

### GET /api/Responsaveis/me/alunos/{alunoId}/frequencia  
Consulta frequência.

### GET /api/Responsaveis/me/alunos/{alunoId}/ocorrencias  
Consulta ocorrências.

### GET /api/Responsaveis/me/financeiro  
Consulta dados financeiros.

> Observação: Responsáveis não acessam materiais didáticos.

---

# 🏫 Turmas

Gestão de turmas escolares.

### POST /api/Turmas  
Cria nova turma.

### GET /api/Turmas  
Lista turmas.

### GET /api/Turmas/{id}  
Detalha turma.

### PUT /api/Turmas/{id}  
Atualiza turma.

### DELETE /api/Turmas/{id}  
Remove turma.

---

# 👥 TurmaAluno

Vínculo entre alunos e turmas.

### POST /api/turmas/{turmaId}/alunos  
Adiciona aluno à turma.

### GET /api/turmas/{turmaId}/alunos  
Lista alunos da turma.

### DELETE /api/turmas/{turmaId}/alunos/{alunoId}  
Remove aluno da turma.

---

# 👨‍🏫 TurmaProfessorDisciplina

Vínculo operacional entre professor, disciplina e turma.

> Representa:  
> “Professor X dará aula de Y na turma Z”

### POST /api/turmas/{turmaId}/professores  
Atribui professor à turma em uma disciplina.

### GET /api/turmas/{turmaId}/professores  
Lista professores da turma.

### DELETE /api/turmas/{turmaId}/professores/{professorId}  
Remove professor da turma.

---

# 📥 Uploads

Envio de arquivos.

### POST /api/Uploads/documentos  
Upload de documentos administrativos.

### POST /api/Uploads/fotos  
Upload de imagens (perfil, etc).

### POST /api/Uploads/materiais  
Upload de materiais didáticos.

---

# 🧠 Arquitetura Acadêmica

O modelo do sistema segue três níveis:

### 1. ProfessorDisciplina  
Define capacidade do professor  
→ “pode lecionar”

### 2. TurmaProfessorDisciplina  
Define alocação real  
→ “vai lecionar nessa turma”

### 3. TurmaAluno  
Define participação do aluno  
→ “estuda nessa turma”

---

# 🚀 Fluxo Principal do Sistema

1. Admin cadastra disciplinas  
2. Admin cadastra professor  
3. Admin habilita professor (ProfessorDisciplina)  
4. Admin cria turma  
5. Admin vincula professor à turma  
6. Responsável envia interesse de matrícula  
7. Admin cadastra aluno + responsável  
8. Admin vincula aluno à turma  
9. Professor opera (notas, frequência, materiais)  
10. Aluno e responsável consomem