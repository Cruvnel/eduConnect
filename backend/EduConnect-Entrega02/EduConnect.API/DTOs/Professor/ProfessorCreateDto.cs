namespace EduConnect.Api.DTOs.Professor;

public class ProfessorCreateDto
{
    public string Registro { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string EmailInstitucional { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}