namespace EduConnect.Api.DTOs.Boletim;

public class BoletimDisciplinaResponseDto
{
    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;

    public decimal? P1 { get; set; }
    public decimal? P2 { get; set; }
    public decimal? T1 { get; set; }
    public decimal? T2 { get; set; }
    public decimal? REC { get; set; }
    public decimal MediaFinal { get; set; }
    public decimal? FrequenciaMedia { get; set; }
    public string Situacao { get; set; } = string.Empty;
}