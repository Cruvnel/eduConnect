namespace EduConnect.Api.DTOs.Agenda;

public class AgendaAlunoResponseDto
{
    public int AgendaEventoId { get; set; }
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEvento { get; set; }

    public string ProfessorNome { get; set; } = string.Empty;
}