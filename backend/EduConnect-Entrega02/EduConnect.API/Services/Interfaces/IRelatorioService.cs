using EduConnect.Api.DTOs.Relatorio;

namespace EduConnect.Api.Services.Interfaces;

public interface IRelatorioService
{
    Task<SituacaoAlunosRelatorioDto> ObterSituacaoAlunosAsync();
    Task<List<AprovacoesPorTurmaDto>> ObterAprovacoesPorTurmaAsync();
    Task<List<MediaPorDisciplinaDto>> ObterMediaPorDisciplinaAsync();
    Task<FrequenciaMediaDto> ObterFrequenciaMediaAsync();
}