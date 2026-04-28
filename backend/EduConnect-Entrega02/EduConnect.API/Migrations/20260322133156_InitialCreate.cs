using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduConnect.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InteressesMatricula",
                columns: table => new
                {
                    InteresseMatriculaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomeResponsavel = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DataNascimentoResponsavel = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EmailContato = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DocumentoResponsavelUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    NomeAluno = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DataNascimentoAluno = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AnoEscolarAtual = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    DocumentoAlunoUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Observacoes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DataSolicitacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InteressesMatricula", x => x.InteresseMatriculaId);
                });

            migrationBuilder.CreateTable(
                name: "NiveisEnsino",
                columns: table => new
                {
                    NivelEnsinoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NiveisEnsino", x => x.NivelEnsinoId);
                });

            migrationBuilder.CreateTable(
                name: "Perfis",
                columns: table => new
                {
                    PerfilId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Perfis", x => x.PerfilId);
                });

            migrationBuilder.CreateTable(
                name: "Disciplinas",
                columns: table => new
                {
                    DisciplinaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Codigo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    NivelEnsinoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Disciplinas", x => x.DisciplinaId);
                    table.ForeignKey(
                        name: "FK_Disciplinas_NiveisEnsino_NivelEnsinoId",
                        column: x => x.NivelEnsinoId,
                        principalTable: "NiveisEnsino",
                        principalColumn: "NivelEnsinoId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Turmas",
                columns: table => new
                {
                    TurmaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NivelEnsinoId = table.Column<int>(type: "int", nullable: false),
                    AnoLetivo = table.Column<int>(type: "int", nullable: false),
                    Sala = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ProfessorTutorNome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataValidade = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativa = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turmas", x => x.TurmaId);
                    table.ForeignKey(
                        name: "FK_Turmas_NiveisEnsino_NivelEnsinoId",
                        column: x => x.NivelEnsinoId,
                        principalTable: "NiveisEnsino",
                        principalColumn: "NivelEnsinoId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    UsuarioId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerfilId = table.Column<int>(type: "int", nullable: false),
                    Registro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    SenhaHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UltimoAcesso = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.UsuarioId);
                    table.ForeignKey(
                        name: "FK_Usuarios_Perfis_PerfilId",
                        column: x => x.PerfilId,
                        principalTable: "Perfis",
                        principalColumn: "PerfilId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Administradores",
                columns: table => new
                {
                    AdministradorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    NomeCompleto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Registro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Administradores", x => x.AdministradorId);
                    table.ForeignKey(
                        name: "FK_Administradores_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Alunos",
                columns: table => new
                {
                    AlunoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    NomeCompleto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Registro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FotoUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    ValorMensalPadrao = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alunos", x => x.AlunoId);
                    table.ForeignKey(
                        name: "FK_Alunos_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notificacoes",
                columns: table => new
                {
                    NotificacaoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RemetenteUsuarioId = table.Column<int>(type: "int", nullable: false),
                    DestinatarioUsuarioId = table.Column<int>(type: "int", nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    Mensagem = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DataEnvio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Lida = table.Column<bool>(type: "bit", nullable: false),
                    DataLeitura = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EntidadeReferencia = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EntidadeReferenciaId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notificacoes", x => x.NotificacaoId);
                    table.ForeignKey(
                        name: "FK_Notificacoes_Usuarios_DestinatarioUsuarioId",
                        column: x => x.DestinatarioUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notificacoes_Usuarios_RemetenteUsuarioId",
                        column: x => x.RemetenteUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Professores",
                columns: table => new
                {
                    ProfessorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    NomeCompleto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Registro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    EmailInstitucional = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Professores", x => x.ProfessorId);
                    table.ForeignKey(
                        name: "FK_Professores_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Responsaveis",
                columns: table => new
                {
                    ResponsavelId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    NomeCompleto = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Registro = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Telefone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    EmailContato = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Responsaveis", x => x.ResponsavelId);
                    table.ForeignKey(
                        name: "FK_Responsaveis_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Publicacoes",
                columns: table => new
                {
                    PublicacaoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AdministradorId = table.Column<int>(type: "int", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Mensagem = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    DataPublicacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Ativa = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Publicacoes", x => x.PublicacaoId);
                    table.ForeignKey(
                        name: "FK_Publicacoes_Administradores_AdministradorId",
                        column: x => x.AdministradorId,
                        principalTable: "Administradores",
                        principalColumn: "AdministradorId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TurmasAluno",
                columns: table => new
                {
                    TurmaAlunoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    DataEntrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataSaida = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TurmasAluno", x => x.TurmaAlunoId);
                    table.ForeignKey(
                        name: "FK_TurmasAluno_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "AlunoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TurmasAluno_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "TurmaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventosAgenda",
                columns: table => new
                {
                    AgendaEventoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    CriadoPorProfessorId = table.Column<int>(type: "int", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DataEvento = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventosAgenda", x => x.AgendaEventoId);
                    table.ForeignKey(
                        name: "FK_EventosAgenda_Professores_CriadoPorProfessorId",
                        column: x => x.CriadoPorProfessorId,
                        principalTable: "Professores",
                        principalColumn: "ProfessorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventosAgenda_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "TurmaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Frequencias",
                columns: table => new
                {
                    FrequenciaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    DisciplinaId = table.Column<int>(type: "int", nullable: false),
                    RegistradoPorProfessorId = table.Column<int>(type: "int", nullable: false),
                    DataAula = table.Column<DateTime>(type: "date", nullable: false),
                    Presente = table.Column<bool>(type: "bit", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    DataRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Frequencias", x => x.FrequenciaId);
                    table.ForeignKey(
                        name: "FK_Frequencias_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "AlunoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Frequencias_Disciplinas_DisciplinaId",
                        column: x => x.DisciplinaId,
                        principalTable: "Disciplinas",
                        principalColumn: "DisciplinaId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Frequencias_Professores_RegistradoPorProfessorId",
                        column: x => x.RegistradoPorProfessorId,
                        principalTable: "Professores",
                        principalColumn: "ProfessorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Frequencias_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "TurmaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MateriaisApoio",
                columns: table => new
                {
                    MaterialApoioId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfessorId = table.Column<int>(type: "int", nullable: false),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ArquivoUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    DataPublicacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MateriaisApoio", x => x.MaterialApoioId);
                    table.ForeignKey(
                        name: "FK_MateriaisApoio_Professores_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "Professores",
                        principalColumn: "ProfessorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MateriaisApoio_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "TurmaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notas",
                columns: table => new
                {
                    NotaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    DisciplinaId = table.Column<int>(type: "int", nullable: false),
                    TipoAvaliacao = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    LancadoPorProfessorId = table.Column<int>(type: "int", nullable: false),
                    DataLancamento = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notas", x => x.NotaId);
                    table.CheckConstraint("CK_Nota_Valor", "[Valor] >= 0 AND [Valor] <= 10");
                    table.ForeignKey(
                        name: "FK_Notas_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "AlunoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notas_Disciplinas_DisciplinaId",
                        column: x => x.DisciplinaId,
                        principalTable: "Disciplinas",
                        principalColumn: "DisciplinaId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notas_Professores_LancadoPorProfessorId",
                        column: x => x.LancadoPorProfessorId,
                        principalTable: "Professores",
                        principalColumn: "ProfessorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notas_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "TurmaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Ocorrencias",
                columns: table => new
                {
                    OcorrenciaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfessorId = table.Column<int>(type: "int", nullable: false),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DataOcorrencia = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ocorrencias", x => x.OcorrenciaId);
                    table.ForeignKey(
                        name: "FK_Ocorrencias_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "AlunoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ocorrencias_Professores_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "Professores",
                        principalColumn: "ProfessorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Ocorrencias_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "TurmaId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProfessoresDisciplinas",
                columns: table => new
                {
                    ProfessorDisciplinaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProfessorId = table.Column<int>(type: "int", nullable: false),
                    DisciplinaId = table.Column<int>(type: "int", nullable: false),
                    NivelEnsinoId = table.Column<int>(type: "int", nullable: false),
                    CargaHorariaSemanal = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessoresDisciplinas", x => x.ProfessorDisciplinaId);
                    table.CheckConstraint("CK_ProfessorDisciplina_CargaHoraria", "[CargaHorariaSemanal] >= 0 AND [CargaHorariaSemanal] <= 40");
                    table.ForeignKey(
                        name: "FK_ProfessoresDisciplinas_Disciplinas_DisciplinaId",
                        column: x => x.DisciplinaId,
                        principalTable: "Disciplinas",
                        principalColumn: "DisciplinaId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfessoresDisciplinas_NiveisEnsino_NivelEnsinoId",
                        column: x => x.NivelEnsinoId,
                        principalTable: "NiveisEnsino",
                        principalColumn: "NivelEnsinoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ProfessoresDisciplinas_Professores_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "Professores",
                        principalColumn: "ProfessorId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TurmasProfessoresDisciplinas",
                columns: table => new
                {
                    TurmaProfessorDisciplinaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    ProfessorId = table.Column<int>(type: "int", nullable: false),
                    DisciplinaId = table.Column<int>(type: "int", nullable: false),
                    VinculadoPorUsuarioId = table.Column<int>(type: "int", nullable: false),
                    DataVinculo = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TurmasProfessoresDisciplinas", x => x.TurmaProfessorDisciplinaId);
                    table.ForeignKey(
                        name: "FK_TurmasProfessoresDisciplinas_Disciplinas_DisciplinaId",
                        column: x => x.DisciplinaId,
                        principalTable: "Disciplinas",
                        principalColumn: "DisciplinaId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TurmasProfessoresDisciplinas_Professores_ProfessorId",
                        column: x => x.ProfessorId,
                        principalTable: "Professores",
                        principalColumn: "ProfessorId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TurmasProfessoresDisciplinas_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "TurmaId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TurmasProfessoresDisciplinas_Usuarios_VinculadoPorUsuarioId",
                        column: x => x.VinculadoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Mensalidades",
                columns: table => new
                {
                    MensalidadeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResponsavelId = table.Column<int>(type: "int", nullable: false),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    Competencia = table.Column<string>(type: "nvarchar(7)", maxLength: 7, nullable: false),
                    Valor = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "date", nullable: false),
                    DataPagamento = table.Column<DateTime>(type: "date", nullable: true),
                    StatusPagamento = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mensalidades", x => x.MensalidadeId);
                    table.ForeignKey(
                        name: "FK_Mensalidades_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "AlunoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Mensalidades_Responsaveis_ResponsavelId",
                        column: x => x.ResponsavelId,
                        principalTable: "Responsaveis",
                        principalColumn: "ResponsavelId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ResponsaveisAlunos",
                columns: table => new
                {
                    ResponsavelAlunoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ResponsavelId = table.Column<int>(type: "int", nullable: false),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    TipoResponsabilidade = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Principal = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResponsaveisAlunos", x => x.ResponsavelAlunoId);
                    table.ForeignKey(
                        name: "FK_ResponsaveisAlunos_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "AlunoId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ResponsaveisAlunos_Responsaveis_ResponsavelId",
                        column: x => x.ResponsavelId,
                        principalTable: "Responsaveis",
                        principalColumn: "ResponsavelId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NotasHistorico",
                columns: table => new
                {
                    NotaHistoricoId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NotaId = table.Column<int>(type: "int", nullable: false),
                    ValorAnterior = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    ValorNovo = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    AlteradoPorUsuarioId = table.Column<int>(type: "int", nullable: false),
                    DataAlteracao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NotasHistorico", x => x.NotaHistoricoId);
                    table.ForeignKey(
                        name: "FK_NotasHistorico_Notas_NotaId",
                        column: x => x.NotaId,
                        principalTable: "Notas",
                        principalColumn: "NotaId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NotasHistorico_Usuarios_AlteradoPorUsuarioId",
                        column: x => x.AlteradoPorUsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "UsuarioId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Administradores_UsuarioId",
                table: "Administradores",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alunos_Registro",
                table: "Alunos",
                column: "Registro",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alunos_UsuarioId",
                table: "Alunos",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Disciplinas_Codigo",
                table: "Disciplinas",
                column: "Codigo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Disciplinas_NivelEnsinoId",
                table: "Disciplinas",
                column: "NivelEnsinoId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosAgenda_CriadoPorProfessorId",
                table: "EventosAgenda",
                column: "CriadoPorProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosAgenda_TurmaId",
                table: "EventosAgenda",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_Frequencias_AlunoId",
                table: "Frequencias",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_Frequencias_DisciplinaId",
                table: "Frequencias",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_Frequencias_RegistradoPorProfessorId",
                table: "Frequencias",
                column: "RegistradoPorProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_Frequencias_TurmaId_AlunoId_DisciplinaId_DataAula",
                table: "Frequencias",
                columns: new[] { "TurmaId", "AlunoId", "DisciplinaId", "DataAula" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MateriaisApoio_ProfessorId",
                table: "MateriaisApoio",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_MateriaisApoio_TurmaId",
                table: "MateriaisApoio",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_Mensalidades_AlunoId_Competencia",
                table: "Mensalidades",
                columns: new[] { "AlunoId", "Competencia" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Mensalidades_ResponsavelId",
                table: "Mensalidades",
                column: "ResponsavelId");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_AlunoId_TurmaId_DisciplinaId_TipoAvaliacao",
                table: "Notas",
                columns: new[] { "AlunoId", "TurmaId", "DisciplinaId", "TipoAvaliacao" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notas_DisciplinaId",
                table: "Notas",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_LancadoPorProfessorId",
                table: "Notas",
                column: "LancadoPorProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_Notas_TurmaId",
                table: "Notas",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_NotasHistorico_AlteradoPorUsuarioId",
                table: "NotasHistorico",
                column: "AlteradoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_NotasHistorico_NotaId",
                table: "NotasHistorico",
                column: "NotaId");

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_DestinatarioUsuarioId_Lida_DataEnvio",
                table: "Notificacoes",
                columns: new[] { "DestinatarioUsuarioId", "Lida", "DataEnvio" });

            migrationBuilder.CreateIndex(
                name: "IX_Notificacoes_RemetenteUsuarioId",
                table: "Notificacoes",
                column: "RemetenteUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Ocorrencias_AlunoId",
                table: "Ocorrencias",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_Ocorrencias_ProfessorId",
                table: "Ocorrencias",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_Ocorrencias_TurmaId",
                table: "Ocorrencias",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_Perfis_Nome",
                table: "Perfis",
                column: "Nome",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Professores_EmailInstitucional",
                table: "Professores",
                column: "EmailInstitucional",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Professores_Registro",
                table: "Professores",
                column: "Registro",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Professores_UsuarioId",
                table: "Professores",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfessoresDisciplinas_DisciplinaId",
                table: "ProfessoresDisciplinas",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessoresDisciplinas_NivelEnsinoId",
                table: "ProfessoresDisciplinas",
                column: "NivelEnsinoId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessoresDisciplinas_ProfessorId_DisciplinaId_NivelEnsinoId",
                table: "ProfessoresDisciplinas",
                columns: new[] { "ProfessorId", "DisciplinaId", "NivelEnsinoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Publicacoes_AdministradorId",
                table: "Publicacoes",
                column: "AdministradorId");

            migrationBuilder.CreateIndex(
                name: "IX_Responsaveis_Registro",
                table: "Responsaveis",
                column: "Registro",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Responsaveis_UsuarioId",
                table: "Responsaveis",
                column: "UsuarioId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ResponsaveisAlunos_AlunoId",
                table: "ResponsaveisAlunos",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_ResponsaveisAlunos_ResponsavelId_AlunoId",
                table: "ResponsaveisAlunos",
                columns: new[] { "ResponsavelId", "AlunoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Turmas_NivelEnsinoId",
                table: "Turmas",
                column: "NivelEnsinoId");

            migrationBuilder.CreateIndex(
                name: "IX_Turmas_Nome_AnoLetivo",
                table: "Turmas",
                columns: new[] { "Nome", "AnoLetivo" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TurmasAluno_AlunoId",
                table: "TurmasAluno",
                column: "AlunoId");

            migrationBuilder.CreateIndex(
                name: "IX_TurmasAluno_TurmaId_AlunoId_Ativo",
                table: "TurmasAluno",
                columns: new[] { "TurmaId", "AlunoId", "Ativo" });

            migrationBuilder.CreateIndex(
                name: "IX_TurmasProfessoresDisciplinas_DisciplinaId",
                table: "TurmasProfessoresDisciplinas",
                column: "DisciplinaId");

            migrationBuilder.CreateIndex(
                name: "IX_TurmasProfessoresDisciplinas_ProfessorId",
                table: "TurmasProfessoresDisciplinas",
                column: "ProfessorId");

            migrationBuilder.CreateIndex(
                name: "IX_TurmasProfessoresDisciplinas_TurmaId_ProfessorId",
                table: "TurmasProfessoresDisciplinas",
                columns: new[] { "TurmaId", "ProfessorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TurmasProfessoresDisciplinas_VinculadoPorUsuarioId",
                table: "TurmasProfessoresDisciplinas",
                column: "VinculadoPorUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_PerfilId",
                table: "Usuarios",
                column: "PerfilId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Registro",
                table: "Usuarios",
                column: "Registro",
                unique: true);

            migrationBuilder.Sql(@"
            CREATE OR ALTER PROCEDURE sp_SeedAdministradorPadrao
            @NomeCompleto NVARCHAR(150),
            @Email NVARCHAR(150),
            @Registro NVARCHAR(30),
            @SenhaHash NVARCHAR(255)
        AS
        BEGIN
            SET NOCOUNT ON;

            DECLARE @PerfilId INT;
            DECLARE @UsuarioId INT;

            SELECT @PerfilId = PerfilId
            FROM Perfis
            WHERE Nome = 'Administrador';

            IF @PerfilId IS NULL
            BEGIN
                INSERT INTO Perfis (Nome)
                VALUES ('Administrador');

                SET @PerfilId = SCOPE_IDENTITY();
            END

            IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE Email = @Email)
            BEGIN
                INSERT INTO Usuarios
                (
                    PerfilId,
                    Registro,
                    Email,
                    SenhaHash,
                    Ativo,
                    DataCriacao,
                    UltimoAcesso
                )
                VALUES
                (
                    @PerfilId,
                    @Registro,
                    @Email,
                    @SenhaHash,
                    1,
                    GETDATE(),
                    NULL
                );

                SET @UsuarioId = SCOPE_IDENTITY();

                INSERT INTO Administradores
                (
                    UsuarioId,
                    NomeCompleto,
                    Registro
                )
                VALUES
                (
                    @UsuarioId,
                    @NomeCompleto,
                    @Registro
                );
            END
        END
            ");

            migrationBuilder.Sql(@"
            EXEC sp_SeedAdministradorPadrao
                @NomeCompleto = 'Administrador Padrão',
                @Email = 'admin@educonnect.local',
                @Registro = 'ADM0001',
                @SenhaHash = '$2a$11$px34rYETq8ZwrwTPR2WpCe/bfKIsSoywdG2gwHGrSe3MFcXu3i1f6';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventosAgenda");

            migrationBuilder.DropTable(
                name: "Frequencias");

            migrationBuilder.DropTable(
                name: "InteressesMatricula");

            migrationBuilder.DropTable(
                name: "MateriaisApoio");

            migrationBuilder.DropTable(
                name: "Mensalidades");

            migrationBuilder.DropTable(
                name: "NotasHistorico");

            migrationBuilder.DropTable(
                name: "Notificacoes");

            migrationBuilder.DropTable(
                name: "Ocorrencias");

            migrationBuilder.DropTable(
                name: "ProfessoresDisciplinas");

            migrationBuilder.DropTable(
                name: "Publicacoes");

            migrationBuilder.DropTable(
                name: "ResponsaveisAlunos");

            migrationBuilder.DropTable(
                name: "TurmasAluno");

            migrationBuilder.DropTable(
                name: "TurmasProfessoresDisciplinas");

            migrationBuilder.DropTable(
                name: "Notas");

            migrationBuilder.DropTable(
                name: "Administradores");

            migrationBuilder.DropTable(
                name: "Responsaveis");

            migrationBuilder.DropTable(
                name: "Alunos");

            migrationBuilder.DropTable(
                name: "Disciplinas");

            migrationBuilder.DropTable(
                name: "Professores");

            migrationBuilder.DropTable(
                name: "Turmas");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "NiveisEnsino");

            migrationBuilder.DropTable(
                name: "Perfis");

            migrationBuilder.Sql(@"
            IF OBJECT_ID('sp_SeedAdministradorPadrao', 'P') IS NOT NULL
                DROP PROCEDURE sp_SeedAdministradorPadrao
            ");
        }
    }
}