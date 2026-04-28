using EduConnect.Api.DTOs.Frequencia;

namespace EduConnect.Api.Services.Interfaces;

public interface IFrequenciaService
{
    Task<List<FrequenciaResponseDto>> RegistrarAsync(int turmaId, int usuarioId, RegistrarFrequenciaDto request);
    Task<List<FrequenciaResponseDto>> ListarPorTurmaEDataAsync(int turmaId, int usuarioId, DateTime dataAula);
}