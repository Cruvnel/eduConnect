namespace EduConnect.Api.DTOs.Financeiro;

public class FinanceiroResponsavelItemDto
{
    public int MensalidadeId { get; set; }

    public int AlunoId { get; set; }
    public string NomeAluno { get; set; } = string.Empty;
    public string RegistroAluno { get; set; } = string.Empty;

    public string Competencia { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string StatusPagamento { get; set; } = string.Empty;
    public DateTime DataVencimento { get; set; }
    public DateTime? DataPagamento { get; set; }
    public string? Observacao { get; set; }
}