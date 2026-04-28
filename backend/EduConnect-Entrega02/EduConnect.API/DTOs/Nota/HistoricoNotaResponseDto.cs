namespace EduConnect.Api.DTOs.Nota;

public class HistoricoNotaResponseDto
{
    public int HistoricoNotaId { get; set; }
    public int NotaId { get; set; }
    public decimal ValorAnterior { get; set; }
    public decimal ValorNovo { get; set; }
    public DateTime DataAlteracao { get; set; }
    public string? Motivo { get; set; }
}