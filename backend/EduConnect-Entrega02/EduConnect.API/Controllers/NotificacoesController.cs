using System.Security.Claims;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificacoesController : ControllerBase
{
    private readonly INotificacaoService _notificacaoService;

    public NotificacoesController(INotificacaoService notificacaoService)
    {
        _notificacaoService = notificacaoService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> ListarMinhas()
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
            return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

        var response = await _notificacaoService.ListarMinhasAsync(usuarioId);
        return Ok(response);
    }

    [HttpPatch("{id:int}/marcar-como-lida")]
    public async Task<IActionResult> MarcarComoLida(int id)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            await _notificacaoService.MarcarComoLidaAsync(id, usuarioId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpPatch("limpar")]
    public async Task<IActionResult> LimparMinhas()
    {
        var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
            return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

        await _notificacaoService.LimparMinhasAsync(usuarioId);
        return NoContent();
    }
}