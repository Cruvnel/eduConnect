using EduConnect.Api.DTOs.Agenda;
using EduConnect.Api.DTOs.Aluno;
using EduConnect.Api.DTOs.Boletim;
using EduConnect.Api.DTOs.Frequencia;
using EduConnect.Api.DTOs.Material;
using EduConnect.Api.DTOs.Ocorrencia;
using EduConnect.Api.DTOs.Publicacao;

namespace EduConnect.Api.Services.Interfaces;

public interface IAlunoService
{
    Task<AlunoResponseDto> CriarAsync(AlunoCreateDto request);

    Task<List<AlunoListItemDto>> ListarAsync();
    Task<AlunoResponseDto> ObterPorIdAsync(int id);
    Task<AlunoResponseDto> AtualizarAsync(int id, AlunoUpdateDto request);

    Task<AlunoMeResponseDto> ObterMeuPerfilAsync(int usuarioId);
    Task<List<AgendaAlunoResponseDto>> ListarMinhaAgendaAsync(int usuarioId);
    Task<List<MaterialAlunoResponseDto>> ListarMeusMateriaisAsync(int usuarioId);
    Task<List<FrequenciaAlunoResponseDto>> ListarMinhaFrequenciaAsync(
        int usuarioId,
        DateTime? dataInicio,
        DateTime? dataFim);
    Task<List<OcorrenciaAlunoResponseDto>> ListarMinhasOcorrenciasAsync(int usuarioId);
    Task<BoletimAlunoResponseDto> ObterMeuBoletimAsync(int usuarioId);
    Task<List<PublicacaoResponseDto>> ListarPublicacoesAsync();
}