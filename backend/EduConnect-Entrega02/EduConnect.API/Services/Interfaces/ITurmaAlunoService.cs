using EduConnect.Api.DTOs.TurmaAluno;

namespace EduConnect.Api.Services.Interfaces;

public interface ITurmaAlunoService
{
    Task<TurmaAlunoResponseDto> AtribuirAlunoAsync(int turmaId, AtribuirAlunoTurmaDto request);
    Task<List<TurmaAlunoResponseDto>> ListarPorTurmaAsync(int turmaId);
    Task RemoverAlunoAsync(int turmaId, int alunoId);
}