namespace EduConnect.Api.DTOs.Notificacao;

public class NotificacaoResponseDto
{
    public int NotificacaoId { get; set; }

    public int RemetenteUsuarioId { get; set; }
    public int DestinatarioUsuarioId { get; set; }

    public string Tipo { get; set; } = string.Empty;
    public string? Titulo { get; set; }
    public string Mensagem { get; set; } = string.Empty;

    public DateTime DataEnvio { get; set; }
    public bool Lida { get; set; }
    public DateTime? DataLeitura { get; set; }

    public string? EntidadeReferencia { get; set; }
    public int? EntidadeReferenciaId { get; set; }
}