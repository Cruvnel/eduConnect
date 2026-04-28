namespace EduConnect.Api.DTOs.Professor;

public class ProfessorUpdateDto
{
    public string NomeCompleto { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string EmailInstitucional { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}