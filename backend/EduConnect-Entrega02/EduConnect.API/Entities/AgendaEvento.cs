namespace EduConnect.Api.Entities;

public class AgendaEvento
{
    public int AgendaEventoId { get; set; }
    public int TurmaId { get; set; }
    public int CriadoPorProfessorId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public DateTime DataEvento { get; set; }

    public Turma Turma { get; set; } = null!;
    public Professor CriadoPorProfessor { get; set; } = null!;
}