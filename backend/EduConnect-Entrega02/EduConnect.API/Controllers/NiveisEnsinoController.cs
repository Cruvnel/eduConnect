using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NiveisEnsinoController : ControllerBase
{
    private readonly INivelEnsinoService _nivelEnsinoService;

    public NiveisEnsinoController(INivelEnsinoService nivelEnsinoService)
    {
        _nivelEnsinoService = nivelEnsinoService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var response = await _nivelEnsinoService.ListarAsync();
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        try
        {
            var response = await _nivelEnsinoService.ObterPorIdAsync(id);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }
}