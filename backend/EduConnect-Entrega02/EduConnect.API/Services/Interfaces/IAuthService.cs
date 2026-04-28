using EduConnect.Api.DTOs.Auth;

namespace EduConnect.Api.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthMeResponseDto?> ObterUsuarioAtualAsync(int usuarioId);
    Task EsqueciSenhaAsync(EsqueciSenhaRequestDto request);
    Task RedefinirSenhaAsync(RedefinirSenhaRequestDto request);
}