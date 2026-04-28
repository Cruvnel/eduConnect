namespace EduConnect.Api.Entities;

public class Responsavel
{
    public int ResponsavelId { get; set; }
    public int UsuarioId { get; set; }
    public string NomeCompleto { get; set; } = string.Empty;
    public string Registro { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string EmailContato { get; set; } = string.Empty;

    public Usuario Usuario { get; set; } = null!;
    public ICollection<ResponsavelAluno> ResponsaveisAlunos { get; set; } = new List<ResponsavelAluno>();
    public ICollection<Mensalidade> Mensalidades { get; set; } = new List<Mensalidade>();
}