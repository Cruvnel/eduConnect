namespace EduConnect.Api.DTOs.Agenda;

public class AgendaResponseDto
{
    public int AgendaEventoId { get; set; }

    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;

    public int CriadoPorProfessorId { get; set; }
    public string ProfessorNome { get; set; } = string.Empty;

    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEvento { get; set; }
}