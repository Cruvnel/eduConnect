namespace EduConnect.Api.DTOs.Professor;

public class ProfessorListItemDto
{
    public int ProfessorId { get; set; }
    public int UsuarioId { get; set; }
    public string Registro { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public string EmailInstitucional { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool Ativo { get; set; }
}