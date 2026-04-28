namespace EduConnect.Api.Entities;

public class Notificacao
{
    public int NotificacaoId { get; set; }
    public int RemetenteUsuarioId { get; set; }
    public int DestinatarioUsuarioId { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string? Titulo { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public DateTime DataEnvio { get; set; } = DateTime.UtcNow;
    public bool Lida { get; set; } = false;
    public DateTime? DataLeitura { get; set; }
    public string? EntidadeReferencia { get; set; }
    public int? EntidadeReferenciaId { get; set; }

    public Usuario RemetenteUsuario { get; set; } = null!;
    public Usuario DestinatarioUsuario { get; set; } = null!;
}