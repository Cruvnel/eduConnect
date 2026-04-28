using EduConnect.Api.DTOs.InteresseMatricula;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InteressesMatriculaController : ControllerBase
{
    private readonly IInteresseMatriculaService _service;

    public InteressesMatriculaController(IInteresseMatriculaService service)
    {
        _service = service;
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] InteresseMatriculaCreateDto request)
    {
        try
        {
            var response = await _service.CriarAsync(request);
            return CreatedAtAction(nameof(ObterPorId), new { id = response.InteresseMatriculaId }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var response = await _service.ListarAsync();
        return Ok(response);
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var response = await _service.ObterPorIdAsync(id);

        if (response is null)
            return NotFound(new { mensagem = "Interesse de matrícula não encontrado." });

        return Ok(response);
    }

    [Authorize(Roles = "Administrador")]
    [HttpPatch("{id:int}/marcar-como-feito")]
    public async Task<IActionResult> MarcarComoFeito(int id)
    {
        try
        {
            var response = await _service.MarcarComoFeitoAsync(id);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }
}