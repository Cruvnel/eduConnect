# 🗄️ EduConnect Database Documentation

Banco de dados: SQL Server  
ORM: Entity Framework Core  
Abordagem: Code First + Migrations  

---

# 🧠 Visão Geral

O banco de dados do EduConnect foi modelado seguindo princípios de:

- Normalização (até 3FN)  
- Integridade referencial  
- Separação de responsabilidades  
- Escalabilidade acadêmica  

A estrutura é organizada em grupos lógicos:

1. Autenticação e Controle de Acesso  
2. Usuários (Perfis)  
3. Estrutura Acadêmica  
4. Operações Pedagógicas  
5. Comunicação  
6. Financeiro  
7. Matrícula  
8. Apoio/Auditoria  

---

# 🔐 1. Autenticação e Controle de Acesso

## 🧾 Usuario
Representa qualquer usuário do sistema.

Campos principais:
- UsuarioId (PK)
- Registro (login único)
- Email
- SenhaHash
- PerfilId (FK)
- Ativo
- DataCriacao
- UltimoAcesso

---

## 👤 Perfil
Define o tipo de usuário.

Valores:
- Administrador
- Professor
- Aluno
- Responsavel

Campos:
- PerfilId (PK)
- Nome

---

## 🔑 RecuperacaoSenhaToken
Gerencia tokens de redefinição de senha.

Campos:
- RecuperacaoSenhaTokenId (PK)
- UsuarioId (FK)
- Token
- ExpiraEm
- Usado
- DataCriacao

---

# 👥 2. Usuários

## 👨‍💼 Administrador
- AdministradorId (PK)
- UsuarioId (FK)
- NomeCompleto

## 👨‍🏫 Professor
- ProfessorId (PK)
- UsuarioId (FK)
- Registro
- NomeCompleto
- DataNascimento
- EmailInstitucional
- Status

## 👨‍🎓 Aluno
- AlunoId (PK)
- UsuarioId (FK)
- Registro
- NomeCompleto
- DataNascimento
- FotoUrl
- ValorMensalPadrao
- Ativo

## 👨‍👩‍👧 Responsavel
- ResponsavelId (PK)
- UsuarioId (FK)
- Registro
- NomeCompleto
- Telefone
- EmailContato

## 🔗 ResponsavelAluno
Relacionamento N:N.

- ResponsavelId (FK)
- AlunoId (FK)
- TipoResponsabilidade
- Principal

---

# 🏫 3. Estrutura Acadêmica

## 📖 Disciplina
- DisciplinaId (PK)
- Nome
- Descricao

## 🎓 NivelEnsino
- NivelEnsinoId (PK)
- Nome

## 🏫 Turma
- TurmaId (PK)
- Nome
- AnoLetivo
- Sala
- NivelEnsinoId (FK)
- ProfessorTutorNome

## 📘 ProfessorDisciplina
Habilitação do professor.

- ProfessorDisciplinaId (PK)
- ProfessorId (FK)
- DisciplinaId (FK)
- NivelEnsinoId (FK)
- CargaHorariaSemanal

## 🔗 TurmaProfessorDisciplina
Alocação do professor.

- TurmaProfessorDisciplinaId (PK)
- TurmaId (FK)
- ProfessorId (FK)
- DisciplinaId (FK)
- DataVinculo

## 👥 TurmaAluno
- TurmaAlunoId (PK)
- TurmaId (FK)
- AlunoId (FK)
- DataEntrada
- Ativo

---

# 📊 4. Operações Pedagógicas

## 📊 Nota
- NotaId (PK)
- AlunoId (FK)
- TurmaId (FK)
- DisciplinaId (FK)
- TipoAvaliacao
- Valor

## 📊 HistoricoNota
Histórico de alterações.

- HistoricoNotaId (PK)
- NotaId (FK)
- ValorAnterior
- ValorNovo
- DataAlteracao

## 📌 Frequencia
- FrequenciaId (PK)
- AlunoId (FK)
- TurmaId (FK)
- DisciplinaId (FK)
- DataAula
- Presente
- Observacao
- RegistradoPorProfessorId

## ⚠️ Ocorrencia
- OcorrenciaId (PK)
- AlunoId (FK)
- TurmaId (FK)
- ProfessorId (FK)
- Descricao
- DataOcorrencia

---

# 📅 5. Comunicação

## 📅 AgendaEvento
- AgendaEventoId (PK)
- TurmaId (FK)
- Titulo
- Descricao
- DataEvento
- CriadoPorProfessorId

## 📂 MaterialApoio
- MaterialApoioId (PK)
- TurmaId (FK)
- ProfessorId (FK)
- Titulo
- Descricao
- ArquivoUrl
- DataPublicacao

## 📢 Publicacao
- PublicacaoId (PK)
- Titulo
- Conteudo
- DataPublicacao

---

# 📝 6. Matrícula

## 📄 InteresseMatricula
- InteresseMatriculaId (PK)
- NomeAluno
- NomeResponsavel
- Telefone
- Email
- Status
- DataCriacao

---

# 💰 7. Financeiro

## 💰 Mensalidade
- MensalidadeId (PK)
- ResponsavelId (FK)
- AlunoId (FK)
- Competencia
- Valor
- StatusPagamento
- DataVencimento
- DataPagamento
- Observacao

---

# 🔔 8. Apoio

## 🔔 Notificacao
- NotificacaoId (PK)
- UsuarioId (FK)
- Mensagem
- Lida
- DataCriacao

---

# 🔐 Seed Inicial (Administrador)

Administrador padrão criado automaticamente.

Registro: admin  
Senha: Admin@123  

Processo:
- Cria perfil se não existir
- Cria usuário admin
- Cria entidade Administrador

---

# 🧠 Regras de Negócio

- Registro único  
- Email único  
- Um aluno possui uma turma ativa  
- Professor precisa estar habilitado antes da alocação  
- Tokens possuem expiração  

---

# 🚀 Considerações

Banco relacional completo, escalável e preparado para evolução futura.
