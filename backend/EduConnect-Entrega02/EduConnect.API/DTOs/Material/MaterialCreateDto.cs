namespace EduConnect.Api.DTOs.Material;

public class MaterialCreateDto
{
    public int TurmaId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string ArquivoUrl { get; set; } = string.Empty;
}