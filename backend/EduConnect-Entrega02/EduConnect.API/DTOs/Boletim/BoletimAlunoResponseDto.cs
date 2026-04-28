namespace EduConnect.Api.DTOs.Boletim;

public class BoletimAlunoResponseDto
{
    public int AlunoId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Registro { get; set; } = string.Empty;

    public int? TurmaId { get; set; }
    public string? TurmaNome { get; set; }
    public int? AnoLetivo { get; set; }

    public List<BoletimDisciplinaResponseDto> Disciplinas { get; set; } = new();
}