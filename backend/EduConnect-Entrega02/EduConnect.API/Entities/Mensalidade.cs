namespace EduConnect.Api.Entities;

public class Mensalidade
{
    public int MensalidadeId { get; set; }
    public int ResponsavelId { get; set; }
    public int AlunoId { get; set; }
    public string Competencia { get; set; } = string.Empty; // 2026-03
    public decimal Valor { get; set; }
    public DateTime DataVencimento { get; set; }
    public DateTime? DataPagamento { get; set; }
    public string StatusPagamento { get; set; } = "Pendente";
    public string? Observacao { get; set; }

    public Responsavel Responsavel { get; set; } = null!;
    public Aluno Aluno { get; set; } = null!;
}