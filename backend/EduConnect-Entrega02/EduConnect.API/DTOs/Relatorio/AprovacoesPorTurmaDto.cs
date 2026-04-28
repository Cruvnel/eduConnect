namespace EduConnect.Api.DTOs.Relatorio;

public class AprovacoesPorTurmaDto
{
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;
    public int AnoLetivo { get; set; }

    public int TotalAlunos { get; set; }
    public int Aprovados { get; set; }
    public int Recuperacao { get; set; }
    public int Reprovados { get; set; }
}