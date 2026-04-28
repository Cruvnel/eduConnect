namespace EduConnect.Api.DTOs.Auth;

public class AuthMeResponseDto
{
    public int UsuarioId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Perfil { get; set; } = string.Empty;
    public string Registro { get; set; } = string.Empty;
}