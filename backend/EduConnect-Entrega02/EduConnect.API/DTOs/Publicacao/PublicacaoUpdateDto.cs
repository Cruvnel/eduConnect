namespace EduConnect.Api.DTOs.Publicacao;

public class PublicacaoUpdateDto
{
    public string Titulo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public bool Ativa { get; set; }
}