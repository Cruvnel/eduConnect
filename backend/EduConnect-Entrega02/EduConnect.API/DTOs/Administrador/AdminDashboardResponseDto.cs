namespace EduConnect.Api.DTOs.Dashboard;

public class AdminDashboardResponseDto
{
    public int TurmasAtivas { get; set; }

    public decimal MediaGeralFundamental { get; set; }
    public decimal MediaGeralMedio { get; set; }

    public decimal FrequenciaMediaFundamental { get; set; }
    public decimal FrequenciaMediaMedio { get; set; }

    public decimal TaxaAprovacaoFundamental { get; set; }
    public decimal TaxaAprovacaoMedio { get; set; }
}