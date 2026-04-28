namespace EduConnect.Api.DTOs.Relatorio;

public class MediaPorDisciplinaDto
{
    public int DisciplinaId { get; set; }
    public string DisciplinaNome { get; set; } = string.Empty;
    public string NivelEnsino { get; set; } = string.Empty;

    public int QuantidadeNotasConsideradas { get; set; }
    public decimal MediaGeral { get; set; }
}