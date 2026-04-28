namespace EduConnect.Api.DTOs.TurmaProfessorDisciplina;

public class TurmaProfessorDisciplinaResponseDto
{
    public int TurmaProfessorDisciplinaId { get; set; }
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;
    public int ProfessorId { get; set; }
    public string ProfessorNome { get; set; } = string.Empty;
    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;
    public DateTime DataVinculo { get; set; }
}