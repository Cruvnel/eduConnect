namespace EduConnect.Api.Entities;

public class RecuperacaoSenhaToken
{
    public int RecuperacaoSenhaTokenId { get; set; }

    public int UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;

    public string Token { get; set; } = string.Empty;
    public DateTime ExpiraEm { get; set; }
    public bool Usado { get; set; }

    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
}