namespace EduConnect.Api.Entities;

public class MaterialApoio
{
    public int MaterialApoioId { get; set; }
    public int ProfessorId { get; set; }
    public int TurmaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string ArquivoUrl { get; set; } = string.Empty;
    public DateTime DataPublicacao { get; set; } = DateTime.UtcNow;

    public Professor Professor { get; set; } = null!;
    public Turma Turma { get; set; } = null!;
}