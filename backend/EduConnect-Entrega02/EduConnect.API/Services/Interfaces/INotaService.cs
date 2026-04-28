using EduConnect.Api.DTOs.Nota;

namespace EduConnect.Api.Services.Interfaces;

public interface INotaService
{
    Task<List<NotaResponseDto>> RegistrarAsync(int usuarioId, RegistrarNotasDto request);
    Task<List<NotaResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId);
    Task<NotaResponseDto> AtualizarAsync(int notaId, int usuarioId, AtualizarNotaDto request);
    Task<NotasProfessorResumoDto> ListarMinhasTurmasAsync(int usuarioId);
    Task<List<HistoricoNotaResponseDto>> ListarHistoricoAsync(int notaId, int usuarioId);
}