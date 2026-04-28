namespace EduConnect.Api.Entities;

public class Publicacao
{
    public int PublicacaoId { get; set; }
    public int AdministradorId { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public DateTime DataPublicacao { get; set; } = DateTime.UtcNow;
    public bool Ativa { get; set; } = true;

    public Administrador Administrador { get; set; } = null!;
}