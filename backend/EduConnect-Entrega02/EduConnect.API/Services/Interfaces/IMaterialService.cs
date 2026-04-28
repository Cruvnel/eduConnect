using EduConnect.Api.DTOs.Material;

namespace EduConnect.Api.Services.Interfaces;

public interface IMaterialService
{
    Task<MaterialResponseDto> CriarAsync(int usuarioId, MaterialCreateDto request);
    Task<List<MaterialResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId);
    Task<MaterialResponseDto?> ObterPorIdAsync(int id, int usuarioId);
    Task ExcluirAsync(int id, int usuarioId);
}