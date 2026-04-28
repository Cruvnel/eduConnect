# EduConnect

O **EduConnect** é um sistema web de gestão escolar desenvolvido para simplificar a administração acadêmica, pedagógica e comunicacional de instituições de ensino.

A plataforma centraliza informações de alunos, professores, turmas, disciplinas, notas, frequência, boletins, ocorrências, comunicados, materiais e relatórios, oferecendo interfaces específicas para cada perfil de usuário.

---

## Tecnologias Utilizadas

### Frontend

- React
- JavaScript
- React Router DOM
- CSS modularizado por contexto
- Recharts

### Backend

- .NET 8
- C#
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- Swagger

### Segurança

- JWT para autenticação
- BCrypt para hash de senhas
- RBAC para controle de acesso por perfil
- Tokens para recuperação de senha

### Recursos adicionais

- QuestPDF para geração de PDFs
- Upload de arquivos
- Envio de e-mails
- Notificações internas

---

## Perfis de Acesso

O sistema possui quatro perfis principais:

### Administrador

Responsável pela gestão geral da instituição.

Funcionalidades:

- Cadastro de alunos, responsáveis, professores, turmas e disciplinas
- Vínculo de professores a turmas e disciplinas
- Gestão de interesses de matrícula
- Publicação de comunicados
- Visualização de relatórios institucionais
- Ajustes de usuários

### Professor

Responsável pelas operações pedagógicas.

Funcionalidades:

- Visualizar turmas vinculadas
- Lançar e editar notas
- Registrar frequência
- Criar ocorrências
- Publicar materiais
- Criar eventos na agenda
- Gerar relatórios pedagógicos

### Aluno

Acesso individual às próprias informações acadêmicas.

Funcionalidades:

- Visualizar boletim
- Consultar desempenho
- Consultar frequência
- Consultar ocorrências
- Acessar materiais
- Visualizar agenda

### Responsável

Acompanhamento dos alunos vinculados.

Funcionalidades:

- Selecionar aluno em foco
- Visualizar boletim
- Consultar desempenho
- Consultar frequência
- Consultar ocorrências
- Visualizar agenda
- Consultar financeiro

---

## Arquitetura do Projeto

O projeto é dividido em duas aplicações principais:

```txt
EduConnect/
├── backend/
│   └── EduConnect.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Entities/
│       ├── Helpers/
│       ├── Migrations/
│       ├── Services/
│       ├── Program.cs
│       └── appsettings.json
│
├── frontend/
│   └── educonnect-react/
│       ├── public/
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── contexts/
│       │   ├── pages/
│       │   ├── routes/
│       │   ├── services/
│       │   └── styles/
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

---

## Regras de Negócio Principais

- Cada usuário possui um registro único.
- Cada usuário pertence a um perfil.
- Um aluno pode ter vários responsáveis.
- Um responsável pode ter vários alunos.
- Um aluno só pode ter uma turma ativa por vez.
- Um professor precisa estar habilitado em uma disciplina antes de ser alocado em uma turma.
- Notas são divididas em P1, P2, T1, T2 e REC.
- A média regular é calculada com base em P1, P2, T1 e T2.
- O aluno é aprovado na disciplina se a média for maior ou igual a 6.
- Caso a média seja menor que 6, o aluno fica em recuperação.
- Se a recuperação for menor que 6, o aluno é reprovado.
- Mais de 3 disciplinas em recuperação resultam em reprovação geral.
- Qualquer disciplina reprovada após recuperação reprova o aluno.
- Frequências são registradas por turma, disciplina, aluno e data.
- Boletins podem ser emitidos em PDF.
- Relatórios administrativos podem ser exportados em PDF.

---

## API

Base URL local:

```txt
http://localhost:5267
```

Swagger:

```txt
http://localhost:5267/swagger
```

---

## Como Executar o Projeto

### Backend

```bash
cd backend/EduConnect.Api
dotnet restore
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd frontend/educonnect-react
npm install
npm run dev
```

---

