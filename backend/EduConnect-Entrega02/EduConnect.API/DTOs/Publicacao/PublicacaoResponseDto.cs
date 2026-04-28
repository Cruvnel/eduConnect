namespace EduConnect.Api.DTOs.Publicacao;

public class PublicacaoResponseDto
{
    public int PublicacaoId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public DateTime DataPublicacao { get; set; }
    public bool Ativa { get; set; }
    public string CriadoPorNome { get; set; } = string.Empty;
}