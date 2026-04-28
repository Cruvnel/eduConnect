namespace EduConnect.Api.DTOs.TurmaAluno;

public class TurmaAlunoResponseDto
{
    public int TurmaAlunoId { get; set; }
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;
    public int AlunoId { get; set; }
    public string AlunoNome { get; set; } = string.Empty;
    public DateTime DataEntrada { get; set; }
    public bool Ativo { get; set; }
}