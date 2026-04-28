namespace EduConnect.Api.DTOs.Responsavel;

public class ResponsavelAlunoResumoAdminDto
{
    public int AlunoId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Registro { get; set; } = string.Empty;
    public string? TipoResponsabilidade { get; set; }
    public bool Principal { get; set; }
}