using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Disciplina;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class DisciplinaService : IDisciplinaService
{
    private readonly AppDbContext _context;

    public DisciplinaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DisciplinaResponseDto> CriarAsync(DisciplinaCreateDto request)
    {
        Validar(request.Nome, request.Codigo, request.NivelEnsinoId);

        var nivel = await _context.NiveisEnsino
            .FirstOrDefaultAsync(n => n.NivelEnsinoId == request.NivelEnsinoId);

        if (nivel is null)
            throw new InvalidOperationException("Nível de ensino não encontrado.");

        var codigoJaExiste = await _context.Disciplinas
            .AnyAsync(d => d.Codigo == request.Codigo);

        if (codigoJaExiste)
            throw new InvalidOperationException("Já existe uma disciplina com esse código.");

        var disciplina = new Disciplina
        {
            Nome = request.Nome.Trim(),
            Codigo = request.Codigo.Trim().ToUpper(),
            Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? null : request.Descricao.Trim(),
            NivelEnsinoId = request.NivelEnsinoId
        };

        _context.Disciplinas.Add(disciplina);
        await _context.SaveChangesAsync();

        return new DisciplinaResponseDto
        {
            DisciplinaId = disciplina.DisciplinaId,
            Nome = disciplina.Nome,
            Codigo = disciplina.Codigo,
            Descricao = disciplina.Descricao,
            NivelEnsinoId = nivel.NivelEnsinoId,
            NivelEnsino = nivel.Nome
        };
    }

    public async Task<List<DisciplinaResponseDto>> ListarAsync()
    {
        return await _context.Disciplinas
            .Include(d => d.NivelEnsino)
            .OrderBy(d => d.Nome)
            .Select(d => new DisciplinaResponseDto
            {
                DisciplinaId = d.DisciplinaId,
                Nome = d.Nome,
                Codigo = d.Codigo,
                Descricao = d.Descricao,
                NivelEnsinoId = d.NivelEnsinoId,
                NivelEnsino = d.NivelEnsino.Nome
            })
            .ToListAsync();
    }

    public async Task<DisciplinaResponseDto?> ObterPorIdAsync(int id)
    {
        return await _context.Disciplinas
            .Include(d => d.NivelEnsino)
            .Where(d => d.DisciplinaId == id)
            .Select(d => new DisciplinaResponseDto
            {
                DisciplinaId = d.DisciplinaId,
                Nome = d.Nome,
                Codigo = d.Codigo,
                Descricao = d.Descricao,
                NivelEnsinoId = d.NivelEnsinoId,
                NivelEnsino = d.NivelEnsino.Nome
            })
            .FirstOrDefaultAsync();
    }

    public async Task<DisciplinaResponseDto> AtualizarAsync(int id, DisciplinaUpdateDto request)
    {
        Validar(request.Nome, request.Codigo, request.NivelEnsinoId);

        var disciplina = await _context.Disciplinas
            .FirstOrDefaultAsync(d => d.DisciplinaId == id);

        if (disciplina is null)
            throw new KeyNotFoundException("Disciplina não encontrada.");

        var nivel = await _context.NiveisEnsino
            .FirstOrDefaultAsync(n => n.NivelEnsinoId == request.NivelEnsinoId);

        if (nivel is null)
            throw new InvalidOperationException("Nível de ensino não encontrado.");

        var codigoJaExiste = await _context.Disciplinas
            .AnyAsync(d => d.Codigo == request.Codigo && d.DisciplinaId != id);

        if (codigoJaExiste)
            throw new InvalidOperationException("Já existe outra disciplina com esse código.");

        disciplina.Nome = request.Nome.Trim();
        disciplina.Codigo = request.Codigo.Trim().ToUpper();
        disciplina.Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? null : request.Descricao.Trim();
        disciplina.NivelEnsinoId = request.NivelEnsinoId;

        await _context.SaveChangesAsync();

        return new DisciplinaResponseDto
        {
            DisciplinaId = disciplina.DisciplinaId,
            Nome = disciplina.Nome,
            Codigo = disciplina.Codigo,
            Descricao = disciplina.Descricao,
            NivelEnsinoId = nivel.NivelEnsinoId,
            NivelEnsino = nivel.Nome
        };
    }

    public async Task ExcluirAsync(int id)
    {
        var disciplina = await _context.Disciplinas
            .FirstOrDefaultAsync(d => d.DisciplinaId == id);

        if (disciplina is null)
            throw new KeyNotFoundException("Disciplina não encontrada.");

        var emUso = await _context.ProfessoresDisciplinas.AnyAsync(x => x.DisciplinaId == id)
                    || await _context.TurmasProfessoresDisciplinas.AnyAsync(x => x.DisciplinaId == id)
                    || await _context.Notas.AnyAsync(x => x.DisciplinaId == id)
                    || await _context.Frequencias.AnyAsync(x => x.DisciplinaId == id);

        if (emUso)
            throw new InvalidOperationException("Não é possível excluir a disciplina porque ela já está em uso no sistema.");

        _context.Disciplinas.Remove(disciplina);
        await _context.SaveChangesAsync();
    }

    private static void Validar(string nome, string codigo, int nivelEnsinoId)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("O nome da disciplina é obrigatório.");

        if (string.IsNullOrWhiteSpace(codigo))
            throw new ArgumentException("O código da disciplina é obrigatório.");

        if (nivelEnsinoId <= 0)
            throw new ArgumentException("O nível de ensino é obrigatório.");
    }
}