using EduConnect.Api.DTOs.Relatorio;

namespace EduConnect.Api.Services.Interfaces;

public interface IRelatorioPdfService
{
    byte[] GerarSituacaoAlunosPdf(SituacaoAlunosRelatorioDto dados);
    byte[] GerarAprovacoesPorTurmaPdf(List<AprovacoesPorTurmaDto> dados);
    byte[] GerarMediaPorDisciplinaPdf(List<MediaPorDisciplinaDto> dados);
    byte[] GerarFrequenciaMediaPdf(FrequenciaMediaDto dados);
}