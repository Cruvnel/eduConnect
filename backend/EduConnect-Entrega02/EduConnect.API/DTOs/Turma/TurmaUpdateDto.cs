namespace EduConnect.Api.DTOs.Turma;

public class TurmaUpdateDto
{
    public string Nome { get; set; } = string.Empty;
    public int NivelEnsinoId { get; set; }
    public int AnoLetivo { get; set; }
    public string? Sala { get; set; }
    public string? ProfessorTutorNome { get; set; }
    public string? Descricao { get; set; }
    public bool Ativa { get; set; } = true;
}