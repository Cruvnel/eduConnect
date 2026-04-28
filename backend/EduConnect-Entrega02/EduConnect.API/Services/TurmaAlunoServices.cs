using EduConnect.Api.Data;
using EduConnect.Api.DTOs.TurmaAluno;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class TurmaAlunoService : ITurmaAlunoService
{
    private readonly AppDbContext _context;

    public TurmaAlunoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TurmaAlunoResponseDto> AtribuirAlunoAsync(int turmaId, AtribuirAlunoTurmaDto request)
    {
        if (request.AlunoId <= 0)
            throw new ArgumentException("Aluno é obrigatório.");

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == turmaId);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var aluno = await _context.Alunos
            .FirstOrDefaultAsync(a => a.AlunoId == request.AlunoId);

        if (aluno is null)
            throw new KeyNotFoundException("Aluno não encontrado.");

        var alunoJaNaMesmaTurma = await _context.TurmasAluno
            .AnyAsync(x => x.TurmaId == turmaId && x.AlunoId == request.AlunoId && x.Ativo);

        if (alunoJaNaMesmaTurma)
            throw new InvalidOperationException("Esse aluno já está vinculado a essa turma.");

        var alunoEmOutraTurmaAtiva = await _context.TurmasAluno
            .Include(x => x.Turma)
            .FirstOrDefaultAsync(x => x.AlunoId == request.AlunoId && x.Ativo);

        if (alunoEmOutraTurmaAtiva is not null)
            throw new InvalidOperationException(
                $"Esse aluno já está vinculado à turma {alunoEmOutraTurmaAtiva.Turma.Nome}."
            );

        var vinculo = new TurmaAluno
        {
            TurmaId = turmaId,
            AlunoId = request.AlunoId,
            DataEntrada = DateTime.UtcNow,
            Ativo = true
        };

        _context.TurmasAluno.Add(vinculo);
        await _context.SaveChangesAsync();

        return new TurmaAlunoResponseDto
        {
            TurmaAlunoId = vinculo.TurmaAlunoId,
            TurmaId = turma.TurmaId,
            TurmaNome = turma.Nome,
            AlunoId = aluno.AlunoId,
            AlunoNome = aluno.NomeCompleto,
            DataEntrada = vinculo.DataEntrada,
            Ativo = vinculo.Ativo
        };
    }

    public async Task<List<TurmaAlunoResponseDto>> ListarPorTurmaAsync(int turmaId)
    {
        var turmaExiste = await _context.Turmas.AnyAsync(t => t.TurmaId == turmaId);

        if (!turmaExiste)
            throw new KeyNotFoundException("Turma não encontrada.");

        return await _context.TurmasAluno
            .Include(x => x.Turma)
            .Include(x => x.Aluno)
            .Where(x => x.TurmaId == turmaId && x.Ativo)
            .OrderBy(x => x.Aluno.NomeCompleto)
            .Select(x => new TurmaAlunoResponseDto
            {
                TurmaAlunoId = x.TurmaAlunoId,
                TurmaId = x.TurmaId,
                TurmaNome = x.Turma.Nome,
                AlunoId = x.AlunoId,
                AlunoNome = x.Aluno.NomeCompleto,
                DataEntrada = x.DataEntrada,
                Ativo = x.Ativo
            })
            .ToListAsync();
    }

    public async Task RemoverAlunoAsync(int turmaId, int alunoId)
    {
        var vinculo = await _context.TurmasAluno
            .FirstOrDefaultAsync(x => x.TurmaId == turmaId && x.AlunoId == alunoId && x.Ativo);

        if (vinculo is null)
            throw new KeyNotFoundException("Vínculo aluno/turma não encontrado.");

        var emUso = await _context.Notas.AnyAsync(x => x.TurmaId == turmaId && x.AlunoId == alunoId)
                    || await _context.Frequencias.AnyAsync(x => x.TurmaId == turmaId && x.AlunoId == alunoId)
                    || await _context.Ocorrencias.AnyAsync(x => x.TurmaId == turmaId && x.AlunoId == alunoId);

        if (emUso)
            throw new InvalidOperationException("Não é possível remover o aluno da turma porque já existem dados acadêmicos vinculados.");

        vinculo.Ativo = false;
        vinculo.DataSaida = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}