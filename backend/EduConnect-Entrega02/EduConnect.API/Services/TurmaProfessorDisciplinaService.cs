using EduConnect.Api.Data;
using EduConnect.Api.DTOs.TurmaProfessorDisciplina;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class TurmaProfessorDisciplinaService : ITurmaProfessorDisciplinaService
{
    private readonly AppDbContext _context;

    public TurmaProfessorDisciplinaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TurmaProfessorDisciplinaResponseDto> AtribuirProfessorAsync(
        int turmaId,
        int usuarioAdministradorId,
        AtribuirProfessorTurmaDto request)
    {
        if (request.ProfessorId <= 0)
            throw new ArgumentException("Professor é obrigatório.");

        if (request.DisciplinaId <= 0)
            throw new ArgumentException("Disciplina é obrigatória.");

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == turmaId);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.ProfessorId == request.ProfessorId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado.");

        var disciplina = await _context.Disciplinas
            .FirstOrDefaultAsync(d => d.DisciplinaId == request.DisciplinaId);

        if (disciplina is null)
            throw new KeyNotFoundException("Disciplina não encontrada.");

        var administradorExiste = await _context.Usuarios
            .AnyAsync(u => u.UsuarioId == usuarioAdministradorId);

        if (!administradorExiste)
            throw new KeyNotFoundException("Usuário administrador não encontrado.");

        var professorHabilitado = await _context.ProfessoresDisciplinas
            .AnyAsync(pd =>
                pd.ProfessorId == request.ProfessorId &&
                pd.DisciplinaId == request.DisciplinaId &&
                pd.NivelEnsinoId == turma.NivelEnsinoId);

        if (!professorHabilitado)
            throw new InvalidOperationException("Esse professor não está habilitado para lecionar essa disciplina no nível de ensino da turma.");

        var professorJaVinculadoNaTurma = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == turmaId && x.ProfessorId == request.ProfessorId);

        if (professorJaVinculadoNaTurma)
            throw new InvalidOperationException("Esse professor já está vinculado a essa turma.");

        var disciplinaJaTemProfessorNaTurma = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == turmaId && x.DisciplinaId == request.DisciplinaId);

        if (disciplinaJaTemProfessorNaTurma)
            throw new InvalidOperationException("Essa disciplina já possui um professor vinculado nessa turma.");

        var vinculo = new TurmaProfessorDisciplina
        {
            TurmaId = turmaId,
            ProfessorId = request.ProfessorId,
            DisciplinaId = request.DisciplinaId,
            VinculadoPorUsuarioId = usuarioAdministradorId,
            DataVinculo = DateTime.UtcNow
        };

        _context.TurmasProfessoresDisciplinas.Add(vinculo);
        await _context.SaveChangesAsync();

        var notificacao = new Notificacao
        {
            RemetenteUsuarioId = usuarioAdministradorId,
            DestinatarioUsuarioId = professor.UsuarioId,
            Tipo = "VINCULO_TURMA",
            Titulo = "Novo vínculo acadêmico",
            Mensagem = $"Você foi vinculado à turma {turma.Nome} para lecionar a disciplina {disciplina.Nome}.",
            DataEnvio = DateTime.UtcNow,
            Lida = false,
            DataLeitura = null,
            EntidadeReferencia = "TurmaProfessorDisciplina",
            EntidadeReferenciaId = vinculo.TurmaProfessorDisciplinaId
        };

        _context.Notificacoes.Add(notificacao);
        await _context.SaveChangesAsync();

        return new TurmaProfessorDisciplinaResponseDto
        {
            TurmaProfessorDisciplinaId = vinculo.TurmaProfessorDisciplinaId,
            TurmaId = turma.TurmaId,
            TurmaNome = turma.Nome,
            ProfessorId = professor.ProfessorId,
            ProfessorNome = professor.NomeCompleto,
            DisciplinaId = disciplina.DisciplinaId,
            DisciplinaNome = disciplina.Nome,
            DataVinculo = vinculo.DataVinculo
        };
    }

    public async Task<List<TurmaProfessorDisciplinaResponseDto>> ListarPorTurmaAsync(int turmaId)
    {
        var turmaExiste = await _context.Turmas.AnyAsync(t => t.TurmaId == turmaId);

        if (!turmaExiste)
            throw new KeyNotFoundException("Turma não encontrada.");

        return await _context.TurmasProfessoresDisciplinas
            .Include(x => x.Turma)
            .Include(x => x.Professor)
            .Include(x => x.Disciplina)
            .Where(x => x.TurmaId == turmaId)
            .OrderBy(x => x.Disciplina.Nome)
            .Select(x => new TurmaProfessorDisciplinaResponseDto
            {
                TurmaProfessorDisciplinaId = x.TurmaProfessorDisciplinaId,
                TurmaId = x.TurmaId,
                TurmaNome = x.Turma.Nome,
                ProfessorId = x.ProfessorId,
                ProfessorNome = x.Professor.NomeCompleto,
                DisciplinaId = x.DisciplinaId,
                DisciplinaNome = x.Disciplina.Nome,
                DataVinculo = x.DataVinculo
            })
            .ToListAsync();
    }

    public async Task RemoverVinculoAsync(int turmaId, int professorId)
    {
        var vinculo = await _context.TurmasProfessoresDisciplinas
            .FirstOrDefaultAsync(x => x.TurmaId == turmaId && x.ProfessorId == professorId);

        if (vinculo is null)
            throw new KeyNotFoundException("Vínculo professor/turma não encontrado.");

        var emUso = await _context.Notas.AnyAsync(x => x.TurmaId == turmaId && x.LancadoPorProfessorId == professorId)
                    || await _context.Frequencias.AnyAsync(x => x.TurmaId == turmaId && x.RegistradoPorProfessorId == professorId)
                    || await _context.Ocorrencias.AnyAsync(x => x.TurmaId == turmaId && x.ProfessorId == professorId)
                    || await _context.MateriaisApoio.AnyAsync(x => x.TurmaId == turmaId && x.ProfessorId == professorId)
                    || await _context.EventosAgenda.AnyAsync(x => x.TurmaId == turmaId && x.CriadoPorProfessorId == professorId);

        if (emUso)
            throw new InvalidOperationException("Não é possível remover o vínculo porque já existem dados acadêmicos vinculados a ele.");

        _context.TurmasProfessoresDisciplinas.Remove(vinculo);
        await _context.SaveChangesAsync();
    }
}