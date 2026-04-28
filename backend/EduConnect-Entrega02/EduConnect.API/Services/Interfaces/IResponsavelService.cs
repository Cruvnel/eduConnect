using EduConnect.Api.DTOs.Agenda;
using EduConnect.Api.DTOs.Boletim;
using EduConnect.Api.DTOs.Financeiro;
using EduConnect.Api.DTOs.Frequencia;
using EduConnect.Api.DTOs.Ocorrencia;
using EduConnect.Api.DTOs.Publicacao;
using EduConnect.Api.DTOs.Responsavel;

namespace EduConnect.Api.Services.Interfaces;

public interface IResponsavelService
{
    Task<List<ResponsavelAlunoResumoDto>> ListarMeusAlunosAsync(int usuarioId);
    Task<BoletimAlunoResponseDto> ObterBoletimAlunoAsync(int usuarioId, int alunoId);
    Task<List<FrequenciaAlunoResponseDto>> ObterFrequenciaAlunoAsync(
        int usuarioId,
        int alunoId,
        DateTime? dataInicio,
        DateTime? dataFim);
    Task<List<OcorrenciaAlunoResponseDto>> ObterOcorrenciasAlunoAsync(int usuarioId, int alunoId);
    Task<List<AgendaAlunoResponseDto>> ObterAgendaAlunoAsync(int usuarioId, int alunoId);
    Task<FinanceiroResponsavelResponseDto> ObterMeuFinanceiroAsync(int usuarioId);
    Task<List<PublicacaoResponseDto>> ListarPublicacoesAsync();

    Task<List<ResponsavelListItemDto>> ListarAsync();
    Task<ResponsavelAdminResponseDto> ObterPorIdAsync(int id);
    Task<ResponsavelAdminResponseDto> AtualizarAsync(int id, ResponsavelUpdateDto request);
}