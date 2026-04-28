namespace EduConnect.Api.DTOs.Aluno;

public class AlunoMeResponseDto
{
    public int AlunoId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Registro { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string? FotoUrl { get; set; }
    public string Email { get; set; } = string.Empty;

    public int? TurmaId { get; set; }
    public string? TurmaNome { get; set; }
    public int? AnoLetivo { get; set; }
    public string? Sala { get; set; }
    public string? ProfessorTutorNome { get; set; }
    public string? NivelEnsino { get; set; }
}