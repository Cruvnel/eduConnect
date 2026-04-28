using EduConnect.Api.Entities;

namespace EduConnect.Api.Services.Interfaces;

public interface ITokenService
{
    string GerarToken(Usuario usuario, string perfil, string nome);
}