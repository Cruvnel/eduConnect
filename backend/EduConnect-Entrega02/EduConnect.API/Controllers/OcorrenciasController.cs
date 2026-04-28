using System.Security.Claims;
using EduConnect.Api.DTOs.Ocorrencia;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Professor")]
public class OcorrenciasController : ControllerBase
{
    private readonly IOcorrenciaService _service;

    public OcorrenciasController(IOcorrenciaService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] OcorrenciaCreateDto request)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _service.CriarAsync(usuarioId, request);
            return CreatedAtAction(nameof(ObterPorId), new { id = response.OcorrenciaId }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
    }

    [HttpGet("turma/{turmaId:int}")]
    public async Task<IActionResult> ListarPorTurma(int turmaId)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _service.ListarPorTurmaAsync(turmaId, usuarioId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensagem = ex.Message });
        }
    }

    [HttpGet("aluno/{alunoId:int}")]
    public async Task<IActionResult> ListarPorAluno(int alunoId)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _service.ListarPorAlunoAsync(alunoId, usuarioId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _service.ObterPorIdAsync(id, usuarioId);

            if (response is null)
                return NotFound(new { mensagem = "Ocorrência não encontrada." });

            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Professor")]
    public async Task<IActionResult> Excluir(int id)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            await _service.ExcluirAsync(id, usuarioId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }
}