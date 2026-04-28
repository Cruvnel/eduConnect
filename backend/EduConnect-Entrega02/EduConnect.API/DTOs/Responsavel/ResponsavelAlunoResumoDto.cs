namespace EduConnect.Api.DTOs.Responsavel;

public class ResponsavelAlunoResumoDto
{
    public int AlunoId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Registro { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }

    public int? TurmaId { get; set; }
    public string? TurmaNome { get; set; }
    public int? AnoLetivo { get; set; }
    public string? ProfessorTutorNome { get; set; }

    public string? TipoResponsabilidade { get; set; }
    public bool ResponsavelPrincipal { get; set; }
}