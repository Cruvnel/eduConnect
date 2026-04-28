using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EduConnect.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrador")]
public class AdministradoresController : ControllerBase
{
    [HttpGet("teste")]
    public IActionResult Teste()
    {
        return Ok(new { mensagem = "Acesso permitido para administrador." });
    }
}