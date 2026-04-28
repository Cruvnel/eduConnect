using System.Security.Claims;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EduConnect.Api.DTOs.Responsavel;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResponsaveisController : ControllerBase
{
    private readonly IResponsavelService _responsavelService;
    private readonly IBoletimPdfService _boletimPdfService;
    public ResponsaveisController(
    IResponsavelService responsavelService,
    IBoletimPdfService boletimPdfService)
    {
        _responsavelService = responsavelService;
        _boletimPdfService = boletimPdfService;
    }

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/alunos")]
    public async Task<IActionResult> ListarMeusAlunos()
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _responsavelService.ListarMeusAlunosAsync(usuarioId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/alunos/{alunoId:int}/boletim")]
    public async Task<IActionResult> ObterBoletimAluno(int alunoId)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _responsavelService.ObterBoletimAlunoAsync(usuarioId, alunoId);
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

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/alunos/{alunoId:int}/frequencia")]
    public async Task<IActionResult> ObterFrequenciaAluno(
    int alunoId,
    [FromQuery] DateTime? dataInicio,
    [FromQuery] DateTime? dataFim)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _responsavelService.ObterFrequenciaAlunoAsync(
                usuarioId, alunoId, dataInicio, dataFim);

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

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/alunos/{alunoId:int}/ocorrencias")]
    public async Task<IActionResult> ObterOcorrenciasAluno(int alunoId)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _responsavelService.ObterOcorrenciasAlunoAsync(usuarioId, alunoId);
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

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/alunos/{alunoId:int}/agenda")]
    public async Task<IActionResult> ObterAgendaAluno(int alunoId)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _responsavelService.ObterAgendaAlunoAsync(usuarioId, alunoId);
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

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/financeiro")]
    public async Task<IActionResult> ObterMeuFinanceiro()
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var response = await _responsavelService.ObterMeuFinanceiroAsync(usuarioId);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/alunos/{alunoId:int}/boletim/pdf")]
    public async Task<IActionResult> ObterBoletimAlunoPdf(int alunoId)
    {
        try
        {
            var usuarioIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? User.FindFirstValue("sub");

            if (string.IsNullOrWhiteSpace(usuarioIdClaim) || !int.TryParse(usuarioIdClaim, out var usuarioId))
                return Unauthorized(new { mensagem = "Usuário autenticado inválido." });

            var boletim = await _responsavelService.ObterBoletimAlunoAsync(usuarioId, alunoId);
            var pdfBytes = _boletimPdfService.GerarBoletimPdf(boletim);

            var nomeArquivo = $"boletim_{boletim.Registro}.pdf";
            return File(pdfBytes, "application/pdf", nomeArquivo);
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

    [Authorize(Roles = "Responsavel")]
    [HttpGet("me/publicacoes")]
    public async Task<IActionResult> ListarPublicacoes()
    {
        var response = await _responsavelService.ListarPublicacoesAsync();
        return Ok(response);
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var response = await _responsavelService.ListarAsync();
        return Ok(response);
    }

    [Authorize(Roles = "Administrador")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> ObterPorId(int id)
    {
        try
        {
            var response = await _responsavelService.ObterPorIdAsync(id);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
    }

    [Authorize(Roles = "Administrador")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Atualizar(int id, [FromBody] ResponsavelUpdateDto request)
    {
        try
        {
            var response = await _responsavelService.AtualizarAsync(id, request);
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
}