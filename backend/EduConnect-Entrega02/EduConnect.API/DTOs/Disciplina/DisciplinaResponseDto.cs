namespace EduConnect.Api.DTOs.Disciplina;

public class DisciplinaResponseDto
{
    public int DisciplinaId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int NivelEnsinoId { get; set; }
    public string NivelEnsino { get; set; } = string.Empty;
}