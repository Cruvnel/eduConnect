namespace EduConnect.Api.DTOs.Relatorio;

public class SituacaoAlunosRelatorioDto
{
    public int TotalAlunos { get; set; }
    public int Aprovados { get; set; }
    public int Recuperacao { get; set; }
    public int Reprovados { get; set; }
}