using EduConnect.Api.DTOs.Agenda;

namespace EduConnect.Api.Services.Interfaces;

public interface IAgendaService
{
    Task<AgendaResponseDto> CriarAsync(int usuarioId, AgendaCreateDto request);
    Task<List<AgendaResponseDto>> ListarPorTurmaAsync(int turmaId, int usuarioId);
    Task<AgendaResponseDto?> ObterPorIdAsync(int id, int usuarioId);
    Task ExcluirAsync(int id, int usuarioId);
}