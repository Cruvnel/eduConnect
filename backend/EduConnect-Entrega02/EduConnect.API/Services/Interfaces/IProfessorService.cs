using EduConnect.Api.DTOs.Professor;

namespace EduConnect.Api.Services.Interfaces;

public interface IProfessorService
{
    Task<ProfessorResponseDto> CriarAsync(ProfessorCreateDto request);
    Task<List<ProfessorMinhaTurmaResponseDto>> ListarMinhasTurmasAsync(int usuarioId);

    Task<List<ProfessorListItemDto>> ListarAsync();
    Task<ProfessorResponseDto> ObterPorIdAsync(int id);
    Task<ProfessorResponseDto> AtualizarAsync(int id, ProfessorUpdateDto request);
    Task<ProfessorMinhaTurmaDetalheDto> ObterMinhaTurmaDetalheAsync(int usuarioId, int turmaId);
}