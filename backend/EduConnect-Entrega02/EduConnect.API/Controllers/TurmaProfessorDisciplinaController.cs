using System.Security.Claims;
using EduConnect.Api.DTOs.TurmaProfessorDisciplina;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/turmas/{turmaId:int}/professores")]
[Authorize(Roles = "Administrador")]
public class TurmaProfessorDisciplinaController : ControllerBase
{
    private readonly ITurmaProfessorDisciplinaService _service;

    public TurmaProfessorDisciplinaController(ITurmaProfessorDisciplinaService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> AtribuirProfessor(int turmaId, [FromBody] AtribuirProfessorTurmaDto request)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue(ClaimTypes.Name)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioAdministradorId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _service.AtribuirProfessorAsync(turmaId, usuarioAdministradorId, request);
            return Ok(response);
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

    [HttpGet]
    public async Task<IActionResult> ListarPorTurma(int turmaId)
    {
        try
        {
            var response = await _service.ListarPorTurmaAsync(turmaId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpDelete("{professorId:int}")]
    public async Task<IActionResult> RemoverVinculo(int turmaId, int professorId)
    {
        try
        {
            await _service.RemoverVinculoAsync(turmaId, professorId);
            return NoContent();
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
}