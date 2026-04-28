using EduConnect.Api.DTOs.Notificacao;

namespace EduConnect.Api.Services.Interfaces;

public interface INotificacaoService
{
    Task CriarAsync(
        int remetenteUsuarioId,
        int destinatarioUsuarioId,
        string tipo,
        string? titulo,
        string mensagem,
        string? entidadeReferencia = null,
        int? entidadeReferenciaId = null);

    Task<List<NotificacaoResponseDto>> ListarMinhasAsync(int usuarioId);
    Task MarcarComoLidaAsync(int notificacaoId, int usuarioId);
    Task LimparMinhasAsync(int usuarioId);
}