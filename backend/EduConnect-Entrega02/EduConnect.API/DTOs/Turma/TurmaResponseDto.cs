namespace EduConnect.Api.DTOs.Turma;

public class TurmaResponseDto
{
    public int TurmaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int NivelEnsinoId { get; set; }
    public string NivelEnsino { get; set; } = string.Empty;
    public int AnoLetivo { get; set; }
    public string? Sala { get; set; }
    public string? ProfessorTutorNome { get; set; }
    public string? Descricao { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime DataValidade { get; set; }
    public bool Ativa { get; set; }
}