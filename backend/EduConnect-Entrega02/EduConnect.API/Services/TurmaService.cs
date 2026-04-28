using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Turma;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class TurmaService : ITurmaService
{
    private readonly AppDbContext _context;

    public TurmaService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TurmaResponseDto> CriarAsync(TurmaCreateDto request)
    {
        Validar(request.Nome, request.NivelEnsinoId, request.AnoLetivo);

        var nivel = await _context.NiveisEnsino
            .FirstOrDefaultAsync(n => n.NivelEnsinoId == request.NivelEnsinoId);

        if (nivel is null)
            throw new InvalidOperationException("Nível de ensino não encontrado.");

        var turmaJaExiste = await _context.Turmas
            .AnyAsync(t => t.Nome == request.Nome && t.AnoLetivo == request.AnoLetivo);

        if (turmaJaExiste)
            throw new InvalidOperationException("Já existe uma turma com esse nome no mesmo ano letivo.");

        var agora = DateTime.UtcNow;

        var turma = new Turma
        {
            Nome = request.Nome.Trim(),
            NivelEnsinoId = request.NivelEnsinoId,
            AnoLetivo = request.AnoLetivo,
            Sala = string.IsNullOrWhiteSpace(request.Sala) ? null : request.Sala.Trim(),
            ProfessorTutorNome = string.IsNullOrWhiteSpace(request.ProfessorTutorNome) ? null : request.ProfessorTutorNome.Trim(),
            Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? null : request.Descricao.Trim(),
            DataCriacao = agora,
            DataValidade = agora.AddYears(1),
            Ativa = true
        };

        _context.Turmas.Add(turma);
        await _context.SaveChangesAsync();

        return MapearResponse(turma, nivel.Nome);
    }

    public async Task<List<TurmaResponseDto>> ListarAsync()
    {
        return await _context.Turmas
            .Include(t => t.NivelEnsino)
            .OrderBy(t => t.AnoLetivo)
            .ThenBy(t => t.Nome)
            .Select(t => new TurmaResponseDto
            {
                TurmaId = t.TurmaId,
                Nome = t.Nome,
                NivelEnsinoId = t.NivelEnsinoId,
                NivelEnsino = t.NivelEnsino.Nome,
                AnoLetivo = t.AnoLetivo,
                Sala = t.Sala,
                ProfessorTutorNome = t.ProfessorTutorNome,
                Descricao = t.Descricao,
                DataCriacao = t.DataCriacao,
                DataValidade = t.DataValidade,
                Ativa = t.Ativa
            })
            .ToListAsync();
    }

    public async Task<TurmaResponseDto?> ObterPorIdAsync(int id)
    {
        return await _context.Turmas
            .Include(t => t.NivelEnsino)
            .Where(t => t.TurmaId == id)
            .Select(t => new TurmaResponseDto
            {
                TurmaId = t.TurmaId,
                Nome = t.Nome,
                NivelEnsinoId = t.NivelEnsinoId,
                NivelEnsino = t.NivelEnsino.Nome,
                AnoLetivo = t.AnoLetivo,
                Sala = t.Sala,
                ProfessorTutorNome = t.ProfessorTutorNome,
                Descricao = t.Descricao,
                DataCriacao = t.DataCriacao,
                DataValidade = t.DataValidade,
                Ativa = t.Ativa
            })
            .FirstOrDefaultAsync();
    }

    public async Task<TurmaResponseDto> AtualizarAsync(int id, TurmaUpdateDto request)
    {
        Validar(request.Nome, request.NivelEnsinoId, request.AnoLetivo);

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == id);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var nivel = await _context.NiveisEnsino
            .FirstOrDefaultAsync(n => n.NivelEnsinoId == request.NivelEnsinoId);

        if (nivel is null)
            throw new InvalidOperationException("Nível de ensino não encontrado.");

        var turmaDuplicada = await _context.Turmas
            .AnyAsync(t => t.Nome == request.Nome && t.AnoLetivo == request.AnoLetivo && t.TurmaId != id);

        if (turmaDuplicada)
            throw new InvalidOperationException("Já existe outra turma com esse nome no mesmo ano letivo.");

        turma.Nome = request.Nome.Trim();
        turma.NivelEnsinoId = request.NivelEnsinoId;
        turma.AnoLetivo = request.AnoLetivo;
        turma.Sala = string.IsNullOrWhiteSpace(request.Sala) ? null : request.Sala.Trim();
        turma.ProfessorTutorNome = string.IsNullOrWhiteSpace(request.ProfessorTutorNome) ? null : request.ProfessorTutorNome.Trim();
        turma.Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? null : request.Descricao.Trim();
        turma.Ativa = request.Ativa;

        await _context.SaveChangesAsync();

        return MapearResponse(turma, nivel.Nome);
    }

    public async Task ExcluirAsync(int id)
    {
        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == id);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var emUso = await _context.TurmasAluno.AnyAsync(x => x.TurmaId == id)
                    || await _context.TurmasProfessoresDisciplinas.AnyAsync(x => x.TurmaId == id)
                    || await _context.Notas.AnyAsync(x => x.TurmaId == id)
                    || await _context.Frequencias.AnyAsync(x => x.TurmaId == id)
                    || await _context.Ocorrencias.AnyAsync(x => x.TurmaId == id)
                    || await _context.MateriaisApoio.AnyAsync(x => x.TurmaId == id)
                    || await _context.EventosAgenda.AnyAsync(x => x.TurmaId == id);

        if (emUso)
            throw new InvalidOperationException("Não é possível excluir a turma porque ela já está em uso no sistema.");

        _context.Turmas.Remove(turma);
        await _context.SaveChangesAsync();
    }

    private static void Validar(string nome, int nivelEnsinoId, int anoLetivo)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new ArgumentException("O nome da turma é obrigatório.");

        if (nivelEnsinoId <= 0)
            throw new ArgumentException("O nível de ensino é obrigatório.");

        if (anoLetivo < 2000 || anoLetivo > 2100)
            throw new ArgumentException("Ano letivo inválido.");
    }

    private static TurmaResponseDto MapearResponse(Turma turma, string nivelEnsinoNome)
    {
        return new TurmaResponseDto
        {
            TurmaId = turma.TurmaId,
            Nome = turma.Nome,
            NivelEnsinoId = turma.NivelEnsinoId,
            NivelEnsino = nivelEnsinoNome,
            AnoLetivo = turma.AnoLetivo,
            Sala = turma.Sala,
            ProfessorTutorNome = turma.ProfessorTutorNome,
            Descricao = turma.Descricao,
            DataCriacao = turma.DataCriacao,
            DataValidade = turma.DataValidade,
            Ativa = turma.Ativa
        };
    }
}