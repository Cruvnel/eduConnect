namespace EduConnect.Api.DTOs.Professor;

public class ProfessorResponseDto
{
    public int ProfessorId { get; set; }
    public int UsuarioId { get; set; }

    public string Registro { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }

    public string EmailInstitucional { get; set; } = string.Empty;
    public string EmailLogin { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}