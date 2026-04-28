using EduConnect.Api.Data;
using EduConnect.Api.DTOs.ProfessorDisciplina;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class ProfessorDisciplinaService : IProfessorDisciplinaService
{
    private readonly AppDbContext _context;

    public ProfessorDisciplinaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProfessorDisciplinaResponseDto> CriarAsync(int professorId, ProfessorDisciplinaCreateDto request)
    {
        if (request.DisciplinaId <= 0)
            throw new ArgumentException("Disciplina é obrigatória.");

        if (request.NivelEnsinoId <= 0)
            throw new ArgumentException("Nível de ensino é obrigatório.");

        if (request.CargaHorariaSemanal < 0 || request.CargaHorariaSemanal > 40)
            throw new ArgumentException("Carga horária semanal deve estar entre 0 e 40.");

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.ProfessorId == professorId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado.");

        var disciplina = await _context.Disciplinas
            .FirstOrDefaultAsync(d => d.DisciplinaId == request.DisciplinaId);

        if (disciplina is null)
            throw new KeyNotFoundException("Disciplina não encontrada.");

        var nivelEnsino = await _context.NiveisEnsino
            .FirstOrDefaultAsync(n => n.NivelEnsinoId == request.NivelEnsinoId);

        if (nivelEnsino is null)
            throw new KeyNotFoundException("Nível de ensino não encontrado.");

        var jaExiste = await _context.ProfessoresDisciplinas
            .AnyAsync(pd =>
                pd.ProfessorId == professorId &&
                pd.DisciplinaId == request.DisciplinaId &&
                pd.NivelEnsinoId == request.NivelEnsinoId);

        if (jaExiste)
            throw new InvalidOperationException("Esse professor já está habilitado para essa disciplina nesse nível de ensino.");

        var professorDisciplina = new ProfessorDisciplina
        {
            ProfessorId = professorId,
            DisciplinaId = request.DisciplinaId,
            NivelEnsinoId = request.NivelEnsinoId,
            CargaHorariaSemanal = request.CargaHorariaSemanal
        };

        _context.ProfessoresDisciplinas.Add(professorDisciplina);
        await _context.SaveChangesAsync();

        return new ProfessorDisciplinaResponseDto
        {
            ProfessorDisciplinaId = professorDisciplina.ProfessorDisciplinaId,
            ProfessorId = professor.ProfessorId,
            ProfessorNome = professor.NomeCompleto,
            DisciplinaId = disciplina.DisciplinaId,
            DisciplinaNome = disciplina.Nome,
            NivelEnsinoId = nivelEnsino.NivelEnsinoId,
            NivelEnsinoNome = nivelEnsino.Nome,
            CargaHorariaSemanal = professorDisciplina.CargaHorariaSemanal
        };
    }

    public async Task<List<ProfessorDisciplinaResponseDto>> ListarPorProfessorAsync(int professorId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.ProfessorId == professorId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado.");

        return await _context.ProfessoresDisciplinas
            .Include(pd => pd.Disciplina)
            .Include(pd => pd.NivelEnsino)
            .Where(pd => pd.ProfessorId == professorId)
            .OrderBy(pd => pd.Disciplina.Nome)
            .ThenBy(pd => pd.NivelEnsino.Nome)
            .Select(pd => new ProfessorDisciplinaResponseDto
            {
                ProfessorDisciplinaId = pd.ProfessorDisciplinaId,
                ProfessorId = pd.ProfessorId,
                ProfessorNome = professor.NomeCompleto,
                DisciplinaId = pd.DisciplinaId,
                DisciplinaNome = pd.Disciplina.Nome,
                NivelEnsinoId = pd.NivelEnsinoId,
                NivelEnsinoNome = pd.NivelEnsino.Nome,
                CargaHorariaSemanal = pd.CargaHorariaSemanal
            })
            .ToListAsync();
    }

    public async Task RemoverAsync(int professorId, int disciplinaId, int nivelEnsinoId)
    {
        var vinculo = await _context.ProfessoresDisciplinas
            .FirstOrDefaultAsync(pd =>
                pd.ProfessorId == professorId &&
                pd.DisciplinaId == disciplinaId &&
                pd.NivelEnsinoId == nivelEnsinoId);

        if (vinculo is null)
            throw new KeyNotFoundException("Habilitação do professor não encontrada.");

        var estaEmUso = await _context.TurmasProfessoresDisciplinas
            .Include(tp => tp.Turma)
            .AnyAsync(tp =>
                tp.ProfessorId == professorId &&
                tp.DisciplinaId == disciplinaId &&
                tp.Turma.NivelEnsinoId == nivelEnsinoId);

        if (estaEmUso)
            throw new InvalidOperationException("Não é possível remover a habilitação porque o professor já está vinculado a turma(s) com essa disciplina nesse nível.");

        _context.ProfessoresDisciplinas.Remove(vinculo);
        await _context.SaveChangesAsync();
    }
}