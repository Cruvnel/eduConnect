using EduConnect.Api.DTOs.Ocorrencia;

namespace EduConnect.Api.Services.Interfaces;

public interface IOcorrenciaService
{
    Task<OcorrenciaResponseDto> CriarAsync(int usuarioId, OcorrenciaCreateDto request);
    Task<List<OcorrenciaResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId);
    Task<List<OcorrenciaResponseDto>> ListarPorAlunoAsync(int alunoId, int usuarioId);
    Task<OcorrenciaResponseDto?> ObterPorIdAsync(int id, int usuarioId);
    Task ExcluirAsync(int id, int usuarioId);
}