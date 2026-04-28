namespace EduConnect.Api.DTOs.Material;

public class MaterialAlunoResponseDto
{
    public int MaterialApoioId { get; set; }
    public int TurmaId { get; set; }
    public string TurmaNome { get; set; } = string.Empty;
    public string DisciplinaNome { get; set; } = string.Empty;

    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string ArquivoUrl { get; set; } = string.Empty;
    public DateTime DataPublicacao { get; set; }

    public string ProfessorNome { get; set; } = string.Empty;
}