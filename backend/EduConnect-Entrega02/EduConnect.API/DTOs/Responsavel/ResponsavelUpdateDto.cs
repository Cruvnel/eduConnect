namespace EduConnect.Api.DTOs.Responsavel;

public class ResponsavelUpdateDto
{
    public string NomeCompleto { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string EmailContato { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}