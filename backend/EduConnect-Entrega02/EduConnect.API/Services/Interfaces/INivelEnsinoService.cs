using EduConnect.Api.DTOs.NivelEnsino;

namespace EduConnect.Api.Services.Interfaces;

public interface INivelEnsinoService
{
    Task<List<NivelEnsinoResponseDto>> ListarAsync();
    Task<NivelEnsinoResponseDto> ObterPorIdAsync(int id);
}