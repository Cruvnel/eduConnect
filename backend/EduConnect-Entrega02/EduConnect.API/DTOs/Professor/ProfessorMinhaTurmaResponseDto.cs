namespace EduConnect.Api.DTOs.Professor;

public class ProfessorMinhaTurmaResponseDto
{
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;
    public int AnoLetivo { get; set; }
    public string? Sala { get; set; }

    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;
}