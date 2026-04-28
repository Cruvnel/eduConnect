namespace EduConnect.Api.DTOs.Agenda;

public class AgendaCreateDto
{
    public int TurmaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEvento { get; set; }
}