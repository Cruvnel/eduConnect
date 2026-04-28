using EduConnect.Api.DTOs.Upload;
using Microsoft.AspNetCore.Http;

namespace EduConnect.Api.Services.Interfaces;

public interface IUploadService
{
    Task<UploadResponseDto> SalvarDocumentoAsync(IFormFile arquivo);
    Task<UploadResponseDto> SalvarFotoAsync(IFormFile arquivo);
    Task<UploadResponseDto> SalvarMaterialAsync(IFormFile arquivo);
}