using EduConnect.Api.DTOs.ProfessorDisciplina;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/professores/{professorId:int}/disciplinas")]
[Authorize(Roles = "Administrador")]
public class ProfessoresDisciplinasController : ControllerBase
{
    private readonly IProfessorDisciplinaService _professorDisciplinaService;

    public ProfessoresDisciplinasController(IProfessorDisciplinaService professorDisciplinaService)
    {
        _professorDisciplinaService = professorDisciplinaService;
    }

    [HttpPost]
    public async Task<IActionResult> Criar(int professorId, [FromBody] ProfessorDisciplinaCreateDto request)
    {
        try
        {
            var response = await _professorDisciplinaService.CriarAsync(professorId, request);
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
    public async Task<IActionResult> ListarPorProfessor(int professorId)
    {
        try
        {
            var response = await _professorDisciplinaService.ListarPorProfessorAsync(professorId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [HttpDelete("{disciplinaId:int}/niveis/{nivelEnsinoId:int}")]
    public async Task<IActionResult> Remover(int professorId, int disciplinaId, int nivelEnsinoId)
    {
        try
        {
            await _professorDisciplinaService.RemoverAsync(professorId, disciplinaId, nivelEnsinoId);
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