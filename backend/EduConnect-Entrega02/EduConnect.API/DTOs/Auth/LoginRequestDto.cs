namespace EduConnect.Api.DTOs.Auth;

public class LoginRequestDto
{
    public string Registro { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}