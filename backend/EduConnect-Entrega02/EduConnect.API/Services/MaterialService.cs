using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Material;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class MaterialService : IMaterialService
{
    private readonly AppDbContext _context;

    public MaterialService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MaterialResponseDto> CriarAsync(int usuarioId, MaterialCreateDto request)
    {
        if (request.TurmaId <= 0)
            throw new ArgumentException("Turma é obrigatória.");

        if (string.IsNullOrWhiteSpace(request.Titulo))
            throw new ArgumentException("Título é obrigatório.");

        if (string.IsNullOrWhiteSpace(request.ArquivoUrl))
            throw new ArgumentException("Arquivo é obrigatório.");

        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var turma = await _context.Turmas
            .FirstOrDefaultAsync(t => t.TurmaId == request.TurmaId);

        if (turma is null)
            throw new KeyNotFoundException("Turma não encontrada.");

        var professorVinculado = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == request.TurmaId && x.ProfessorId == professor.ProfessorId);

        if (!professorVinculado)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        if (!request.ArquivoUrl.StartsWith("/uploads/materiais/", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Arquivo inválido para material de apoio.");

        var material = new MaterialApoio
        {
            ProfessorId = professor.ProfessorId,
            TurmaId = request.TurmaId,
            Titulo = request.Titulo.Trim(),
            Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? null : request.Descricao.Trim(),
            ArquivoUrl = request.ArquivoUrl.Trim(),
            DataPublicacao = DateTime.UtcNow
        };

        _context.MateriaisApoio.Add(material);
        await _context.SaveChangesAsync();

        return new MaterialResponseDto
        {
            MaterialApoioId = material.MaterialApoioId,
            TurmaId = turma.TurmaId,
            TurmaNome = turma.Nome,
            ProfessorId = professor.ProfessorId,
            ProfessorNome = professor.NomeCompleto,
            Titulo = material.Titulo,
            Descricao = material.Descricao,
            ArquivoUrl = material.ArquivoUrl,
            DataPublicacao = material.DataPublicacao
        };
    }

    public async Task<List<MaterialResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var professorVinculado = await _context.TurmasProfessoresDisciplinas
            .AnyAsync(x => x.TurmaId == turmaId && x.ProfessorId == professor.ProfessorId);

        if (!professorVinculado)
            throw new InvalidOperationException("Professor não está vinculado a essa turma.");

        return await _context.MateriaisApoio
            .Include(m => m.Turma)
            .Include(m => m.Professor)
            .Where(m => m.TurmaId == turmaId && m.ProfessorId == professor.ProfessorId)
            .OrderByDescending(m => m.DataPublicacao)
            .Select(m => new MaterialResponseDto
            {
                MaterialApoioId = m.MaterialApoioId,
                TurmaId = m.TurmaId,
                TurmaNome = m.Turma.Nome,
                ProfessorId = m.ProfessorId,
                ProfessorNome = m.Professor.NomeCompleto,
                Titulo = m.Titulo,
                Descricao = m.Descricao,
                ArquivoUrl = m.ArquivoUrl,
                DataPublicacao = m.DataPublicacao
            })
            .ToListAsync();
    }

    public async Task<MaterialResponseDto?> ObterPorIdAsync(int id, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        return await _context.MateriaisApoio
            .Include(m => m.Turma)
            .Include(m => m.Professor)
            .Where(m => m.MaterialApoioId == id && m.ProfessorId == professor.ProfessorId)
            .Select(m => new MaterialResponseDto
            {
                MaterialApoioId = m.MaterialApoioId,
                TurmaId = m.TurmaId,
                TurmaNome = m.Turma.Nome,
                ProfessorId = m.ProfessorId,
                ProfessorNome = m.Professor.NomeCompleto,
                Titulo = m.Titulo,
                Descricao = m.Descricao,
                ArquivoUrl = m.ArquivoUrl,
                DataPublicacao = m.DataPublicacao
            })
            .FirstOrDefaultAsync();
    }

    public async Task ExcluirAsync(int id, int usuarioId)
    {
        var professor = await _context.Professores
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId);

        if (professor is null)
            throw new KeyNotFoundException("Professor não encontrado para o usuário autenticado.");

        var material = await _context.MateriaisApoio
            .FirstOrDefaultAsync(m => m.MaterialApoioId == id && m.ProfessorId == professor.ProfessorId);

        if (material is null)
            throw new KeyNotFoundException("Material não encontrado.");

        _context.MateriaisApoio.Remove(material);
        await _context.SaveChangesAsync();
    }
}