namespace EduConnect.Api.Entities;

public class Usuario
{
    public int UsuarioId { get; set; }
    public int PerfilId { get; set; }
    public string Registro { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    public DateTime? UltimoAcesso { get; set; }

    public Perfil Perfil { get; set; } = null!;
    public Administrador? Administrador { get; set; }
    public Professor? Professor { get; set; }
    public Aluno? Aluno { get; set; }
    public Responsavel? Responsavel { get; set; }

    public ICollection<Notificacao> NotificacoesEnviadas { get; set; } = new List<Notificacao>();
    public ICollection<Notificacao> NotificacoesRecebidas { get; set; } = new List<Notificacao>();
}