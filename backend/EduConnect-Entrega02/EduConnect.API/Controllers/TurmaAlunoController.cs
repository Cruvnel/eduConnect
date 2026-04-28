using EduConnect.Api.DTOs.TurmaAluno;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/turmas/{turmaId:int}/alunos")]
[Authorize(Roles = "Administrador")]
public class TurmaAlunoController : ControllerBase
{
    private readonly ITurmaAlunoService _service;

    public TurmaAlunoController(ITurmaAlunoService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> AtribuirAluno(int turmaId, [FromBody] AtribuirAlunoTurmaDto request)
    {
        try
        {
            var response = await _service.AtribuirAlunoAsync(turmaId, request);
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

    [HttpDelete("{alunoId:int}")]
    public async Task<IActionResult> RemoverAluno(int turmaId, int alunoId)
    {
        try
        {
            await _service.RemoverAlunoAsync(turmaId, alunoId);
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