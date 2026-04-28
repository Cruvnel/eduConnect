namespace EduConnect.Api.DTOs.ProfessorDisciplina;

public class ProfessorDisciplinaResponseDto
{
    public int ProfessorDisciplinaId { get; set; }

    public int ProfessorId { get; set; }
    public string ProfessorNome { get; set; } = string.Empty;

    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;

    public int NivelEnsinoId { get; set; }
    public string NivelEnsinoNome { get; set; } = string.Empty;

    public int CargaHorariaSemanal { get; set; }
}