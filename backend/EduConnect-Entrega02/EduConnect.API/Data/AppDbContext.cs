using EduConnect.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Perfil> Perfis => Set<Perfil>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Administrador> Administradores => Set<Administrador>();
    public DbSet<Professor> Professores => Set<Professor>();
    public DbSet<Aluno> Alunos => Set<Aluno>();
    public DbSet<Responsavel> Responsaveis => Set<Responsavel>();
    public DbSet<ResponsavelAluno> ResponsaveisAlunos => Set<ResponsavelAluno>();
    public DbSet<NivelEnsino> NiveisEnsino => Set<NivelEnsino>();
    public DbSet<Disciplina> Disciplinas => Set<Disciplina>();
    public DbSet<ProfessorDisciplina> ProfessoresDisciplinas => Set<ProfessorDisciplina>();
    public DbSet<Turma> Turmas => Set<Turma>();
    public DbSet<TurmaAluno> TurmasAluno => Set<TurmaAluno>();
    public DbSet<TurmaProfessorDisciplina> TurmasProfessoresDisciplinas => Set<TurmaProfessorDisciplina>();
    public DbSet<Nota> Notas => Set<Nota>();
    public DbSet<NotaHistorico> NotasHistorico => Set<NotaHistorico>();
    public DbSet<Frequencia> Frequencias => Set<Frequencia>();
    public DbSet<Ocorrencia> Ocorrencias => Set<Ocorrencia>();
    public DbSet<InteresseMatricula> InteressesMatricula => Set<InteresseMatricula>();
    public DbSet<Publicacao> Publicacoes => Set<Publicacao>();
    public DbSet<MaterialApoio> MateriaisApoio => Set<MaterialApoio>();
    public DbSet<AgendaEvento> EventosAgenda => Set<AgendaEvento>();
    public DbSet<Mensalidade> Mensalidades => Set<Mensalidade>();
    public DbSet<Notificacao> Notificacoes => Set<Notificacao>();

    public DbSet<RecuperacaoSenhaToken> RecuperacoesSenhaToken => Set<RecuperacaoSenhaToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================
        // PERFIL
        // =========================
        modelBuilder.Entity<Perfil>(entity =>
        {
            entity.Property(x => x.Nome)
                .HasMaxLength(30)
                .IsRequired();

            entity.HasIndex(x => x.Nome).IsUnique();
        });

        // =========================
        // USUARIO
        // =========================
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.Property(x => x.Registro)
            .HasMaxLength(30)
            .IsRequired();

            entity.HasIndex(x => x.Registro).IsUnique();

            entity.Property(x => x.Email)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.SenhaHash)
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(x => x.Email).IsUnique();

            entity.HasOne(x => x.Perfil)
                .WithMany(x => x.Usuarios)
                .HasForeignKey(x => x.PerfilId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // ADMINISTRADOR
        // =========================
        modelBuilder.Entity<Administrador>(entity =>
        {
            entity.Property(x => x.NomeCompleto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Registro)
                .HasMaxLength(30)
                .IsRequired();

            entity.HasIndex(x => x.UsuarioId).IsUnique();

            entity.HasOne(x => x.Usuario)
                .WithOne(x => x.Administrador)
                .HasForeignKey<Administrador>(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // PROFESSOR
        // =========================
        modelBuilder.Entity<Professor>(entity =>
        {
            entity.Property(x => x.NomeCompleto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Registro)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.EmailInstitucional)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Status)
                .HasMaxLength(20)
                .IsRequired();

            entity.HasIndex(x => x.UsuarioId).IsUnique();
            entity.HasIndex(x => x.Registro).IsUnique();
            entity.HasIndex(x => x.EmailInstitucional).IsUnique();

            entity.HasOne(x => x.Usuario)
                .WithOne(x => x.Professor)
                .HasForeignKey<Professor>(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // ALUNO
        // =========================
        modelBuilder.Entity<Aluno>(entity =>
        {
            entity.Property(x => x.NomeCompleto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Registro)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.FotoUrl)
                .HasMaxLength(300);

            entity.Property(x => x.ValorMensalPadrao)
                .HasColumnType("decimal(10,2)");

            entity.HasIndex(x => x.UsuarioId).IsUnique();
            entity.HasIndex(x => x.Registro).IsUnique();

            entity.HasOne(x => x.Usuario)
                .WithOne(x => x.Aluno)
                .HasForeignKey<Aluno>(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // RESPONSAVEL
        // =========================
        modelBuilder.Entity<Responsavel>(entity =>
        {
            entity.Property(x => x.Registro)
            .HasMaxLength(30)
            .IsRequired();

            entity.HasIndex(x => x.Registro).IsUnique();

            entity.Property(x => x.NomeCompleto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Telefone)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.EmailContato)
                .HasMaxLength(150)
                .IsRequired();

            entity.HasIndex(x => x.UsuarioId).IsUnique();

            entity.HasOne(x => x.Usuario)
                .WithOne(x => x.Responsavel)
                .HasForeignKey<Responsavel>(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // NIVEL ENSINO
        // =========================
        modelBuilder.Entity<NivelEnsino>(entity =>
        {
            entity.Property(x => x.Nome)
                .HasMaxLength(50)
                .IsRequired();
        });

        // =========================
        // RESPONSAVEL ALUNO
        // =========================
        modelBuilder.Entity<ResponsavelAluno>(entity =>
        {
            entity.Property(x => x.TipoResponsabilidade)
                .HasMaxLength(30);

            entity.HasIndex(x => new { x.ResponsavelId, x.AlunoId })
                .IsUnique();

            entity.HasOne(x => x.Responsavel)
                .WithMany(x => x.ResponsaveisAlunos)
                .HasForeignKey(x => x.ResponsavelId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Aluno)
                .WithMany(x => x.ResponsaveisAlunos)
                .HasForeignKey(x => x.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // DISCIPLINA
        // =========================
        modelBuilder.Entity<Disciplina>(entity =>
        {
            entity.Property(x => x.Nome)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Codigo)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.Descricao)
                .HasMaxLength(500);

            entity.HasIndex(x => x.Codigo).IsUnique();

            entity.HasOne(x => x.NivelEnsino)
                .WithMany(x => x.Disciplinas)
                .HasForeignKey(x => x.NivelEnsinoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // PROFESSOR DISCIPLINA
        // =========================
        modelBuilder.Entity<ProfessorDisciplina>(entity =>
        {
            entity.HasIndex(x => new { x.ProfessorId, x.DisciplinaId, x.NivelEnsinoId })
                .IsUnique();

            entity.Property(x => x.CargaHorariaSemanal)
                .HasDefaultValue(0);

            entity.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_ProfessorDisciplina_CargaHoraria",
                    "[CargaHorariaSemanal] >= 0 AND [CargaHorariaSemanal] <= 40");
            });

            entity.HasOne(x => x.Professor)
                .WithMany(x => x.ProfessorDisciplinas)
                .HasForeignKey(x => x.ProfessorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Disciplina)
                .WithMany(x => x.ProfessorDisciplinas)
                .HasForeignKey(x => x.DisciplinaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.NivelEnsino)
                .WithMany()
                .HasForeignKey(x => x.NivelEnsinoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // TURMA
        // =========================
        modelBuilder.Entity<Turma>(entity =>
        {
            entity.Property(x => x.Nome)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(x => x.Sala)
                .HasMaxLength(30);

            entity.Property(x => x.ProfessorTutorNome)
                .HasMaxLength(150);

            entity.Property(x => x.Descricao)
                .HasMaxLength(500);

            entity.Property(x => x.DataCriacao)
                .HasColumnType("datetime2");

            entity.Property(x => x.DataValidade)
                .HasColumnType("datetime2");

            entity.HasIndex(x => new { x.Nome, x.AnoLetivo }).IsUnique();

            entity.HasOne(x => x.NivelEnsino)
                .WithMany(x => x.Turmas)
                .HasForeignKey(x => x.NivelEnsinoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // TURMA ALUNO
        // =========================
        modelBuilder.Entity<TurmaAluno>(entity =>
        {
            entity.Property(x => x.DataEntrada)
                .HasColumnType("datetime2");

            entity.Property(x => x.DataSaida)
                .HasColumnType("datetime2");

            entity.HasIndex(x => new { x.TurmaId, x.AlunoId, x.Ativo });

            entity.HasOne(x => x.Turma)
                .WithMany(x => x.TurmasAluno)
                .HasForeignKey(x => x.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Aluno)
                .WithMany(x => x.TurmasAluno)
                .HasForeignKey(x => x.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // TURMA PROFESSOR DISCIPLINA
        // =========================
        modelBuilder.Entity<TurmaProfessorDisciplina>(entity =>
        {
            entity.Property(x => x.DataVinculo)
                .HasColumnType("datetime2");

            entity.HasIndex(x => new { x.TurmaId, x.ProfessorId })
                .IsUnique();

            entity.HasOne(x => x.Turma)
                .WithMany(x => x.TurmaProfessorDisciplinas)
                .HasForeignKey(x => x.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Professor)
                .WithMany(x => x.TurmaProfessorDisciplinas)
                .HasForeignKey(x => x.ProfessorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Disciplina)
                .WithMany(x => x.TurmaProfessorDisciplinas)
                .HasForeignKey(x => x.DisciplinaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.VinculadoPorUsuario)
                .WithMany()
                .HasForeignKey(x => x.VinculadoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // NOTA
        // =========================
        modelBuilder.Entity<Nota>(entity =>
        {
            entity.Property(x => x.TipoAvaliacao)
                .HasMaxLength(10)
                .IsRequired();

            entity.Property(x => x.Valor)
                .HasColumnType("decimal(5,2)");

            entity.Property(x => x.DataLancamento)
                .HasColumnType("datetime2");

            entity.HasIndex(x => new { x.AlunoId, x.TurmaId, x.DisciplinaId, x.TipoAvaliacao })
                .IsUnique();

            entity.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Nota_Valor", "[Valor] >= 0 AND [Valor] <= 10");
            });

            entity.HasOne(x => x.Aluno)
                .WithMany(x => x.Notas)
                .HasForeignKey(x => x.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Turma)
                .WithMany()
                .HasForeignKey(x => x.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Disciplina)
                .WithMany()
                .HasForeignKey(x => x.DisciplinaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.LancadoPorProfessor)
                .WithMany()
                .HasForeignKey(x => x.LancadoPorProfessorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // NOTA HISTORICO
        // =========================
        modelBuilder.Entity<NotaHistorico>(entity =>
        {
            entity.Property(x => x.ValorAnterior)
                .HasColumnType("decimal(5,2)");

            entity.Property(x => x.ValorNovo)
                .HasColumnType("decimal(5,2)");

            entity.Property(x => x.DataAlteracao)
                .HasColumnType("datetime2");

            entity.Property(x => x.Motivo)
                .HasMaxLength(300);

            entity.HasOne(x => x.Nota)
                .WithMany(x => x.Historico)
                .HasForeignKey(x => x.NotaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.AlteradoPorUsuario)
                .WithMany()
                .HasForeignKey(x => x.AlteradoPorUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // FREQUENCIA
        // =========================
        modelBuilder.Entity<Frequencia>(entity =>
        {
            entity.Property(x => x.Observacao)
                .HasMaxLength(300);

            entity.Property(x => x.DataAula)
                .HasColumnType("date");

            entity.Property(x => x.DataRegistro)
                .HasColumnType("datetime2");

            entity.HasIndex(x => new { x.TurmaId, x.AlunoId, x.DisciplinaId, x.DataAula })
                .IsUnique();

            entity.HasOne(x => x.Turma)
                .WithMany()
                .HasForeignKey(x => x.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Aluno)
                .WithMany(x => x.Frequencias)
                .HasForeignKey(x => x.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Disciplina)
                .WithMany()
                .HasForeignKey(x => x.DisciplinaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.RegistradoPorProfessor)
                .WithMany()
                .HasForeignKey(x => x.RegistradoPorProfessorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // OCORRENCIA
        // =========================
        modelBuilder.Entity<Ocorrencia>(entity =>
        {
            entity.Property(x => x.Descricao)
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(x => x.DataOcorrencia)
                .HasColumnType("datetime2");

            entity.HasOne(x => x.Professor)
                .WithMany()
                .HasForeignKey(x => x.ProfessorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Turma)
                .WithMany()
                .HasForeignKey(x => x.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Aluno)
                .WithMany(x => x.Ocorrencias)
                .HasForeignKey(x => x.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // INTERESSE MATRICULA
        // =========================
        modelBuilder.Entity<InteresseMatricula>(entity =>
        {
            entity.Property(x => x.NomeResponsavel)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.EmailContato)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Telefone)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.DocumentoResponsavelUrl)
                .HasMaxLength(300);

            entity.Property(x => x.NomeAluno)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.AnoEscolarAtual)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.DocumentoAlunoUrl)
                .HasMaxLength(300);

            entity.Property(x => x.Observacoes)
                .HasMaxLength(1000);

            entity.Property(x => x.Status)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.DataSolicitacao)
                .HasColumnType("datetime2");
        });

        // =========================
        // PUBLICACAO
        // =========================
        modelBuilder.Entity<Publicacao>(entity =>
        {
            entity.Property(x => x.Titulo)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Mensagem)
                .HasMaxLength(2000)
                .IsRequired();

            entity.Property(x => x.DataPublicacao)
                .HasColumnType("datetime2");

            entity.HasOne(x => x.Administrador)
                .WithMany()
                .HasForeignKey(x => x.AdministradorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // MATERIAL APOIO
        // =========================
        modelBuilder.Entity<MaterialApoio>(entity =>
        {
            entity.Property(x => x.Titulo)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Descricao)
                .HasMaxLength(1000);

            entity.Property(x => x.ArquivoUrl)
                .HasMaxLength(300)
                .IsRequired();

            entity.Property(x => x.DataPublicacao)
                .HasColumnType("datetime2");

            entity.HasOne(x => x.Professor)
                .WithMany()
                .HasForeignKey(x => x.ProfessorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Turma)
                .WithMany(x => x.MateriaisApoio)
                .HasForeignKey(x => x.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // AGENDA EVENTO
        // =========================
        modelBuilder.Entity<AgendaEvento>(entity =>
        {
            entity.Property(x => x.Titulo)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.Descricao)
                .HasMaxLength(1000);

            entity.Property(x => x.DataEvento)
                .HasColumnType("datetime2");

            entity.HasOne(x => x.Turma)
                .WithMany(x => x.EventosAgenda)
                .HasForeignKey(x => x.TurmaId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.CriadoPorProfessor)
                .WithMany()
                .HasForeignKey(x => x.CriadoPorProfessorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // MENSALIDADE
        // =========================
        modelBuilder.Entity<Mensalidade>(entity =>
        {
            entity.Property(x => x.Competencia)
                .HasMaxLength(7)
                .IsRequired();

            entity.Property(x => x.StatusPagamento)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.Observacao)
                .HasMaxLength(300);

            entity.Property(x => x.Valor)
                .HasColumnType("decimal(10,2)");

            entity.Property(x => x.DataVencimento)
                .HasColumnType("date");

            entity.Property(x => x.DataPagamento)
                .HasColumnType("date");

            entity.HasIndex(x => new { x.AlunoId, x.Competencia })
                .IsUnique();

            entity.HasOne(x => x.Responsavel)
                .WithMany(x => x.Mensalidades)
                .HasForeignKey(x => x.ResponsavelId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.Aluno)
                .WithMany()
                .HasForeignKey(x => x.AlunoId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================
        // NOTIFICACAO
        // =========================
        modelBuilder.Entity<Notificacao>(entity =>
        {
            entity.Property(x => x.Tipo)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(x => x.Titulo)
                .HasMaxLength(150);

            entity.Property(x => x.Mensagem)
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(x => x.EntidadeReferencia)
                .HasMaxLength(50);

            entity.Property(x => x.DataEnvio)
                .HasColumnType("datetime2");

            entity.Property(x => x.DataLeitura)
                .HasColumnType("datetime2");

            entity.HasIndex(x => new { x.DestinatarioUsuarioId, x.Lida, x.DataEnvio });

            entity.HasOne(x => x.RemetenteUsuario)
                .WithMany(x => x.NotificacoesEnviadas)
                .HasForeignKey(x => x.RemetenteUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.DestinatarioUsuario)
                .WithMany(x => x.NotificacoesRecebidas)
                .HasForeignKey(x => x.DestinatarioUsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Recuperação de senha 
        modelBuilder.Entity<RecuperacaoSenhaToken>(entity =>
        {
            entity.Property(x => x.Token)
                .HasMaxLength(200)
                .IsRequired();

            entity.HasIndex(x => x.Token)
                .IsUnique();

            entity.HasOne(x => x.Usuario)
                .WithMany()
                .HasForeignKey(x => x.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }

}