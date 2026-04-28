namespace EduConnect.Api.DTOs.Disciplina;

public class DisciplinaUpdateDto
{
    public string Nome { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public int NivelEnsinoId { get; set; }
}