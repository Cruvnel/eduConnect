using EduConnect.Api.DTOs.Upload;
using EduConnect.Api.Services.Interfaces;
using Microsoft.AspNetCore.Http;

namespace EduConnect.Api.Services;

public class UploadService : IUploadService
{
    private readonly IWebHostEnvironment _environment;

    public UploadService(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    public Task<UploadResponseDto> SalvarDocumentoAsync(IFormFile arquivo)
    {
        var extensoesPermitidas = new[] { ".pdf", ".jpg", ".jpeg", ".png" };
        return SalvarArquivoAsync(arquivo, "documentos", extensoesPermitidas);
    }

    public Task<UploadResponseDto> SalvarFotoAsync(IFormFile arquivo)
    {
        var extensoesPermitidas = new[] { ".jpg", ".jpeg", ".png" };
        return SalvarArquivoAsync(arquivo, "fotos", extensoesPermitidas);
    }

    public Task<UploadResponseDto> SalvarMaterialAsync(IFormFile arquivo)
    {
        var extensoesPermitidas = new[] { ".pdf" };
        return SalvarArquivoAsync(arquivo, "materiais", extensoesPermitidas);
    }

    private async Task<UploadResponseDto> SalvarArquivoAsync(
        IFormFile arquivo,
        string categoria,
        string[] extensoesPermitidas)
    {
        if (arquivo is null || arquivo.Length == 0)
            throw new ArgumentException("Arquivo não enviado.");

        var extensao = Path.GetExtension(arquivo.FileName).ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(extensao) || !extensoesPermitidas.Contains(extensao))
            throw new ArgumentException("Tipo de arquivo não permitido.");

        var webRootPath = _environment.WebRootPath;

        if (string.IsNullOrWhiteSpace(webRootPath))
            webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");

        var pastaDestino = Path.Combine(webRootPath, "uploads", categoria);

        if (!Directory.Exists(pastaDestino))
            Directory.CreateDirectory(pastaDestino);

        var nomeSalvo = $"{Guid.NewGuid()}{extensao}";
        var caminhoCompleto = Path.Combine(pastaDestino, nomeSalvo);

        using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
        {
            await arquivo.CopyToAsync(stream);
        }

        return new UploadResponseDto
        {
            NomeOriginal = arquivo.FileName,
            NomeSalvo = nomeSalvo,
            Url = $"/uploads/{categoria}/{nomeSalvo}",
            TamanhoBytes = arquivo.Length,
            Categoria = categoria
        };
    }
}