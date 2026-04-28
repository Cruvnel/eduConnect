namespace EduConnect.Api.DTOs.Financeiro;

public class FinanceiroResponsavelResponseDto
{
    public int ResponsavelId { get; set; }
    public string NomeResponsavel { get; set; } = string.Empty;
    public string EmailContato { get; set; } = string.Empty;

    public List<FinanceiroResponsavelItemDto> Itens { get; set; } = new();
}