namespace EduConnect.Api.DTOs.Responsavel;

public class ResponsavelListItemDto
{
    public int ResponsavelId { get; set; }
    public int UsuarioId { get; set; }
    public string Registro { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string EmailContato { get; set; } = string.Empty;
    public bool Ativo { get; set; }

    public int QuantidadeAlunosVinculados { get; set; }
}