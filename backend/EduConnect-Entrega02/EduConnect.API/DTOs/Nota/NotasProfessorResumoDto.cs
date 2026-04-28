namespace EduConnect.Api.DTOs.Nota;

public class NotasProfessorResumoDto
{
    public int ProfessorId { get; set; }
    public string ProfessorNome { get; set; } = string.Empty;

    public List<NotaTurmaResumoDto> Turmas { get; set; } = new();
}