using EduConnect.Api.DTOs.Disciplina;

namespace EduConnect.Api.Services.Interfaces;

public interface IDisciplinaService
{
    Task<DisciplinaResponseDto> CriarAsync(DisciplinaCreateDto request);
    Task<List<DisciplinaResponseDto>> ListarAsync();
    Task<DisciplinaResponseDto?> ObterPorIdAsync(int id);
    Task<DisciplinaResponseDto> AtualizarAsync(int id, DisciplinaUpdateDto request);
    Task ExcluirAsync(int id);
}