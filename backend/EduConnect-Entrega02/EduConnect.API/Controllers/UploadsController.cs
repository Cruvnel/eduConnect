using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadsController : ControllerBase
{
    private readonly IUploadService _uploadService;

    public UploadsController(IUploadService uploadService)
    {
        _uploadService = uploadService;
    }

    [AllowAnonymous]
    [HttpPost("documentos")]
    public async Task<IActionResult> UploadDocumento(IFormFile arquivo)
    {
        try
        {
            var response = await _uploadService.SalvarDocumentoAsync(arquivo);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpPost("fotos")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> UploadFoto(IFormFile arquivo)
    {
        try
        {
            var response = await _uploadService.SalvarFotoAsync(arquivo);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpPost("materiais")]
    [Authorize(Roles = "Professor")]
    public async Task<IActionResult> UploadMaterial(IFormFile arquivo)
    {
        try
        {
            var response = await _uploadService.SalvarMaterialAsync(arquivo);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }
}