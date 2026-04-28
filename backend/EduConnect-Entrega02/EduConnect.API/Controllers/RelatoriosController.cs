using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class RelatoriosController : ControllerBase
{
    private readonly IRelatorioService _relatorioService;
    private readonly IRelatorioPdfService _relatorioPdfService;

    public RelatoriosController(
    IRelatorioService relatorioService,
    IRelatorioPdfService relatorioPdfService)
    {
        _relatorioService = relatorioService;
        _relatorioPdfService = relatorioPdfService;
    }

    [HttpGet("situacao-alunos")]
    public async Task<IActionResult> ObterSituacaoAlunos()
    {
        var response = await _relatorioService.ObterSituacaoAlunosAsync();
        return Ok(response);
    }

    [HttpGet("aprovacoes-por-turma")]
    public async Task<IActionResult> ObterAprovacoesPorTurma()
    {
        var response = await _relatorioService.ObterAprovacoesPorTurmaAsync();
        return Ok(response);
    }

    [HttpGet("media-por-disciplina")]
    public async Task<IActionResult> ObterMediaPorDisciplina()
    {
        var response = await _relatorioService.ObterMediaPorDisciplinaAsync();
        return Ok(response);
    }

    [HttpGet("frequencia-media")]
    public async Task<IActionResult> ObterFrequenciaMedia()
    {
        var response = await _relatorioService.ObterFrequenciaMediaAsync();
        return Ok(response);
    }

    [HttpGet("situacao-alunos/pdf")]
    public async Task<IActionResult> ObterSituacaoAlunosPdf()
    {
        var dados = await _relatorioService.ObterSituacaoAlunosAsync();
        var pdfBytes = _relatorioPdfService.GerarSituacaoAlunosPdf(dados);

        return File(pdfBytes, "application/pdf", "relatorio_situacao_alunos.pdf");
    }

    [HttpGet("aprovacoes-por-turma/pdf")]
    public async Task<IActionResult> ObterAprovacoesPorTurmaPdf()
    {
        var dados = await _relatorioService.ObterAprovacoesPorTurmaAsync();
        var pdfBytes = _relatorioPdfService.GerarAprovacoesPorTurmaPdf(dados);

        return File(pdfBytes, "application/pdf", "relatorio_aprovacoes_por_turma.pdf");
    }

    [HttpGet("media-por-disciplina/pdf")]
    public async Task<IActionResult> ObterMediaPorDisciplinaPdf()
    {
        var dados = await _relatorioService.ObterMediaPorDisciplinaAsync();
        var pdfBytes = _relatorioPdfService.GerarMediaPorDisciplinaPdf(dados);

        return File(pdfBytes, "application/pdf", "relatorio_media_por_disciplina.pdf");
    }

    [HttpGet("frequencia-media/pdf")]
    public async Task<IActionResult> ObterFrequenciaMediaPdf()
    {
        var dados = await _relatorioService.ObterFrequenciaMediaAsync();
        var pdfBytes = _relatorioPdfService.GerarFrequenciaMediaPdf(dados);

        return File(pdfBytes, "application/pdf", "relatorio_frequencia_media.pdf");
    }
}