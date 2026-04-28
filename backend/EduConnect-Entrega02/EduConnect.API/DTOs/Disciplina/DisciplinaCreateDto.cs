namespace EduConnect.Api.DTOs.Disciplina;

public class DisciplinaCreateDto
{
    public string Nome { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int NivelEnsinoId { get; set; }
}