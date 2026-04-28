# 📘 EduConnect - Regras de Negócio

---

## 🧠 Visão Geral

Este documento descreve as principais regras de negócio do sistema **EduConnect**, uma plataforma de gestão escolar que integra administração, professores, alunos e responsáveis.

As regras foram definidas com base na arquitetura implementada no backend (.NET + EF Core) e no modelo relacional do banco de dados.

---

# 🔐 1. Autenticação e Acesso

- Cada usuário possui um **registro único**.
- Cada usuário possui um **perfil**:
  - Administrador
  - Professor
  - Aluno
  - Responsável
- A autenticação é realizada via **JWT**.
- Senhas são armazenadas com **hash BCrypt**.
- O sistema permite:
  - Login
  - Recuperação de senha via token
  - Redefinição de senha

  - O fluxo Esqueci Minha Senha é diferente para cada usuário:
    
    - Administrador

    - Professor 
      - Através do seu email, ele consegue enviar um token de recuperação 

    - Responsável
      - Através do registro 

    - Aluno 
      - Através do registro, email vai para o responsável cadastrado

---

# 👥 2. Gestão de Usuários

## Administrador
- Pode gerenciar todo o sistema.
- Responsável por:
  - Cadastro de professores
  - Cadastro de turmas
  - Cadastro de disciplinas
  - Cadastro de alunos e responsáveis

---

## Professor
- Recebe credenciais automaticamente por e-mail.
- Pode:
  - Visualizar suas turmas
  - Lançar notas
  - Registrar frequência
  - Criar ocorrências
  - Publicar materiais
  - Criar eventos na agenda

---

## Aluno
- Possui acesso apenas às suas informações.
- Pode visualizar:
  - Notas
  - Frequência
  - Ocorrências
  - Materiais
  - Agenda

---

## Responsável
- Pode ter múltiplos alunos vinculados.
- Pode visualizar:
  - Boletim
  - Frequência
  - Ocorrências
  - Agenda
  - Financeiro

---

# 🏫 3. Estrutura Acadêmica

## Disciplinas
- Devem estar associadas a um **nível de ensino**.
- São base para notas e vínculos com professores.

---

## ProfessorDisciplina (Habilitação)
- Define quais disciplinas um professor pode lecionar.
- Um professor só pode ser vinculado a uma turma se estiver habilitado.

---

## Turma
- Representa uma classe acadêmica.
- Deve conter:
  - Nome
  - Ano letivo
  - Nível de ensino

---

## TurmaProfessorDisciplina (Alocação)
- Define:
  - Qual professor leciona
  - Qual disciplina
  - Em qual turma

---

## TurmaAluno
- Define o vínculo entre aluno e turma.
- Regra:
  - Um aluno só pode ter **uma turma ativa por vez**

---

# 📊 4. Operações Pedagógicas

## Notas
- Associadas a:
  - Aluno
  - Turma
  - Disciplina
- Tipos:
  - P1, P2, T1, T2, REC
- Média calculada:
  - Média simples das avaliações
  - Recuperação substitui média se >= 6

---

## Frequência
- Registrada por aula.
- Contém:
  - Presença
  - Data
  - Disciplina
  - Professor

O registro de frequência no EduConnect utiliza um modelo de sobrescrita, no qual o envio da chamada representa sempre o estado mais recente da presença dos alunos em uma determinada turma e data. Caso já exista uma chamada registrada, ao selecionar a mesma turma e data, o professor pode revisar as informações carregadas e salvá-las novamente, substituindo integralmente os dados anteriores. Esse modelo elimina a necessidade de um endpoint específico de edição, simplificando o fluxo e tornando o processo mais intuitivo.
---

## Ocorrências
- Registro disciplinar do aluno.
- Criadas por professores.

---

# 📅 5. Comunicação

## Agenda
- Eventos criados por professores para turmas.

## Materiais
- Conteúdos disponibilizados pelos professores.
- Visíveis apenas para alunos.

## Publicações
- Comunicados gerais (administrador).

---

# 💰 6. Financeiro

## Mensalidade
- Associada a:
  - Responsável
  - Aluno
- Contém:
  - Valor
  - Status
  - Datas

---

# 📝 7. Matrícula

## Interesse de Matrícula
- Pré-cadastro realizado por responsáveis.
- Pode ser:
  - Pendente
  - Concluído

---

# 🔐 8. Segurança

- Tokens de recuperação possuem expiração.
- Usuários podem ser desativados.
- Dados sensíveis são protegidos.

---

# 🔔 9. Notificações

- Sistema suporta notificações internas.
- Exemplo:
  - Professor é notificado ao ser vinculado a uma turma.

---

# 📌 Regras Gerais

- Registro é único no sistema.
- Email deve ser único.
- Um responsável pode ter vários alunos.
- Um aluno pode ter vários responsáveis.
- Professor deve estar habilitado antes da alocação.
- Um aluno só pode ter uma turma ativa.
- Dados devem respeitar integridade referencial.

---

# 🚀 Considerações Finais

O conjunto de regras garante:

- Consistência de dados
- Escalabilidade
- Separação de responsabilidades
- Base sólida para evolução futura

---

Adicionar alteração na regra de negocio 
APROVAÇÃO / REPROVAÇÃO

O aluno será aprovado na disciplina quando sua média das avaliações regulares, composta por P1, P2, T1 e T2, for maior ou igual a 6. Caso a média seja menor que 6 e ainda não exista nota de recuperação lançada, a disciplina ficará em situação de recuperação. Caso a média permaneça menor que 6 após o lançamento da recuperação, a disciplina será considerada reprovada. Para a situação geral do aluno, até 3 disciplinas em recuperação permitem que ele permaneça em recuperação; mais de 3 disciplinas em recuperação resultam em reprovação direta. Se houver qualquer disciplina já reprovada após recuperação, o aluno será considerado reprovado.