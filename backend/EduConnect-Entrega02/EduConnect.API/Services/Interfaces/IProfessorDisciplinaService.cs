using EduConnect.Api.DTOs.ProfessorDisciplina;

namespace EduConnect.Api.Services.Interfaces;

public interface IProfessorDisciplinaService
{
    Task<ProfessorDisciplinaResponseDto> CriarAsync(int professorId, ProfessorDisciplinaCreateDto request);
    Task<List<ProfessorDisciplinaResponseDto>> ListarPorProfessorAsync(int professorId);
    Task RemoverAsync(int professorId, int disciplinaId, int nivelEnsinoId);
}