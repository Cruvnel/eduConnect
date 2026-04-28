using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Professor;
using EduConnect.Api.Entities;
using EduConnect.Api.Helpers;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class ProfessorService : IProfessorService
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public ProfessorService(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<ProfessorResponseDto> CriarAsync(ProfessorCreateDto request)
    {
        ValidarCriacao(request);

        var perfilProfessor = await _context.Perfis
            .FirstOrDefaultAsync(p => p.Nome == "Professor");

        if (perfilProfessor is null)
            throw new InvalidOperationException("Perfil Professor não encontrado.");

        var registroJaExiste = await _context.Usuarios
            .AnyAsync(u => u.Registro == request.Registro.Trim());

        if (registroJaExiste)
            throw new InvalidOperationException("Já existe um usuário com o registro informado.");

        var emailInstitucional = request.EmailInstitucional.Trim().ToLower();

        var emailJaExiste = await _context.Usuarios
            .AnyAsync(u => u.Email == emailInstitucional);

        if (emailJaExiste)
            throw new InvalidOperationException("Já existe um usuário com o e-mail informado.");

        var professorJaExiste = await _context.Professores
            .AnyAsync(p => p.Registro == request.Registro.Trim());

        if (professorJaExiste)
            throw new InvalidOperationException("Já existe professor com o registro informado.");

        var senhaTemporaria = SenhaHelper.GerarSenhaAleatoria();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var usuario = new Usuario
            {
                PerfilId = perfilProfessor.PerfilId,
                Registro = request.Registro.Trim(),
                Email = emailInstitucional,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaTemporaria),
                Ativo = true,
                DataCriacao = DateTime.UtcNow
            };

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            var professor = new Professor
            {
                UsuarioId = usuario.UsuarioId,
                Registro = request.Registro.Trim(),
                NomeCompleto = request.NomeCompleto.Trim(),
                DataNascimento = request.DataNascimento,
                EmailInstitucional = emailInstitucional,
                Status = request.Status.Trim()
            };

            _context.Professores.Add(professor);
            await _context.SaveChangesAsync();

            await transaction.CommitAsync();

            await _emailService.EnviarCredenciaisProfessorAsync(
                emailDestino: professor.EmailInstitucional,
                nomeProfessor: professor.NomeCompleto,
                registroProfessor: professor.Registro,
                senhaTemporaria: senhaTemporaria
            );

            return MapProfessorResponse(professor, usuario);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ProfessorMinhaTurmaResponseDto>> ListarMinhasTurmasAsync(int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        return await _context.TurmasProfessoresDisciplinas
            .Include(tp => tp.Turma)
            .Include(tp => tp.Disciplina)
            .Where(tp => tp.ProfessorId == professor.ProfessorId)
            .OrderBy(tp => tp.Turma.Nome)
            .Select(tp => new ProfessorMinhaTurmaResponseDto
            {
                TurmaId = tp.TurmaId,
                TurmaNome = tp.Turma.Nome,
                AnoLetivo = tp.Turma.AnoLetivo,
                Sala = tp.Turma.Sala,
                DisciplinaId = tp.DisciplinaId,
                DisciplinaNome = tp.Disciplina.Nome
            })
            .ToListAsync();
    }

    public async Task<List<ProfessorListItemDto>> ListarAsync()
    {
        return await _context.Professores
            .Include(p => p.Usuario)
            .OrderBy(p => p.NomeCompleto)
            .Select(p => new ProfessorListItemDto
            {
                ProfessorId = p.ProfessorId,
                UsuarioId = p.UsuarioId,
                Registro = p.Registro,
                NomeCompleto = p.NomeCompleto,
                EmailInstitucional = p.EmailInstitucional,
                Status = p.Status,
                Ativo = p.Usuario.Ativo
            })
            .ToListAsync();
    }

    public async Task<ProfessorResponseDto> ObterPorIdAsync(int id)
    {
        var professor = await _context.Professores
            .Include(p => p.Usuario)
            .FirstOrDefaultAsync(p => p.ProfessorId == id);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado.");

        return MapProfessorResponse(professor, professor.Usuario);
    }

    public async Task<ProfessorResponseDto> AtualizarAsync(int id, ProfessorUpdateDto request)
    {
        ValidarAtualizacao(request);

        var professor = await _context.Professores
            .Include(p => p.Usuario)
            .FirstOrDefaultAsync(p => p.ProfessorId == id);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado.");

        var emailNormalizado = request.EmailInstitucional.Trim().ToLower();

        var emailEmUso = await _context.Usuarios
            .AnyAsync(u => u.Email == emailNormalizado && u.UsuarioId != professor.UsuarioId);

        if (emailEmUso)
            throw new InvalidOperationException("Já existe outro usuário com o e-mail informado.");

        professor.NomeCompleto = request.NomeCompleto.Trim();
        professor.DataNascimento = request.DataNascimento;
        professor.EmailInstitucional = emailNormalizado;
        professor.Status = request.Status.Trim();

        professor.Usuario.Email = emailNormalizado;
        professor.Usuario.Ativo = request.Ativo;

        await _context.SaveChangesAsync();

        return MapProfessorResponse(professor, professor.Usuario);
    }

    private static ProfessorResponseDto MapProfessorResponse(Professor professor, Usuario usuario)
    {
        return new ProfessorResponseDto
        {
            ProfessorId = professor.ProfessorId,
            UsuarioId = usuario.UsuarioId,
            Registro = professor.Registro,
            NomeCompleto = professor.NomeCompleto,
            DataNascimento = professor.DataNascimento,
            EmailInstitucional = professor.EmailInstitucional,
            EmailLogin = usuario.Email,
            Status = professor.Status
        };
    }

    private static void ValidarCriacao(ProfessorCreateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Registro))
            throw new ArgumentException("Registro é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.NomeCompleto))
            throw new ArgumentException("Nome completo é obrigatório.");

        if (request.DataNascimento == default)
            throw new ArgumentException("Data de nascimento é obrigatória.");

        if (string.IsNullOrWhiteSpace(request.EmailInstitucional))
            throw new ArgumentException("E-mail institucional é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Status))
            throw new ArgumentException("Status é obrigatório.");
    }

    private static void ValidarAtualizacao(ProfessorUpdateDto request)
    {
        if (string.IsNullOrWhiteSpace(request.NomeCompleto))
            throw new ArgumentException("Nome completo é obrigatório.");

        if (request.DataNascimento == default)
            throw new ArgumentException("Data de nascimento é obrigatória.");

        if (string.IsNullOrWhiteSpace(request.EmailInstitucional))
            throw new ArgumentException("E-mail institucional é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.Status))
            throw new ArgumentException("Status é obrigatório.");
    }

    public async Task<ProfessorMinhaTurmaDetalheDto> ObterMinhaTurmaDetalheAsync(int usuarioId, int turmaId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var vinculoProfessorTurma = await _context.TurmasProfessoresDisciplinas
            .Include(tp => tp.Turma)
                .ThenInclude(t => t.NivelEnsino)
            .Include(tp => tp.Disciplina)
            .FirstOrDefaultAsync(tp =>
                tp.ProfessorId == professor.ProfessorId &&
                tp.TurmaId == turmaId);

        if (vinculoProfessorTurma is null)
            throw new InvalidOperationException("A turma informada não pertence ao professor autenticado.");

        var alunosDaTurma = await _context.TurmasAluno
            .Include(ta => ta.Aluno)
            .Where(ta => ta.TurmaId == turmaId && ta.Ativo)
            .OrderBy(ta => ta.Aluno.NomeCompleto)
            .Select(ta => new ProfessorMinhaTurmaAlunoDto
            {
                AlunoId = ta.AlunoId,
                NomeCompletoAluno = ta.Aluno.NomeCompleto,
                RegistroAluno = ta.Aluno.Registro,
                Ativo = ta.Aluno.Ativo
            })
            .ToListAsync();

        return new ProfessorMinhaTurmaDetalheDto
        {
            TurmaId = vinculoProfessorTurma.TurmaId,
            TurmaNome = vinculoProfessorTurma.Turma.Nome,
            AnoLetivo = vinculoProfessorTurma.Turma.AnoLetivo,
            Sala = vinculoProfessorTurma.Turma.Sala ?? string.Empty,
            NivelEnsino = vinculoProfessorTurma.Turma.NivelEnsino?.Nome ?? string.Empty,
            ProfessorTutorNome = vinculoProfessorTurma.Turma.ProfessorTutorNome ?? string.Empty,
            DisciplinaId = vinculoProfessorTurma.DisciplinaId,
            DisciplinaNome = vinculoProfessorTurma.Disciplina.Nome,
            TotalAlunos = alunosDaTurma.Count,
            Alunos = alunosDaTurma
        };
    }
}