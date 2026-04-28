using EduConnect.Api.DTOs.Turma;

namespace EduConnect.Api.Services.Interfaces;

public interface ITurmaService
{
    Task<TurmaResponseDto> CriarAsync(TurmaCreateDto request);
    Task<List<TurmaResponseDto>> ListarAsync();
    Task<TurmaResponseDto?> ObterPorIdAsync(int id);
    Task<TurmaResponseDto> AtualizarAsync(int id, TurmaUpdateDto request);
    Task ExcluirAsync(int id);
}