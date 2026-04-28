namespace EduConnect.Api.DTOs.Responsavel;

public class ResponsavelAdminResponseDto
{
    public int ResponsavelId { get; set; }
    public int UsuarioId { get; set; }

    public string Registro { get; set; } = string.Empty;
    public string NomeCompleto { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string EmailContato { get; set; } = string.Empty;

    public bool Ativo { get; set; }

    public List<ResponsavelAlunoResumoAdminDto> Alunos { get; set; } = new();
}