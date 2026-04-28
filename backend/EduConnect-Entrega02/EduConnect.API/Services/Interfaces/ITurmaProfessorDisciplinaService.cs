using EduConnect.Api.DTOs.TurmaProfessorDisciplina;

namespace EduConnect.Api.Services.Interfaces;

public interface ITurmaProfessorDisciplinaService
{
    Task<TurmaProfessorDisciplinaResponseDto> AtribuirProfessorAsync(
        int turmaId,
        int usuarioAdministradorId,
        AtribuirProfessorTurmaDto request);

    Task<List<TurmaProfessorDisciplinaResponseDto>> ListarPorTurmaAsync(int turmaId);

    Task RemoverVinculoAsync(int turmaId, int professorId);
}