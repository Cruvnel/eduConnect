using EduConnect.Api.Data;
using EduConnect.Api.DTOs.NivelEnsino;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class NivelEnsinoService : INivelEnsinoService
{
    private readonly AppDbContext _context;

    public NivelEnsinoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<NivelEnsinoResponseDto>> ListarAsync()
    {
        return await _context.NiveisEnsino
            .OrderBy(n => n.Nome)
            .Select(n => new NivelEnsinoResponseDto
            {
                NivelEnsinoId = n.NivelEnsinoId,
                Nome = n.Nome
            })
            .ToListAsync();
    }

    public async Task<NivelEnsinoResponseDto> ObterPorIdAsync(int id)
    {
        var nivel = await _context.NiveisEnsino
            .FirstOrDefaultAsync(n => n.NivelEnsinoId == id);

        if (nivel is null)
            throw new KeyNotFoundException("Nível de ensino não encontrado.");

        return new NivelEnsinoResponseDto
        {
            NivelEnsinoId = nivel.NivelEnsinoId,
            Nome = nivel.Nome
        };
    }
}