namespace EduConnect.Api.Entities;

public class Administrador
{
    public int AdministradorId { get; set; }
    public int UsuarioId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Registro { get; set; } = string.Empty;

    public Usuario Usuario { get; set; } = null!;
}