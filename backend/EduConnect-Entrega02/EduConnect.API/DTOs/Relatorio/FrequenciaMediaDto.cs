namespace EduConnect.Api.DTOs.Relatorio;

public class FrequenciaMediaDto
{
    public int TotalRegistros { get; set; }
    public int TotalPresencas { get; set; }
    public int TotalAusencias { get; set; }
    public decimal FrequenciaMediaPercentual { get; set; }
}