using EduConnect.Api.Data;
using EduConnect.Api.DTOs.Notificacao;
using EduConnect.Api.Entities;
using EduConnect.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EduConnect.Api.Services;

public class NotificacaoService : INotificacaoService
{
    private readonly AppDbContext _context;

    public NotificacaoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CriarAsync(
        int remetenteUsuarioId,
        int destinatarioUsuarioId,
        string tipo,
        string? titulo,
        string mensagem,
        string? entidadeReferencia = null,
        int? entidadeReferenciaId = null)
    {
        if (string.IsNullOrWhiteSpace(tipo))
            throw new ArgumentException("Tipo da notificação é obrigatório.");

        if (string.IsNullOrWhiteSpace(mensagem))
            throw new ArgumentException("Mensagem da notificação é obrigatória.");

        var remetenteExiste = await _context.Usuarios
            .AnyAsync(u => u.UsuarioId == remetenteUsuarioId);

        if (!remetenteExiste)
            throw new KeyNotFoundException("Usuário remetente não encontrado.");

        var destinatarioExiste = await _context.Usuarios
            .AnyAsync(u => u.UsuarioId == destinatarioUsuarioId);

        if (!destinatarioExiste)
            throw new KeyNotFoundException("Usuário destinatário não encontrado.");

        var notificacao = new Notificacao
        {
            RemetenteUsuarioId = remetenteUsuarioId,
            DestinatarioUsuarioId = destinatarioUsuarioId,
            Tipo = tipo.Trim(),
            Titulo = string.IsNullOrWhiteSpace(titulo) ? null : titulo.Trim(),
            Mensagem = mensagem.Trim(),
            DataEnvio = DateTime.UtcNow,
            Lida = false,
            DataLeitura = null,
            EntidadeReferencia = string.IsNullOrWhiteSpace(entidadeReferencia) ? null : entidadeReferencia.Trim(),
            EntidadeReferenciaId = entidadeReferenciaId
        };

        _context.Notificacoes.Add(notificacao);
        await _context.SaveChangesAsync();
    }

    public async Task<List<NotificacaoResponseDto>> ListarMinhasAsync(int usuarioId)
    {
        return await _context.Notificacoes
            .Where(n => n.DestinatarioUsuarioId == usuarioId)
            .OrderByDescending(n => n.DataEnvio)
            .Select(n => new NotificacaoResponseDto
            {
                NotificacaoId = n.NotificacaoId,
                RemetenteUsuarioId = n.RemetenteUsuarioId,
                DestinatarioUsuarioId = n.DestinatarioUsuarioId,
                Tipo = n.Tipo,
                Titulo = n.Titulo,
                Mensagem = n.Mensagem,
                DataEnvio = n.DataEnvio,
                Lida = n.Lida,
                DataLeitura = n.DataLeitura,
                EntidadeReferencia = n.EntidadeReferencia,
                EntidadeReferenciaId = n.EntidadeReferenciaId
            })
            .ToListAsync();
    }

    public async Task MarcarComoLidaAsync(int notificacaoId, int usuarioId)
    {
        var notificacao = await _context.Notificacoes
            .FirstOrDefaultAsync(n =>
                n.NotificacaoId == notificacaoId &&
                n.DestinatarioUsuarioId == usuarioId);

        if (notificacao is null)
            throw new KeyNotFoundException("Notificação não encontrada.");

        notificacao.Lida = true;
        notificacao.DataLeitura = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task LimparMinhasAsync(int usuarioId)
    {
        var notificacoes = await _context.Notificacoes
            .Where(n => n.DestinatarioUsuarioId == usuarioId && !n.Lida)
            .ToListAsync();

        foreach (var notificacao in notificacoes)
        {
            notificacao.Lida = true;
            notificacao.DataLeitura = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }
}

